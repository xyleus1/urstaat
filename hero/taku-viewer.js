import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { createTakuBackdrop } from './taku-backdrop.js';
import { applyTakuMaterials } from './taku-material.js';
import { createSoftwareStudio, prefersSoftwareStudio } from './taku-software-studio.js';
import { batchTakuMeshes } from './taku-draw.js';
import { bilateral, createTakuOutline, identifySurface, partCode, preservePartMask } from './taku-outline.js';
import { dressTakuJoints } from './taku-joint-detail.js';

// Target, eye direction, and vertical framing (metres) for the neutral CAD pose.
// Each production model also carries camera anchors for its particular arm pose.
const shots = {
  overview: [[.04, .65, 0], [1.05, .32, -.72], 1.62],
  side: [[.02, .65, 0], [.02, .12, -1], 1.61],
  face: [[.067, 1.262, 0], [1, .10, -.21], .29],
  shoulder: [[.015, 1.062, -.178], [.58, .20, -1], .265],
  elbow: [[-.033, .847, -.205], [.34, .09, -1], .195],
  wrist: [[-.088, .593, -.197], [-.45, -.18, -1], .162],
  claw: [[-.137, .424, -.194], [-.66, -.12, -1], .242],
  waist: [[.025, .57, 0], [.12, .18, -1], .60],
  base: [[.26, .08, -.20], [.55,-.90,-1], .33],
};
export const TAKU_VIEWS = Object.freeze(Object.keys(shots));
const armViews = bilateral;

function ground(scene, bounds) {
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const geometry = new THREE.PlaneGeometry(size.x * 1.9, size.z * 1.9);
  const material = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, ...preservePartMask(THREE),
    vertexShader: 'varying vec2 p; void main(){p=uv*2.-1.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: 'varying vec2 p; void main(){float r=dot(p,p);float a=.66*exp(-5.2*r)*(1.-smoothstep(.55,1.,r));gl_FragColor=vec4(.009,.011,.012,a);}',
  });
  const plane = new THREE.Mesh(geometry, material);
  plane.rotation.x = -Math.PI / 2;
  plane.position.set(center.x, bounds.min.y - .001, center.z);
  plane.renderOrder = -10;
  scene.add(plane);
  return () => { geometry.dispose(); material.dispose(); };
}

function releaseRobot(robot) {
  const resources = new Set();
  robot?.traverse(node => {
    if (!node.isMesh) return;
    resources.add(node.geometry);
    for (const mat of [].concat(node.material)) {
      resources.add(mat);
      for (const value of Object.values(mat)) if (value?.isTexture) resources.add(value);
    }
  });
  for (const item of resources) item.dispose();
}

export async function mountTaku({
  canvas, assetUrl, assetData, mobile = false, initialView = 'overview', initialSide = 'left', lighting = 'auto',
  antialiasing = 'auto',
  onViewChange, onSettled, onReady, onError, onInspect,
}) {
  // The scene's MSAA and depth buffer belong to the offscreen studio target.
  // The visible framebuffer receives only the composited full-resolution image.
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, depth: false,
    premultipliedAlpha: false, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .99;
  // The render target contains display-encoded RGB and the visible selection mask.
  renderer.setClearColor(new THREE.Color(16/255,20/255,21/255),0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, .009, 22);
  const controls = new OrbitControls(camera, canvas);
  controls.minDistance = .08;
  controls.maxDistance = 5.5;
  controls.maxPolarAngle = Math.PI * .88;
  controls.enablePan = false;
  controls.enableDamping = false;
  // Let mobile browsers claim a vertical page gesture while retaining horizontal orbit and pinch.
  canvas.style.touchAction = 'pan-y';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const listeners = new AbortController();
  const { signal } = listeners;
  let texture, freeMaterials, batches, softwareStudio;
  const softwareAA = antialiasing === 'software' || (antialiasing === 'auto' && prefersSoftwareStudio(renderer));
  const outline = createTakuOutline(THREE,renderer,softwareAA);
  const activePart = {value: -1}, partBoxes = new Map();
  const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
  const hitMetadata = new WeakMap(), anchors = new Map();
  const pickBounds = [];
  const activePointers = new Set();
  let robot, bounds, backdrop, freeGround, resizeObserver, visibilityObserver, down;
  let id = Object.hasOwn(shots, initialView) ? initialView : 'overview';
  let side = initialSide === 'right' && armViews.has(id) ? 'right' : 'left';
  let desired, transition, frame = 0, dead = false, canRender = false, onscreen = true, userAdjusted = false;
  let width = 0, height = 0, renderedFrames = 0;

  function invalidate() {
    if (canRender && !dead && !frame && onscreen && !document.hidden) frame = requestAnimationFrame(draw);
  }
  function draw(now) {
    frame = 0;
    if (dead || !desired || document.hidden || !onscreen) return;
    let finished = false;
    if (transition) {
      const t = Math.min(1, (now - transition.start) / 640);
      const ease = t * t * (3 - 2 * t);
      controls.target.lerpVectors(transition.target, desired.target, ease);
      const phi = THREE.MathUtils.lerp(transition.from.phi, transition.to.phi, ease);
      const theta = transition.from.theta + transition.deltaTheta * ease;
      const radius = Math.exp(THREE.MathUtils.lerp(Math.log(transition.from.radius), Math.log(transition.to.radius), ease));
      camera.position.setFromSphericalCoords(radius, phi, theta).add(controls.target);
      controls.update();
      if (t < 1) invalidate();
      else { transition = null; finished = true; }
    }
    camera.updateMatrixWorld();
    softwareStudio?.update(camera, controls.target);
    backdrop?.update(camera,id,desired,controls.target);
    batches?.updateVisible(camera);
    outline.render(scene,camera,partBoxes.get(activePart.value),bounds);
    renderedFrames++;
    if (finished) onSettled?.(id, side);
  }
  function pose() {
    const [fallback, direction, span] = shots[id];
    const target = new THREE.Vector3(...fallback);
    const ray = new THREE.Vector3(...direction);
    if (side === 'right') { target.z *= -1; ray.z *= -1; }
    const anchor = anchors.get(id + ':' + side) || anchors.get(id);
    if (anchor) {
      anchor.getWorldPosition(target);
      if (side === 'right' && !anchors.has(id + ':right')) target.z *= -1;
    }
    if (id==='wrist') {
      robot.getObjectByName(side+'_wrist_inspection_interface')?.getWorldPosition(target);
    } else if (id==='base') {
      partBoxes.get(activePart.value)?.getCenter(target);
    }
    let viewSpan = span;
    if (id === 'overview' || id === 'side') {
      const center = bounds.getCenter(new THREE.Vector3());
      const size = bounds.getSize(new THREE.Vector3());
      viewSpan = Math.max(size.y * 1.19, Math.max(size.z, size.x) * 1.1 / camera.aspect);
      target.copy(center);
    }
    const distance = viewSpan / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)) * Math.max(1, .84 / camera.aspect);
    return { target, position: ray.normalize().multiplyScalar(distance).add(target) };
  }
  function setView(name, { immediate = false, side: nextSide = 'left' } = {}) {
    if (dead || !Object.hasOwn(shots, name)) return;
    id = name;
    side = nextSide === 'right' && armViews.has(name) ? 'right' : 'left';
    activePart.value = partCode(id,side);
    desired = pose(); userAdjusted = false;
    onViewChange?.(id, armViews.has(id) ? side : undefined);
    if (immediate || reduced.matches) {
      transition = null;
      controls.target.copy(desired.target);
      camera.position.copy(desired.position);
      controls.update(); invalidate(); onSettled?.(id, side);
    } else {
      const from = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
      const to = new THREE.Spherical().setFromVector3(desired.position.clone().sub(desired.target));
      const deltaTheta = Math.atan2(Math.sin(to.theta - from.theta), Math.cos(to.theta - from.theta));
      transition = { start: performance.now(), target: controls.target.clone(), from, to, deltaTheta };
      invalidate();
    }
  }
  function resize() {
    if (dead) return;
    const box = canvas.getBoundingClientRect();
    if (!box.width || !box.height || (width === box.width && height === box.height)) return;
    width = box.width; height = box.height;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 1.75));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    if (userAdjusted) { desired = pose(); invalidate(); }
    else setView(id, { side, immediate: true });
  }
  function interrupt() {
    transition = null; userAdjusted = true;
  }
  function inspect() {
    if (!dead) onInspect?.(id,armViews.has(id) ? side : undefined);
  }
  function zoom(factor) {
    if (dead || !Number.isFinite(factor) || factor <= 0) return;
    interrupt();
    const offset = camera.position.clone().sub(controls.target);
    offset.setLength(THREE.MathUtils.clamp(offset.length() / factor, controls.minDistance, controls.maxDistance));
    camera.position.copy(controls.target).add(offset); controls.update(); invalidate();
  }
  function orbitStep(yaw, pitch) {
    if (dead) return;
    interrupt();
    const orbit = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
    orbit.theta += yaw;
    orbit.phi = THREE.MathUtils.clamp(orbit.phi + pitch, .01, controls.maxPolarAngle);
    camera.position.setFromSpherical(orbit).add(controls.target); controls.update(); invalidate();
  }
  function pointRay(event) {
    const box = canvas.getBoundingClientRect();
    pointer.set((event.clientX - box.left) / box.width * 2 - 1, 1 - (event.clientY - box.top) / box.height * 2);
    raycaster.setFromCamera(pointer, camera);
  }
  function pick(event) {
    pointRay(event);
    const hit = raycaster.intersectObject(robot, true)[0];
    if (!hit) return null;
    const info = hitMetadata.get(hit.object);
    if (info) return info;
    return null;
  }
  function dispose() {
    if (dead) return;
    dead = true; cancelAnimationFrame(frame); listeners.abort();
    resizeObserver?.disconnect(); visibilityObserver?.disconnect();
    controls.removeEventListener('change', invalidate);
    controls.dispose(); backdrop?.dispose(); freeGround?.(); freeMaterials?.(); batches?.dispose(); outline.dispose();
    releaseRobot(robot); softwareStudio?.dispose(); texture?.dispose(); renderer.dispose();
    canvas.style.removeProperty('cursor');
  }
  function fail(error) { dispose(); onError?.(error); }
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    fail(new Error('The Dyna Taku graphics context was lost.'));
  }, { signal });
  try {
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    async function loadStudio() {
      const images = new THREE.TextureLoader();
      if (prefersSoftwareStudio(renderer,lighting)) {
        try {
          const captures = await images.loadAsync(new URL('taku-finishes.webp',assetUrl).href);
          if (dead) captures.dispose();
          else softwareStudio=createSoftwareStudio(THREE,captures);
          return;
        } catch { /* The regular studio also supports software WebGL. */ }
      }
      try {
        const atlas = await images.loadAsync(new URL('taku-studio.png',assetUrl).href);
        if (dead) { atlas.dispose(); return; }
        texture = atlas;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.generateMipmaps = false;
        texture.minFilter = texture.magFilter = THREE.LinearFilter;
      } catch { /* The directional lights work without the reflection map. */ }
    }
    const model = assetData
      ? assetData.then(buffer => loader.parseAsync(buffer, new URL('.', assetUrl).href))
      : loader.loadAsync(assetUrl);
    const [gltf] = await Promise.all([model, loadStudio()]);
    if (dead) { releaseRobot(gltf.scene); throw new Error('Model loading was interrupted.'); }
    robot = gltf.scene;
    robot.updateWorldMatrix(true,true);
    dressTakuJoints(THREE,robot,mobile);
    robot.updateWorldMatrix(true,true);
    bounds = new THREE.Box3().setFromObject(robot);
    robot.traverse(node => {
      const name = node.name.toLowerCase();
      const anchorName = /^view_(?:(right)_)?(face|shoulder|elbow|wrist|claw|waist|base)$/.exec(name);
      if (anchorName) anchors.set(anchorName[2] + (anchorName[1] ? ':right' : ''), node);
      if (!node.isMesh) return;
      const info = identifySurface(node);
      if (!info) return;
      hitMetadata.set(node,info);
      if (!node.geometry.boundingBox) node.geometry.computeBoundingBox();
      const box = node.geometry.boundingBox.clone().applyMatrix4(node.matrixWorld);
      pickBounds.push(box);
      if (info.code) {
        if (!partBoxes.has(info.code)) partBoxes.set(info.code,new THREE.Box3());
        partBoxes.get(info.code).union(box);
      }
    });
    freeMaterials = applyTakuMaterials(THREE,robot,texture,activePart,softwareStudio,softwareAA);
    batches = batchTakuMeshes(THREE,robot,hitMetadata);
    scene.add(batches.group);
    freeGround = ground(scene, bounds);
    backdrop = createTakuBackdrop({ THREE, scene, renderer, mobile, reducedMotion: reduced, invalidate });
    controls.addEventListener('change', invalidate);
    canvas.addEventListener('wheel', interrupt, { signal, passive: true });
    resizeObserver = new ResizeObserver(resize); resizeObserver.observe(canvas);
    visibilityObserver = new IntersectionObserver(([entry]) => {
      onscreen = entry.isIntersecting;
      if (onscreen) invalidate();
    });
    visibilityObserver.observe(canvas);
    document.addEventListener('visibilitychange', invalidate, { signal });
    reduced.addEventListener('change', () => { if (reduced.matches && transition) setView(id, { side, immediate: true }); }, { signal });
    canvas.addEventListener('pointerdown', event => {
      activePointers.add(event.pointerId);
      if (activePointers.size === 1 && event.button === 0) down = { id: event.pointerId, x: event.clientX, y: event.clientY };
      else { down = null; if (activePointers.size > 1) interrupt(); }
    }, { signal });
    canvas.addEventListener('pointermove', event => {
      if (down && Math.hypot(event.clientX - down.x, event.clientY - down.y) > 5) { down = null; interrupt(); }
      if (fine.matches && !activePointers.size && event.pointerType === 'mouse') {
        pointRay(event);
        const activeBox=partBoxes.get(activePart.value);
        if (activeBox && raycaster.ray.intersectsBox(activeBox)) canvas.style.cursor='pointer';
        else canvas.style.cursor = pickBounds.some(box => raycaster.ray.intersectsBox(box)) ? 'zoom-in' : 'grab';
      }
    }, { signal });
    canvas.addEventListener('pointerup', event => {
      activePointers.delete(event.pointerId);
      if (down?.id === event.pointerId && !activePointers.size && Math.hypot(event.clientX - down.x, event.clientY - down.y) <= 5) {
        const hit = pick(event);
        const onOutline = onInspect && (hit?.code === activePart.value ||
          outline.containsVisibleEdge((pointer.x+1)*.5,(pointer.y+1)*.5));
        if (onOutline) inspect();
        else if (hit) setView(hit.id, { side: hit.side });
      }
      down = null;
    }, { signal });
    canvas.addEventListener('pointercancel', event => { activePointers.delete(event.pointerId); down = null; }, { signal });
    canvas.addEventListener('keydown', event => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      switch (event.key) {
        case 'Enter': case ' ': if (onInspect) inspect(); else return; break;
        case 'Home': setView('overview'); break;
        case '+': case '=': zoom(1.2); break;
        case '-': zoom(1 / 1.2); break;
        case 'ArrowLeft': orbitStep(-.085, 0); break;
        case 'ArrowRight': orbitStep(.085, 0); break;
        case 'ArrowUp': orbitStep(0, -.085); break;
        case 'ArrowDown': orbitStep(0, .085); break;
        default: return;
      }
      event.preventDefault();
    }, { signal });
    resize();
    await backdrop.ready;
    if (dead) throw new Error('Viewer initialization was interrupted.');
    canRender = true;
    draw(performance.now());
    const controller = {
      setView, zoom, orbitStep, inspect, reset: () => setView('overview'), dispose,
      getState: () => ({ currentView: id, side, transitioning: !!transition, renderedFrames,
        camera: camera.position.toArray(), target: controls.target.toArray(), dpr: renderer.getPixelRatio(),
        selectedPart: activePart.value, lighting: softwareStudio ? 'software' : 'ggx',
        antialiasing: softwareAA ? 'software' : 'msaa',
        triangles: batches.group.children.reduce((sum,m)=>sum+m.geometry.index.count/3,0) }),
    };
    onReady?.(controller);
    return controller;
  } catch (error) {
    if (!dead) fail(error);
    throw error;
  }
}

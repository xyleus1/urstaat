import { zoomRange, zoomAvailability } from '../research/part-2/taku-composition.js';
import { installZoomGestures } from '../research/part-2/taku-gestures.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { applyTakuMaterials } from './taku-material.js';
import { createSoftwareStudio, prefersSoftwareStudio } from './taku-software-studio.js';
import { batchTakuMeshes } from './taku-draw.js';
import { bilateral, createTakuOutline, identifySurface, partCode } from './taku-outline.js';
import { dressTakuJoints } from './taku-joint-detail.js';

// Target, eye direction, and vertical framing (metres) for the neutral CAD pose.
// Each production model also carries camera anchors for its particular arm pose.
const shots = {
  overview: [[0.04, 0.65, 0], [1.05, 0.32, -0.72], 1.62],
  side: [[0.02, 0.65, 0], [0.02, 0.12, -1], 1.61],
  face: [[0.067, 1.262, 0], [1, 0.1, -0.21], 0.29],
  shoulder: [[0.015, 1.062, -0.178], [0.58, 0.2, -1], 0.265],
  elbow: [[-0.033, 0.847, -0.205], [0.34, 0.09, -1], 0.195],
  wrist: [[-0.088, 0.593, -0.197], [-0.45, -0.18, -1], 0.162],
  claw: [[-0.137, 0.424, -0.194], [-0.66, -0.12, -1], 0.242],
  waist: [[0.025, 0.57, 0], [0.12, 0.18, -1], 0.6],
  base: [[0.26, 0.08, -0.2], [0.55, -0.9, -1], 0.33],
};
export const TAKU_VIEWS = Object.freeze(Object.keys(shots));
const armViews = bilateral;

function ground(scene, bounds) {
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const geometry = new THREE.PlaneGeometry(size.x * 1.9, size.z * 1.9);
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,

    vertexShader:
      'varying vec2 p; void main(){p=uv*2.-1.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:
      'layout(location=1) out highp vec4 partData; varying vec2 p; void main(){float r=dot(p,p);float a=.4*exp(-5.2*r)*(1.-smoothstep(.55,1.,r));gl_FragColor=vec4(.009,.011,.012,a);partData=vec4(0.);}',
  });
  const plane = new THREE.Mesh(geometry, material);
  plane.rotation.x = -Math.PI / 2;
  plane.position.set(center.x, bounds.min.y - 0.001, center.z);
  plane.renderOrder = -10;
  scene.add(plane);
  return () => {
    geometry.dispose();
    material.dispose();
  };
}

function releaseRobot(robot) {
  const resources = new Set();
  robot?.traverse((node) => {
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
  canvas,
  assetUrl,
  assetData,
  mobile = false,
  initialView = 'overview',
  initialSide = 'left',
  initialEngaged = false,
  previous,
  lighting = 'auto',
  antialiasing = 'auto',
  onViewChange,
  onSettled,
  onReady,
  onError,
  onInspect,
  onProjection,
  onAnchors,
  onPick,
  onZoomChange,
  onSlow,
}) {
  // The scene's MSAA and depth buffer belong to the offscreen studio target.
  // The visible framebuffer receives only the composited full-resolution image.
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    depth: false,
    premultipliedAlpha: false,
    powerPreference: 'high-performance',
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.99;
  // The render target contains display-encoded RGB and the visible selection mask.
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.009, 22);
  const controls = new OrbitControls(camera, canvas);
  controls.minDistance = 0.08;
  controls.maxDistance = 5.5;
  controls.maxPolarAngle = Math.PI * 0.88;
  controls.enablePan = false;
  controls.enableDamping = false;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const listeners = new AbortController();
  const { signal } = listeners;
  let freeMaterials, batches, softwareStudio, limits;
  const softwareAA =
    antialiasing === 'software' || (antialiasing === 'auto' && prefersSoftwareStudio(renderer));
  const outline = createTakuOutline(THREE, renderer, softwareAA);
  const activePart = { value: -1 },
    partBoxes = new Map();
  const raycaster = new THREE.Raycaster(),
    pointer = new THREE.Vector2();
  const hitMetadata = new WeakMap(),
    anchors = new Map();
  const pickBounds = [];
  const activePointers = new Set();
  let robot, bounds, freeGround, resizeObserver, visibilityObserver, down;
  let id = Object.hasOwn(shots, initialView) ? initialView : 'overview';
  let side = initialSide === 'right' && armViews.has(id) ? 'right' : 'left';
  let selected = id,
    selectedSide = side;
  let desired,
    transition,
    frame = 0,
    dead = false,
    canRender = false,
    onscreen = true,
    userAdjusted = false;
  let width = 0,
    height = 0,
    renderedFrames = 0;
  const gl = renderer.getContext(),
    projectedPart = new THREE.Vector3();
  let shotRevision = 0,
    presentedRevision = -1;
  const anchorWaiters = new Set();
  let fence,
    firstPoll = 0,
    blockedFrames = 0;
  let hoverFrame = 0,
    hoverPoint;

  setEngaged(initialEngaged);

  function invalidate() {
    if (canRender && !dead && !frame && onscreen && !document.hidden) frame = requestAnimationFrame(draw);
  }
  function draw(now) {
    frame = 0;
    if (dead || !desired || document.hidden || !onscreen) return;
    // Never queue obsolete camera poses behind an unfinished GPU frame. Read its
    // fence with a zero timeout; ongoing drag events keep updating the camera.
    if (onSlow && fence) {
      const state = gl.clientWaitSync(fence, 0, 0);
      if (state === gl.TIMEOUT_EXPIRED) {
        if (!firstPoll) firstPoll = now;
        if (now - firstPoll > 500) {
          queueMicrotask(onSlow);
          return;
        }
        invalidate();
        return;
      }
      gl.deleteSync(fence);
      fence = null;
      if (firstPoll && now - firstPoll > 60) blockedFrames++;
      else blockedFrames = Math.max(0, blockedFrames - 1);
      firstPoll = 0;
      if (blockedFrames >= 4) {
        queueMicrotask(onSlow);
        return;
      }
    }
    let finished = false;
    if (transition) {
      const t = Math.min(1, (now - transition.start) / 640);
      const ease = t * t * (3 - 2 * t);
      controls.target.lerpVectors(transition.target, desired.target, ease);
      const phi = THREE.MathUtils.lerp(transition.from.phi, transition.to.phi, ease);
      const theta = transition.from.theta + transition.deltaTheta * ease;
      const radius = Math.exp(
        THREE.MathUtils.lerp(Math.log(transition.from.radius), Math.log(transition.to.radius), ease),
      );
      camera.position.setFromSphericalCoords(radius, phi, theta).add(controls.target);
      controls.update();
      if (t < 1) invalidate();
      else {
        transition = null;
        controls.minDistance = limits.min;
        controls.maxDistance = limits.max;
        finished = true;
      }
    }
    camera.updateMatrixWorld();
    softwareStudio?.update(camera, controls.target);
    batches?.updateVisible(camera);
    outline.render(scene, camera, partBoxes.get(activePart.value), bounds);
    if (onSlow) {
      fence = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
    }
    const centers = new Map();
    for (const [code, box] of partBoxes) {
      box.getCenter(projectedPart).project(camera);
      centers.set(code, { x: (1 + projectedPart.x) / 2, y: (1 - projectedPart.y) / 2 });
    }
    const orientation = { yaw: controls.getAzimuthalAngle(), pitch: Math.PI / 2 - controls.getPolarAngle() };
    const submittedRevision = shotRevision;
    outline
      .readAnchors(centers, (list) => {
        if (dead || submittedRevision !== shotRevision) return;
        presentedRevision = submittedRevision;
        onAnchors?.(list, orientation);
        if (!frame && !transition) {
          for (const resolve of anchorWaiters) resolve(list);
          anchorWaiters.clear();
        }
        const point = list.find((p) => p.id === selected && p.side === selectedSide);
        onProjection?.(point ? { ...point, visible: true } : { x: 0, y: 0, visible: false });
      })
      .catch((error) => {
        if (!dead) fail(error);
      });
    if (limits) onZoomChange?.(zoomAvailability(limits, camera.position.distanceTo(controls.target)));
    renderedFrames++;
    if (finished) onSettled?.(id, side);
  }
  function anchorsReady() {
    if (dead) return Promise.resolve([]);
    if (frame || transition || presentedRevision !== shotRevision) {
      return new Promise((resolve) => anchorWaiters.add(resolve));
    }
    return outline.anchorsReady();
  }
  function pose() {
    const [fallback, direction, span] = shots[id];
    const target = new THREE.Vector3(...fallback);
    const ray = new THREE.Vector3(...direction);
    if (side === 'right') {
      target.z *= -1;
      ray.z *= -1;
    }
    const anchor = anchors.get(id + ':' + side) || anchors.get(id);
    if (anchor) {
      anchor.getWorldPosition(target);
      if (side === 'right' && !anchors.has(id + ':right')) target.z *= -1;
    }
    if (id === 'wrist') {
      robot.getObjectByName(side + '_wrist_inspection_interface')?.getWorldPosition(target);
    } else if (id === 'base') {
      partBoxes.get(partCode(id, side))?.getCenter(target);
    }
    let viewSpan = span;
    if (id === 'overview' || id === 'side') {
      const center = bounds.getCenter(new THREE.Vector3());
      const size = bounds.getSize(new THREE.Vector3());
      viewSpan = Math.max(size.y * 1.19, (Math.max(size.z, size.x) * 1.1) / camera.aspect);
      target.copy(center);
    }
    const distance =
      (viewSpan / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2))) *
      Math.max(1, 0.84 / camera.aspect);
    return { target, position: ray.normalize().multiplyScalar(distance).add(target) };
  }
  function selectPart(name, which = 'left') {
    if (!Object.hasOwn(shots, name) || dead) return;
    selected = name;
    selectedSide = bilateral.has(name) && which === 'right' ? 'right' : 'left';
    activePart.value = partCode(selected, selectedSide);
    invalidate();
  }
  function setEngaged(value) {
    controls.enabled = Boolean(value);
    if (!controls.enabled) {
      down = null;
      activePointers.clear();
    }
    canvas.style.touchAction = value ? 'none' : 'pan-y pinch-zoom';
    canvas.style.cursor = value ? 'grab' : '';
  }
  function setView(name, { immediate = false, side: nextSide = 'left' } = {}) {
    if (dead || !Object.hasOwn(shots, name)) return;
    shotRevision++;
    id = name;
    side = nextSide === 'right' && armViews.has(name) ? 'right' : 'left';
    selectPart(id, side);
    desired = pose();
    limits = zoomRange(id, desired.position.distanceTo(desired.target));
    controls.minDistance = limits.min;
    controls.maxDistance = limits.max;
    userAdjusted = false;
    onViewChange?.(id, armViews.has(id) ? side : undefined);
    if (immediate || reduced.matches) {
      transition = null;
      controls.target.copy(desired.target);
      camera.position.copy(desired.position);
      controls.update();
      invalidate();
      onSettled?.(id, side);
    } else {
      const from = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
      const to = new THREE.Spherical().setFromVector3(desired.position.clone().sub(desired.target));
      const deltaTheta = Math.atan2(Math.sin(to.theta - from.theta), Math.cos(to.theta - from.theta));
      controls.minDistance = Math.min(limits.min, from.radius);
      controls.maxDistance = Math.max(limits.max, from.radius);
      transition = { start: performance.now(), target: controls.target.clone(), from, to, deltaTheta };
      invalidate();
    }
  }
  function resize() {
    if (dead) return;
    const box = canvas.getBoundingClientRect();
    if (!box.width || !box.height || (width === box.width && height === box.height)) return;
    width = box.width;
    height = box.height;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 1.75));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    if (userAdjusted) {
      const oldDefault = desired.position.distanceTo(desired.target);
      desired = pose();
      const newDefault = desired.position.distanceTo(desired.target);
      limits = zoomRange(id, newDefault);
      controls.minDistance = limits.min;
      controls.maxDistance = limits.max;
      camera.position
        .sub(controls.target)
        .multiplyScalar(newDefault / oldDefault)
        .add(controls.target);
      controls.update();
      invalidate();
    } else {
      const prior = [selected, selectedSide];
      setView(id, { side, immediate: true });
      selectPart(...prior);
    }
  }
  function interrupt() {
    if (limits) {
      controls.minDistance = limits.min;
      controls.maxDistance = limits.max;
    }
    transition = null;
    userAdjusted = true;
  }
  function inspect() {
    if (!dead) (onInspect || onPick)?.(selected, selectedSide);
  }
  function zoom(factor) {
    if (dead || !Number.isFinite(factor) || factor <= 0) return;
    interrupt();
    const offset = camera.position.clone().sub(controls.target);
    offset.setLength(
      THREE.MathUtils.clamp(offset.length() / factor, controls.minDistance, controls.maxDistance),
    );
    camera.position.copy(controls.target).add(offset);
    controls.update();
    invalidate();
  }
  function orbitStep(yaw, pitch) {
    if (dead) return;
    interrupt();
    const orbit = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
    orbit.theta += yaw;
    orbit.phi = THREE.MathUtils.clamp(orbit.phi + pitch, 0.01, controls.maxPolarAngle);
    camera.position.setFromSpherical(orbit).add(controls.target);
    controls.update();
    invalidate();
  }
  function pointRay(event) {
    const box = canvas.getBoundingClientRect();
    pointer.set(
      ((event.clientX - box.left) / box.width) * 2 - 1,
      1 - ((event.clientY - box.top) / box.height) * 2,
    );
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
  function pickAt(clientX, clientY) {
    const hit = pick({ clientX, clientY });
    if (!hit) return;
    selectPart(hit.id, hit.side);
    onPick?.(selected, selectedSide);
  }
  function dispose() {
    if (dead) return;
    dead = true;
    for (const resolve of anchorWaiters) resolve([]);
    anchorWaiters.clear();
    cancelAnimationFrame(frame);
    listeners.abort();
    cancelAnimationFrame(hoverFrame);
    if (fence) gl.deleteSync(fence);
    resizeObserver?.disconnect();
    visibilityObserver?.disconnect();
    controls.removeEventListener('change', invalidate);
    controls.dispose();
    freeGround?.();
    freeMaterials?.();
    batches?.dispose();
    outline.dispose();
    releaseRobot(robot);
    softwareStudio?.dispose();
    renderer.dispose();
    canvas.style.removeProperty('cursor');
  }
  function fail(error) {
    dispose();
    onError?.(error);
  }
  canvas.addEventListener(
    'webglcontextlost',
    (event) => {
      event.preventDefault();
      fail(new Error('The Dyna Taku graphics context was lost.'));
    },
    { signal },
  );
  try {
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    async function loadStudio() {
      const images = new THREE.TextureLoader();
      if (prefersSoftwareStudio(renderer, lighting)) {
        try {
          const captures = await images.loadAsync(new URL('taku-finishes.webp?v=studio-3', assetUrl).href);
          if (dead) captures.dispose();
          else softwareStudio = createSoftwareStudio(THREE, captures);
          return;
        } catch {
          /* The regular studio also supports software WebGL. */
        }
      }
    }
    const model = assetData
      ? assetData.then((buffer) => loader.parseAsync(buffer, new URL('.', assetUrl).href))
      : loader.loadAsync(assetUrl);
    const [gltf] = await Promise.all([model, loadStudio()]);
    if (dead) {
      releaseRobot(gltf.scene);
      throw new Error('Model loading was interrupted.');
    }
    robot = gltf.scene;
    robot.updateWorldMatrix(true, true);
    dressTakuJoints(THREE, robot, mobile);
    robot.updateWorldMatrix(true, true);
    bounds = new THREE.Box3().setFromObject(robot);
    robot.traverse((node) => {
      const name = node.name.toLowerCase();
      const anchorName = /^view_(?:(right)_)?(face|shoulder|elbow|wrist|claw|waist|base)$/.exec(name);
      if (anchorName) anchors.set(anchorName[2] + (anchorName[1] ? ':right' : ''), node);
      if (!node.isMesh) return;
      const info = identifySurface(node);
      if (!info) return;
      hitMetadata.set(node, info);
      if (!node.geometry.boundingBox) node.geometry.computeBoundingBox();
      const box = node.geometry.boundingBox.clone().applyMatrix4(node.matrixWorld);
      pickBounds.push(box);
      if (info.code) {
        if (!partBoxes.has(info.code)) partBoxes.set(info.code, new THREE.Box3());
        partBoxes.get(info.code).union(box);
      }
    });
    freeMaterials = applyTakuMaterials(THREE, robot, activePart, softwareStudio);
    batches = batchTakuMeshes(THREE, robot, hitMetadata);
    scene.add(batches.group);
    freeGround = ground(scene, bounds);
    controls.addEventListener('change', invalidate);
    installZoomGestures(canvas, {
      engaged: () => controls.enabled,
      hasPointers: () => activePointers.size > 0,
      zoom,
      signal,
    });
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    visibilityObserver = new IntersectionObserver((entries) => {
      onscreen = entries.at(-1).isIntersecting;
      if (onscreen) invalidate();
    });
    visibilityObserver.observe(canvas);
    document.addEventListener('visibilitychange', invalidate, { signal });
    reduced.addEventListener(
      'change',
      () => {
        if (reduced.matches && transition) setView(id, { side, immediate: true });
      },
      { signal },
    );
    canvas.addEventListener(
      'pointerdown',
      (event) => {
        if (!controls.enabled) return;
        activePointers.add(event.pointerId);
        if (activePointers.size === 1 && event.button === 0)
          down = { id: event.pointerId, x: event.clientX, y: event.clientY };
        else {
          down = null;
          if (activePointers.size > 1) interrupt();
        }
      },
      { signal },
    );
    canvas.addEventListener(
      'pointermove',
      (event) => {
        if (!controls.enabled) return;
        if (down && Math.hypot(event.clientX - down.x, event.clientY - down.y) > 5) {
          down = null;
          interrupt();
        }
        if (fine.matches && !activePointers.size && event.pointerType === 'mouse') {
          hoverPoint = { clientX: event.clientX, clientY: event.clientY };
          if (!hoverFrame)
            hoverFrame = requestAnimationFrame(() => {
              hoverFrame = 0;
              if (!hoverPoint || dead || activePointers.size) return;
              pointRay(hoverPoint);
              const hit = pickBounds.some((box) => raycaster.ray.intersectsBox(box))
                ? pick(hoverPoint)
                : null;
              const selected = hit?.code === activePart.value;
              canvas.dataset.partHovered = String(selected);
              canvas.style.cursor = hit ? 'pointer' : 'grab';
            });
        }
      },
      { signal },
    );
    canvas.addEventListener(
      'pointerleave',
      () => {
        hoverPoint = null;
        canvas.dataset.partHovered = 'false';
        canvas.style.cursor = controls.enabled ? 'grab' : '';
      },
      { signal },
    );
    canvas.addEventListener(
      'pointerup',
      (event) => {
        activePointers.delete(event.pointerId);
        if (
          down?.id === event.pointerId &&
          !activePointers.size &&
          Math.hypot(event.clientX - down.x, event.clientY - down.y) <= 5
        ) {
          if (controls.enabled) pickAt(event.clientX, event.clientY);
        }
        down = null;
      },
      { signal },
    );
    canvas.addEventListener(
      'pointercancel',
      (event) => {
        activePointers.delete(event.pointerId);
        down = null;
      },
      { signal },
    );
    canvas.addEventListener(
      'keydown',
      (event) => {
        if (!controls.enabled || event.ctrlKey || event.metaKey || event.altKey) return;
        switch (event.key) {
          case 'Enter':
          case ' ':
            if (onInspect || onPick) inspect();
            else return;
            break;
          case 'Home':
            setView('overview');
            break;
          case '+':
          case '=':
            zoom(1.2);
            break;
          case '-':
            zoom(1 / 1.2);
            break;
          case 'ArrowLeft':
            orbitStep(-0.085, 0);
            break;
          case 'ArrowRight':
            orbitStep(0.085, 0);
            break;
          case 'ArrowUp':
            orbitStep(0, -0.085);
            break;
          case 'ArrowDown':
            orbitStep(0, 0.085);
            break;
          default:
            return;
        }
        event.preventDefault();
      },
      { signal },
    );
    resize();
    if (previous?.cameraSpace === 'world' && previous.camera) {
      camera.position.fromArray(previous.camera);
      controls.target.fromArray(previous.target);
      controls.update();
      userAdjusted = true;
      selectPart(previous.selectedId || id, previous.selectedSide || side);
    }
    if (dead) throw new Error('Viewer initialization was interrupted.');
    canRender = true;
    draw(performance.now());
    const controller = {
      setView,
      selectPart,
      setEngaged,
      pickAt,
      anchorsReady,
      async readStudyMask() {
        await anchorsReady();
        return outline.readStudyMask();
      },
      zoom,
      orbitStep,
      inspect,
      reset: () => setView('overview'),
      dispose,
      getState: () => ({
        currentView: id,
        cameraSpace: 'world',
        selectedId: selected,
        selectedSide,
        engaged: controls.enabled,
        side,
        transitioning: !!transition,
        renderedFrames,
        camera: camera.position.toArray(),
        target: controls.target.toArray(),
        dpr: renderer.getPixelRatio(),
        distance: camera.position.distanceTo(controls.target),
        zoomLimits: { ...limits },
        selectedPart: activePart.value,
        lighting: softwareStudio ? 'software' : 'studio',
        antialiasing: softwareAA ? 'software' : 'msaa',
        triangles: batches.group.children.reduce((sum, m) => sum + m.geometry.index.count / 3, 0),
      }),
    };
    onReady?.(controller);
    return controller;
  } catch (error) {
    if (!dead) fail(error);
    throw error;
  }
}

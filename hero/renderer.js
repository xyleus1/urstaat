import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { mountGlyphField, isGlyphFieldSupported, glyphFieldTier, FIELD_PHOTO_CHARSET } from 'asciify-engine/field';
import { background, swell } from 'asciify-engine/kit';

// Integration only: the mechanical parts are published Mini-Cheetah STEP CAD;
// the representative populated controller is the open moteus C1 KiCad export.
// Both character rendering and the background use unmodified Asciify 4.33.0.
const INK = '#C7CDD0', PAPER = '#080A0B';
const TAU = Math.PI * 2;

export function mountHero({ motorElement, waveElement, pauseButton, posterElement, modelData, startPaused = false, assetBase = new URL('./assets/', import.meta.url).href }) {
  if (!motorElement) throw new Error('The motor viewport is required.');
  const asset = (name) => new URL(name, assetBase.endsWith('/') ? assetBase : `${assetBase}/`).href;
  const canvas = document.createElement('canvas');
  canvas.className = 'hero-motor-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', pointerEvents: 'none' });
  if (startPaused) canvas.style.opacity = '0';
  motorElement.append(canvas);
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let renderer, scene, camera, field, waves, model, spinner, tilt;
  const assemblyParts = [];
  let raf = 0, lastTick = 0, lastDraw = 0, seconds = 0, ready = false, disposed = false;
  let resizeRaf = 0, waveTimer = 0, wavesReady = false, wavesStarting = false, waveError = null;
  const sourcePixelRatio = 2, targetFps = 30;
  let tier = 'unknown', wavePlaying = false, renderedTriangles = 0, renderedMeshes = 0;
  let appliedWidth = 0, appliedHeight = 0, appliedDpr = 0, pointerRect = null;
  const timings = { started: performance.now() };
  let manualPaused = startPaused, reduced = media.matches, onscreen = true, error = null;
  let width = 640, height = 340, drawCount = 0, lastFrameMs = 0, clipName = null;
  let worldBounds = null, orthoHeight = 100, compactComposition = null, pointer = { x: 0, y: 0 }, smoothPointer = { x: 0, y: 0 };
  const viewBounds = new THREE.Box3();
  const observer = new IntersectionObserver(([entry]) => { onscreen = entry.isIntersecting; sync(); }, { rootMargin: '40px' });
  observer.observe(motorElement);
  const resizeObserver = new ResizeObserver(() => {
    if (!resizeRaf) resizeRaf = requestAnimationFrame(() => { resizeRaf = 0; resize(); });
  });
  resizeObserver.observe(motorElement);

  function active() { return ready && !disposed && !manualPaused && !reduced && onscreen && !document.hidden; }
  function updateControl() {
    if (!pauseButton) return;
    const stopped = manualPaused || reduced;
    pauseButton.textContent = stopped ? 'Resume animation' : 'Pause animation';
    pauseButton.setAttribute('aria-pressed', String(stopped));
    pauseButton.disabled = !ready;
  }
  function sync() {
    updateControl();
    if (active()) {
      if (wavesReady && !wavePlaying) { waves.play(); wavePlaying = true; }
      scheduleWaves();
      if (!raf) { lastTick = 0; lastDraw = 0; raf = requestAnimationFrame(tick); }
    } else {
      cancelAnimationFrame(raf); raf = 0; lastTick = 0;
      field?.pause(); waves?.pause(); wavePlaying = false;
      clearTimeout(waveTimer); waveTimer = 0;
    }
  }
  function draw(time = seconds, exact = false) {
    if (!renderer || !field || !model || disposed) return;
    const started = performance.now();
    spinner.rotation.y = ((time % 20) / 20) * TAU;
    // Small, coherent breathing along the explosion axis; no source part bends.
    const expansion = 1 + 0.012 * Math.sin((time % 20) / 20 * TAU);
    for (const part of assemblyParts) part.node.position.y = part.y * expansion;
    if (exact) { smoothPointer.x = 0; smoothPointer.y = 0; }
    else {
      smoothPointer.x += (pointer.x - smoothPointer.x) * 0.08;
      smoothPointer.y += (pointer.y - smoothPointer.y) * 0.08;
    }
    // A tiny camera response; source part placement and authored rig are untouched.
    camera.position.set(smoothPointer.x * 35, smoothPointer.y * 35, 700);
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    field.redraw();
    drawCount++;
    lastFrameMs = performance.now() - started;
  }
  function tick(now) {
    raf = 0;
    if (!active()) return;
    if (lastTick) seconds += Math.min((now - lastTick) / 1000, 0.1);
    lastTick = now;
    if (!lastDraw || now - lastDraw >= 1000 / targetFps - 0.5) { draw(); lastDraw = now; }
    raf = requestAnimationFrame(tick);
  }
  function resize() {
    const rect = motorElement.getBoundingClientRect();
    pointerRect = rect;
    width = Math.max(1, Math.round(rect.width)); height = Math.max(1, Math.round(rect.height));
    if (!renderer || !camera) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    if (appliedWidth === width && appliedHeight === height && appliedDpr === dpr) return;
    appliedWidth = width; appliedHeight = height; appliedDpr = dpr;
    // The stock field sizes from clientWidth/clientHeight. A CSS-only, inverse
    // scale gives it an honest 2x backing surface even on a 1x display: an 8px
    // device cell remains 4px on screen, with shape sampling enabled everywhere.
    // No engine internals, shader, or browser devicePixelRatio are modified.
    const supersample = 2 / dpr;
    canvas.style.width = `${supersample * 100}%`;
    canvas.style.height = `${supersample * 100}%`;
    canvas.style.transformOrigin = '0 0';
    canvas.style.transform = supersample === 1 ? 'none' : `scale(${1 / supersample})`;
    // Preserve the original source resolution as well as the glyph resolution.
    renderer.setPixelRatio(sourcePixelRatio);
    renderer.setSize(width, height, false);
    const compact = width < 600;
    if (model && compactComposition !== compact) {
      compactComposition = compact;
      tilt.position.set(0, 0, 0);
      tilt.rotation.set(0.55, 0, compact ? -1.02 : -Math.PI / 2 + 0.06, 'ZXY');
      viewBounds.makeEmpty();
      const rotation = spinner.rotation.y;
      for (let i = 0; i < 24; i++) {
        spinner.rotation.y = TAU * i / 24;
        scene.updateMatrixWorld(true);
        viewBounds.union(new THREE.Box3().setFromObject(model));
      }
      spinner.rotation.y = rotation;
      const visualCenter = viewBounds.getCenter(new THREE.Vector3());
      tilt.position.sub(visualCenter); viewBounds.translate(visualCenter.negate());
      worldBounds = { ...worldBounds, min: viewBounds.min.toArray(), max: viewBounds.max.toArray() };
    }
    const aspect = width / height;
    if (!viewBounds.isEmpty()) {
      const size = viewBounds.getSize(new THREE.Vector3());
      orthoHeight = Math.max(size.y, size.x / aspect) * 1.10;
    }
    camera.left = -orthoHeight * aspect / 2;
    camera.right = orthoHeight * aspect / 2;
    camera.top = orthoHeight / 2;
    camera.bottom = -orthoHeight / 2;
    camera.updateProjectionMatrix();
    field?.update({ cellSize: 4 * supersample });
    field?.resize();
    // A live canvas can change aspect ratio after mount. Rebind through the
    // public API so the stock field also refreshes its source dimensions.
    if (field && ready) {
      renderer.render(scene, camera);
      field.setSource(renderer.domElement).then(() => { if (ready && !disposed) draw(seconds, true); }).catch(handleError);
    }
  }
  function pointerMove(event) {
    if (!finePointer.matches || reduced || manualPaused) return;
    const r = pointerRect || motorElement.getBoundingClientRect();
    pointer.x = THREE.MathUtils.clamp(((event.clientX - r.left) / r.width - 0.5) * 2, -1, 1);
    pointer.y = THREE.MathUtils.clamp(-((event.clientY - r.top) / r.height - 0.5) * 2, -1, 1);
  }
  function pointerLeave() { pointer.x = 0; pointer.y = 0; }
  function refreshPointerRect() { pointerRect = motorElement.getBoundingClientRect(); }
  const pointerRegion = motorElement.closest('.hero') || motorElement.parentElement;
  pointerRegion?.addEventListener('pointermove', pointerMove);
  pointerRegion?.addEventListener('pointerenter', refreshPointerRect);
  pointerRegion?.addEventListener('pointerleave', pointerLeave);
  window.addEventListener('scroll', refreshPointerRect, { passive: true });
  function visibilityChange() { sync(); }
  function motionChange(event) {
    reduced = event.matches;
    waves?.update({ reducedMotion: reduced });
    if (reduced && ready) { seconds = 0; draw(0, true); }
    sync();
  }
  function toggle() { if (manualPaused || reduced) controller.resume(); else controller.pause(); }
  document.addEventListener('visibilitychange', visibilityChange);
  media.addEventListener('change', motionChange);
  pauseButton?.addEventListener('click', toggle);

  const controller = {
    canvas,
    get waveCanvas() { return waveElement?.querySelector('canvas') || null; },
    get status() { return { ready, disposed, error, paused: manualPaused || reduced, active: active(), reducedMotion: reduced, visible: onscreen && !document.hidden, time: seconds, renderCount: drawCount, lastFrameMs, framePending: false, pendingPose: false, width, height, dpr: Math.min(devicePixelRatio || 1, 2), renderingPixelRatio: sourcePixelRatio, sourcePixelRatio, glyphPixelRatio: 2, targetFps, tier, workerRequested: false, wavesReady, waveError, timings: { ...timings }, visibleGlyphCellPx: 4, sourceClip: clipName, sourcePose: 0, loopSeconds: 20, sourceGeometryCount: renderedMeshes, sourceTriangles: 973838, renderedTriangles, bounds: worldBounds, engine: 'asciify-engine@4.33.0' }; },
    pause() { manualPaused = true; sync(); },
    resume() { manualPaused = false; reduced = false; waves?.update({ reducedMotion: false }); sync(); },
    renderAt(time) { manualPaused = true; sync(); seconds = Number(time) || 0; draw(seconds, true); waves?.field?.redraw(); return controller.status; },
    async whenFrameSubmitted() { return controller.status; },
    snapshot({ paper = false } = {}) {
      draw(seconds, true);
      const output = document.createElement('canvas'); output.width = canvas.width; output.height = canvas.height;
      const ctx = output.getContext('2d');
      if (paper) { ctx.fillStyle = PAPER; ctx.fillRect(0, 0, output.width, output.height); }
      ctx.drawImage(canvas, 0, 0);
      return output.toDataURL('image/png');
    },
    resize,
    dispose() {
      disposed = true; sync(); observer.disconnect(); resizeObserver.disconnect();
      cancelAnimationFrame(resizeRaf); clearTimeout(waveTimer);
      document.removeEventListener('visibilitychange', visibilityChange); media.removeEventListener('change', motionChange);
      pointerRegion?.removeEventListener('pointermove', pointerMove); pointerRegion?.removeEventListener('pointerleave', pointerLeave); pointerRegion?.removeEventListener('pointerenter', refreshPointerRect);
      window.removeEventListener('scroll', refreshPointerRect);
      pauseButton?.removeEventListener('click', toggle); field?.destroy(); waves?.destroy();
      model?.traverse(object => { if (object.isMesh) { object.geometry.dispose(); const materials = Array.isArray(object.material) ? object.material : [object.material]; materials.forEach(material => material.dispose()); } });
      renderer?.dispose(); canvas.remove();
    },
  };

  function scheduleWaves() {
    if (!waveElement || waves || wavesStarting || waveTimer || !active()) return;
    // The decorative second GL context never gates the motor's first frame.
    waveTimer = setTimeout(() => { waveTimer = 0; if (active()) startWaves(); }, 1500);
  }
  async function startWaves() {
    wavesStarting = true;
    timings.wavesStarted = performance.now();
    try {
      waves = background(waveElement, { preset: swell, palette: '#DCE2E6', speed: 0.2, cellSize: 12, cursor: 'fluid', mark: 'glyph', opacity: 0.22, lazy: false, clear: false,
        look: { font: '"IBM Plex Mono", monospace', fontWeight: 400, glyphScale: 1, cellAspect: 0.6, charset: ' .,:-=+*#%@', hover: 'fluid', tap: 'none', fluid: { radius: 0.12, force: 0.3, dissipation: 1.3, refraction: 0.012, glow: 0.15, curl: 12, resolution: 96 }, post: { bloom: 0, scanlines: 0, grain: 0, chroma: 0, curvature: 0 } } });
      await waves.field?.ready;
      if (disposed) return;
      wavesReady = true; timings.wavesReady = performance.now(); sync();
    } catch (cause) {
      waveError = cause instanceof Error ? cause.message : String(cause);
      waves?.destroy(); waves = null;
      console.warn('Robotics background:', cause);
    }
  }
  function handleError(cause) {
    ready = false;
    error = cause instanceof Error ? cause.message : String(cause);
    motorElement.dataset.error = error;
    canvas.hidden = true; if (posterElement) posterElement.hidden = false;
    field?.pause(); waves?.pause(); renderer?.dispose();
    if (pauseButton) pauseButton.hidden = true;
    sync();
    console.error('Robotics hero:', cause);
    return controller;
  }
  controller.ready = (async () => {
    updateControl();
    if (!isGlyphFieldSupported()) throw new Error('Hardware-accelerated WebGL2 is unavailable; displaying the sourced ASCII poster.');
    tier = glyphFieldTier();
    // Network work proceeds together, while the HTML poster remains visible.
    const fontReady = document.fonts.load('400 12px "IBM Plex Mono"').then(async faces => {
      if (!faces.length) {
        const font = new FontFace('IBM Plex Mono', `url("${asset('IBMPlexMono-Regular.woff2')}") format("woff2")`, { weight: '400', style: 'normal' });
        await font.load(); document.fonts.add(font);
      }
      timings.fontLoaded = performance.now();
    });
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    const modelReady = (modelData
      ? Promise.resolve(modelData).then(buffer => loader.parseAsync(buffer, assetBase))
      : loader.loadAsync(asset('actuator.meshopt.glb'))
    ).then(gltf => { timings.modelLoaded = performance.now(); return gltf; });
    const [gltf] = await Promise.all([modelReady, fontReady]);
    if (disposed) return controller;
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-100, 100, 50, -50, 0.1, 1500);
    camera.position.set(0, 0, 700); camera.lookAt(0, 0, 0);
    const key = new THREE.DirectionalLight(0xffffff, 3.2); key.position.set(-45, 65, 90); scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.8); fill.position.set(70, -20, 40); scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, 1.5); rim.position.set(10, 50, -60); scene.add(rim);
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    model = gltf.scene;
    clipName = 'Published CAD / exploded presentation';
    model.traverse(object => {
      if (!object.isMesh) return;
      assemblyParts.push({ node: object, y: object.position.y });
      renderedMeshes++;
      renderedTriangles += (object.geometry.index?.count ?? object.geometry.attributes.position.count) / 3;
      // The CAD has no photography materials. A steel finish helps the stock
      // character sampler retain the tooth, race, pin and PCB silhouettes.
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) { material.roughness = 0.62; material.metalness = 0.12; }
    });
    model.updateMatrixWorld(true);
    const sourceBounds = new THREE.Box3().setFromObject(model, true);
    const center = sourceBounds.getCenter(new THREE.Vector3());
    model.position.sub(center);
    tilt = new THREE.Group();
    spinner = new THREE.Group(); spinner.add(model); tilt.add(spinner); scene.add(tilt);
    worldBounds = { source: { min: sourceBounds.min.toArray(), max: sourceBounds.max.toArray() } };
    resize();
    renderer.render(scene, camera);
    timings.threeFirstFrame = performance.now();
    field = mountGlyphField(canvas, {
      source: renderer.domElement, live: true, worker: false, fit: 'contain',
      color: 'ink', ink: INK, shade: 0, ramp: [], background: 'transparent', backdrop: 0,
      font: '"IBM Plex Mono", monospace', fontWeight: 400, glyphScale: 1,
      charset: FIELD_PHOTO_CHARSET, mark: 'glyph', glyphOrder: 'tone', sample: 'shape',
      cellSize: 8 / Math.min(devicePixelRatio || 1, 2), cellAspect: 0.6, cellFit: 'pixel', maxPixelRatio: 2,
      brightness: 0, contrast: 1, gamma: 1, invert: false, levels: 'none', blend: 'off',
      hover: 'none', tap: 'none', fluid: false, vignette: 0, drift: 0, accents: 0, shuffle: 0, sparkle: 0, effects: [],
      post: { bloom: 0, scanlines: 0, grain: 0, chroma: 0, curvature: 0 }, respectReducedMotion: true,
    });
    await field.ready; field.pause();
    timings.fieldReady = performance.now();
    if (disposed) return controller;
    ready = true; draw(0, true); timings.motorReady = performance.now();
    if (pauseButton) pauseButton.hidden = false;
    motorElement.dataset.ready = 'true';
    if (!startPaused) canvas.style.opacity = '1';
    if (posterElement) posterElement.hidden = true;
    sync();
    return controller;
  })().catch(handleError);
  window.__robotHero = controller;
  return controller;
}

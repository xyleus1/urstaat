import { zoomRange, zoomAvailability } from './taku-composition.js?v=studio-3';
import { installZoomGestures } from './taku-gestures.js?v=field-1';
const views = ['overview', 'side', 'face', 'shoulder', 'elbow', 'wrist', 'claw', 'waist', 'base'];
const arms = new Set(['shoulder', 'elbow', 'wrist', 'claw']);
const directions = [
  [1.05, 0.32, -0.72],
  [0.02, 0.12, -1],
  [1, 0.1, -0.21],
  [0.58, 0.2, -1],
  [0.34, 0.09, -1],
  [-0.45, -0.18, -1],
  [-0.66, -0.12, -1],
  [0.12, 0.18, -1],
  [0.55, -0.9, -1],
];
const spans = [1.62, 1.61, 0.29, 0.265, 0.195, 0.162, 0.242, 0.6, 0.33];
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const partCode = (id, side) => views.indexOf(id) + 1 + (side === 'right' && arms.has(id) ? 9 : 0);
const assets = new URL('assets/', import.meta.url);

async function imagePixels(name, size, signal) {
  const response = await fetch(new URL(name, assets), { signal });
  if (!response.ok) throw Error('Could not load ' + name);
  const blob = await response.blob();
  let image;
  if (typeof createImageBitmap === 'function') image = await createImageBitmap(blob);
  else {
    image = new Image();
    const url = URL.createObjectURL(blob);
    try {
      image.src = url;
      await image.decode();
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  const canvas = document.createElement('canvas');
  canvas.width = size || image.width;
  canvas.height = size || image.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  image.close?.();
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  if (!size) return data;
  const ink = new Uint8Array(size * size);
  for (let i = 0; i < ink.length; i++) ink[i] = Math.max(0, data[i * 4] - data[i * 4 + 2]);
  return ink;
}
async function modelBytes(signal) {
  const response = await fetch(new URL('taku-cpu.bin.gz', assets), { signal });
  if (!response.ok) throw Error('Could not load the robot geometry');
  const bytes = await response.arrayBuffer();
  // Hosts may apply content-encoding automatically to a .gz asset.
  if (new Uint8Array(bytes, 0, 2)[0] !== 31) return bytes;
  if (typeof DecompressionStream === 'function') {
    return new Response(
      new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')),
    ).arrayBuffer();
  }
  const { gunzipSync } = await import('./taku-inflate.min.js?v=studio-3');
  return gunzipSync(new Uint8Array(bytes)).buffer;
}

export async function mountCpu({
  canvas,
  initialView,
  initialSide = 'left',
  initialEngaged = false,
  previous,
  onViewChange,
  onSettled,
  onInspect,
  onProjection,
  onAnchors,
  onPick,
  onZoomChange,
  onError,
}) {
  const events = new AbortController(),
    { signal } = events;
  const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
  if (!ctx) throw Error('Canvas 2D is unavailable');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let id = initialView,
    side = initialSide,
    meta,
    worker,
    raster,
    raf = 0,
    dirty = false,
    busy = false,
    dead = false,
    ready = false;
  let cssWidth = 0,
    cssHeight = 0,
    revision = 0,
    renderedFrames = 0,
    submitted = 0,
    settle = true,
    cost = 0;
  let orbit = [0, 0, 2],
    target = [0, 0.65, 0],
    tween = null,
    pickRequest = 0,
    lastFrame = 0;
  let registration, limits;
  let selected = id,
    selectedSide = side,
    engaged = initialEngaged,
    visibleAnchors = [];
  const anchorWaiters = new Set();
  const mobileTier = matchMedia('(max-width: 760px), (pointer: coarse) and (max-width: 1100px)').matches;
  let hoverRequest = 0,
    hoverFrame = 0,
    hoverPoint = null,
    recoverWorker,
    workerTimer;
  let returnedBuffer;
  const pointers = new Map();
  let click,
    previousSpan = 0;
  let firstResolve, firstReject;
  const first = new Promise((resolve, reject) => {
    firstResolve = resolve;
    firstReject = reject;
  });
  first.catch(() => {});
  function invalidate() {
    dirty = true;
    if (!dead && !busy && !raf && meta && !document.hidden) raf = requestAnimationFrame(draw);
  }
  function draw(now) {
    raf = 0;
    if (dead || busy || !dirty || !meta || !cssWidth) return;
    if (tween) {
      const q = Math.min(1, (now - tween.start) / 400),
        t = q * q * (3 - 2 * q);
      orbit = tween.from.map((v, k) => v + t * (tween.to[k] - v));
      target = tween.targetFrom.map((v, k) => v + t * (tween.targetTo[k] - v));
      if (q === 1) tween = null;
    }
    busy = true;
    dirty = false;
    const pose = {
      id,
      code: partCode(selected, selectedSide),
      orbit,
      target,
      width: canvas.width,
      height: canvas.height,
      cssWidth,
      preset: registration,
      mobile: mobileTier,
    };
    const message = { type: 'render', pose, revision };
    if (worker) {
      message.buffer = returnedBuffer;
      worker.postMessage(message, returnedBuffer ? [returnedBuffer] : []);
      returnedBuffer = undefined;
    } else {
      try {
        const t = performance.now(),
          out = raster.render(pose);
        messageReceived({
          type: 'frame',
          revision,
          width: out.width,
          height: out.height,
          buffer: out.pixels.buffer,
          byteOffset: out.pixels.byteOffset,
          projection: out.projection,
          visible: out.visible,
          orientation: { yaw: pose.orbit[0], pitch: pose.orbit[1] },
          submitted: out.submitted,
          cost: performance.now() - t,
        });
      } catch (error) {
        fail(error);
      }
    }
  }
  function framePresented(data) {
    busy = false;
    if (dead) return;
    if (worker) returnedBuffer = data.buffer;
    if (data.width === canvas.width && data.height === canvas.height && data.revision === revision) {
      ctx.putImageData(
        new ImageData(
          new Uint8ClampedArray(data.buffer, data.byteOffset || 0, data.width * data.height * 4),
          data.width,
          data.height,
        ),
        0,
        0,
      );
      lastFrame = revision;
      renderedFrames++;
      submitted = data.submitted;
      cost = data.cost;
      visibleAnchors = data.visible.map(({ code, x, y }) => ({
        id: views[(code - 1) % 9],
        side: code > 9 ? 'right' : 'left',
        x,
        y,
      }));
      onAnchors?.(visibleAnchors, data.orientation);
      for (const resolve of anchorWaiters) resolve(visibleAnchors);
      anchorWaiters.clear();
      onProjection?.(data.projection);
      if (limits) onZoomChange?.(zoomAvailability(limits, orbit[2]));
      if (!ready) {
        ready = true;
        firstResolve();
      }
      if (settle && !tween) {
        settle = false;
        onSettled?.(id, side);
      }
    }
    // Pointer events may have updated the pose while a frame was in flight.
    // Submit the newest pose as soon as the worker is free.
    if (worker && dirty && !document.hidden) draw(performance.now());
    else if (tween || dirty) invalidate();
  }
  function messageReceived(data) {
    if (data.type === 'ready') {
      clearTimeout(workerTimer);
      const restore = meta ? { orbit, target, selected, selectedSide } : null;
      meta = data.meta;
      resize();
      setView(id, { immediate: true, side });
      if (restore) {
        orbit = restore.orbit;
        target = restore.target;
        selectPart(restore.selected, restore.selectedSide);
      } else if (previous?.camera && previous.cameraSpace === 'world') {
        if (previous.selectedId) selectPart(previous.selectedId, previous.selectedSide);
        target = [...previous.target];
        const delta = previous.camera.map((v, i) => v - target[i]),
          distance = Math.hypot(...delta);
        if (distance)
          orbit = [
            Math.atan2(delta[0], delta[2]),
            Math.asin(clamp(delta[1] / distance, -1, 1)),
            clamp(distance, limits.min, limits.max),
          ];
      }
    } else if (data.type === 'frame') framePresented(data);
    else if (data.type === 'error') {
      if (worker && recoverWorker) recoverWorker();
      else fail(Error(data.message));
    } else if (data.type === 'hover' && data.request === hoverRequest) {
      const over = (data.tag & 31) === partCode(selected, selectedSide);
      canvas.dataset.partHovered = String(over);
      canvas.style.cursor = data.tag >>> 5 ? 'pointer' : engaged ? 'grab' : '';
    } else if (data.type === 'pick' && data.request === pickRequest && lastFrame === revision) {
      const code = data.tag & 31 || data.tag >>> 5;
      if (code) {
        selectPart(views[(code - 1) % 9], code > 9 ? 'right' : 'left');
        onPick?.(selected, selectedSide);
      }
    }
  }
  function preset() {
    const i = views.indexOf(id),
      code = partCode(id, side),
      ray = [...directions[i]];
    if (side === 'right') ray[2] *= -1;
    const span =
      i < 2
        ? Math.max(meta.size[1] * 1.19, (Math.max(meta.size[0], meta.size[2]) * 1.1) / (cssWidth / cssHeight))
        : spans[i];
    const radius = (span / (2 * Math.tan(Math.PI / 12))) * Math.max(1, 0.84 / (cssWidth / cssHeight));
    return {
      orbit: [Math.atan2(ray[0], ray[2]), Math.asin(ray[1] / Math.hypot(...ray)), radius],
      target: i < 2 ? meta.center : meta.anchors[code],
    };
  }
  function selectPart(next, which = 'left') {
    if (!views.includes(next) || dead) return;
    selected = next;
    selectedSide = arms.has(next) && which === 'right' ? 'right' : 'left';
    revision++;
    invalidate();
  }
  function setEngaged(value) {
    engaged = Boolean(value);
    canvas.style.touchAction = engaged ? 'none' : 'pan-y pinch-zoom';
    canvas.style.cursor = engaged ? 'grab' : '';
    if (!engaged) {
      for (const id of pointers.keys()) if (canvas.hasPointerCapture(id)) canvas.releasePointerCapture(id);
      pointers.clear();
      click = null;
      previousSpan = 0;
    }
  }
  function setView(next, { side: which = 'left', immediate = false } = {}) {
    if (!views.includes(next) || dead) return;
    id = next;
    side = arms.has(next) && which === 'right' ? 'right' : 'left';
    selectPart(id, side);
    if (!meta || !cssWidth) return;
    const desired = preset();
    registration = desired;
    limits = zoomRange(id, desired.orbit[2]);
    revision++;
    pickRequest++;
    settle = true;
    if (immediate || reduced.matches || !ready) {
      orbit = desired.orbit;
      target = [...desired.target];
      tween = null;
    } else {
      const delta = desired.orbit[0] - orbit[0];
      desired.orbit = desired.orbit.slice();
      desired.orbit[0] = orbit[0] + Math.atan2(Math.sin(delta), Math.cos(delta));
      tween = {
        start: performance.now(),
        from: orbit,
        to: desired.orbit,
        targetFrom: target,
        targetTo: desired.target,
      };
    }
    onViewChange?.(id, arms.has(id) ? side : undefined);
    invalidate();
  }
  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height || (rect.width === cssWidth && rect.height === cssHeight)) return;
    const oldDefault = registration?.orbit[2];
    cssWidth = rect.width;
    cssHeight = rect.height;
    // One fixed viewport for every frame, with a bounded pixel budget on large screens.
    const ratio = Math.min(devicePixelRatio || 1, 1.35, Math.sqrt(600000 / (cssWidth * cssHeight)));
    canvas.width = Math.max(1, Math.round(cssWidth * ratio));
    canvas.height = Math.max(1, Math.round(cssHeight * ratio));
    if (meta && oldDefault) {
      registration = preset();
      limits = zoomRange(id, registration.orbit[2]);
      orbit[2] = clamp((orbit[2] * registration.orbit[2]) / oldDefault, limits.min, limits.max);
    }
    revision++;
    invalidate();
  }
  function adjust(yaw, pitch, scale = 1) {
    tween = null;
    pickRequest++;
    orbit = [
      orbit[0] + yaw,
      clamp(orbit[1] + pitch, -1.2, 1.54),
      clamp(orbit[2] / scale, limits.min, limits.max),
    ];
    invalidate();
  }
  function zoom(factor) {
    if (factor > 0 && Number.isFinite(factor)) adjust(0, 0, factor);
  }
  function pickAt(clientX, clientY) {
    const rect = canvas.getBoundingClientRect(),
      x = (clientX - rect.left) / rect.width,
      y = (clientY - rect.top) / rect.height;
    const request = ++pickRequest;
    if (worker) worker.postMessage({ type: 'pick', x, y, request });
    else if (raster) messageReceived({ type: 'pick', tag: raster.pick(x, y), request });
  }
  setEngaged(initialEngaged);
  canvas.addEventListener(
    'pointerdown',
    (e) => {
      if (!engaged || e.button !== 0) return;
      canvas.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, [e.clientX, e.clientY]);
      click = pointers.size === 1 ? [e.clientX, e.clientY] : null;
      if (pointers.size === 2) {
        const [a, b] = pointers.values();
        previousSpan = Math.hypot(a[0] - b[0], a[1] - b[1]);
      }
    },
    { signal },
  );
  canvas.addEventListener(
    'pointermove',
    (e) => {
      if (!engaged) return;
      const prev = pointers.get(e.pointerId);
      if (!prev) {
        if (e.pointerType === 'mouse' && ready) {
          const rect = canvas.getBoundingClientRect();
          hoverPoint = [(e.clientX - rect.left) / rect.width, (e.clientY - rect.top) / rect.height];
          if (!hoverFrame)
            hoverFrame = requestAnimationFrame(() => {
              hoverFrame = 0;
              if (!hoverPoint || dead) return;
              const [x, y] = hoverPoint,
                request = ++hoverRequest;
              if (worker) worker.postMessage({ type: 'hover', x, y, request });
              else messageReceived({ type: 'hover', request, tag: raster.pick(x, y) });
            });
        }
        return;
      }
      if (click && Math.hypot(e.clientX - click[0], e.clientY - click[1]) < 4) return;
      click = null;
      pointers.set(e.pointerId, [e.clientX, e.clientY]);
      if (pointers.size >= 2) {
        const [a, b] = pointers.values(),
          span = Math.hypot(a[0] - b[0], a[1] - b[1]);
        if (previousSpan > 0 && span > 0) zoom(span / previousSpan);
        previousSpan = span;
      } else
        adjust(
          ((prev[0] - e.clientX) * 2 * Math.PI) / cssHeight,
          ((e.clientY - prev[1]) * Math.PI) / cssHeight,
        );
    },
    { signal },
  );
  canvas.addEventListener(
    'pointerup',
    (e) => {
      if (!pointers.has(e.pointerId)) return;
      if (click && pointers.size === 1 && ready) pickAt(e.clientX, e.clientY);
      pointers.delete(e.pointerId);
      click = null;
    },
    { signal },
  );
  canvas.addEventListener(
    'pointercancel',
    (e) => {
      pointers.delete(e.pointerId);
      click = null;
    },
    { signal },
  );
  canvas.addEventListener(
    'pointerleave',
    () => {
      hoverPoint = null;
      hoverRequest++;
      canvas.dataset.partHovered = 'false';
      canvas.style.cursor = engaged ? 'grab' : '';
    },
    { signal },
  );
  installZoomGestures(canvas, { engaged: () => engaged, hasPointers: () => pointers.size > 0, zoom, signal });
  canvas.addEventListener(
    'lostpointercapture',
    (event) => {
      if (pointers.delete(event.pointerId)) {
        click = null;
        previousSpan = 0;
      }
    },
    { signal },
  );
  canvas.addEventListener(
    'keydown',
    (e) => {
      if (!engaged || e.ctrlKey || e.altKey || e.metaKey) return;
      switch (e.key) {
        case 'ArrowLeft':
          adjust(-0.085, 0);
          break;
        case 'ArrowRight':
          adjust(0.085, 0);
          break;
        case 'ArrowUp':
          adjust(0, 0.085);
          break;
        case 'ArrowDown':
          adjust(0, -0.085);
          break;
        case '+':
        case '=':
          zoom(1.2);
          break;
        case '-':
          zoom(1 / 1.2);
          break;
        case 'Home':
          setView('overview');
          break;
        case 'Enter':
        case ' ':
          (onInspect || onPick)?.(selected, selectedSide);
          break;
        default:
          return;
      }
      e.preventDefault();
    },
    { signal },
  );
  document.addEventListener(
    'visibilitychange',
    () => {
      if (!document.hidden) invalidate();
    },
    { signal },
  );
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();
  function dispose() {
    if (dead) return;
    dead = true;
    clearTimeout(workerTimer);
    events.abort();
    observer.disconnect();
    worker?.terminate();
    cancelAnimationFrame(raf);
    cancelAnimationFrame(hoverFrame);
    for (const resolve of anchorWaiters) resolve([]);
    anchorWaiters.clear();
  }
  function fail(error) {
    if (dead) return;
    firstReject(error);
    dispose();
    if (ready) onError?.(error);
  }
  try {
    const [model, lights, ink, kernel] = await Promise.all([
      modelBytes(signal),
      imagePixels('taku-finishes.webp?v=studio-3', 0, signal),
      imagePixels('taku-ink.png', 256, signal),
      typeof WebAssembly === 'object'
        ? fetch(new URL('taku-raster.wasm?v=field-1', assets), { signal })
            .then((r) => r.arrayBuffer())
            .then((r) => WebAssembly.compile(r))
            .catch(() => null)
        : null,
    ]);
    const payload = { model, lights, ink, inkSize: 256, kernel };
    if (window.Worker) {
      try {
        worker = new Worker(new URL('taku-cpu-worker.js?v=field-1', import.meta.url), { type: 'module' });
      } catch {
        /* Main-thread Canvas 2D is also supported. */
      }
    }
    recoverWorker = async () => {
      clearTimeout(workerTimer);
      worker?.terminate();
      worker = null;
      busy = false;
      try {
        const { createRaster } = await import('./taku-raster.js?v=field-1');
        const instance = kernel ? await WebAssembly.instantiate(kernel).catch(() => null) : null;
        if (dead) return;
        raster = createRaster(payload, instance);
        messageReceived({ type: 'ready', meta: raster.meta });
      } catch (error) {
        fail(error);
      }
    };
    if (worker) {
      worker.onmessage = ({ data }) => messageReceived(data);
      worker.onerror = (e) => {
        e.preventDefault();
        recoverWorker();
      };
      workerTimer = setTimeout(recoverWorker, 4000);
      try {
        worker.postMessage({ type: 'init', payload });
      } catch {
        await recoverWorker();
      }
    } else await recoverWorker();
    await first;
    return {
      setView,
      selectPart,
      setEngaged,
      pickAt,
      anchorsReady: () =>
        busy || dirty
          ? new Promise((resolve) => anchorWaiters.add(resolve))
          : Promise.resolve(visibleAnchors),
      zoom,
      orbitStep: (yaw, pitch) => adjust(yaw, -pitch),
      reset: () => setView('overview'),
      dispose,
      getState: () => ({
        currentView: id,
        selectedId: selected,
        selectedSide,
        engaged,
        cameraSpace: 'world',
        side,
        camera: [
          target[0] + orbit[2] * Math.sin(orbit[0]) * Math.cos(orbit[1]),
          target[1] + orbit[2] * Math.sin(orbit[1]),
          target[2] + orbit[2] * Math.cos(orbit[0]) * Math.cos(orbit[1]),
        ],
        target: [...target],
        renderedFrames,
        submitted,
        lastFrameMs: cost,
        distance: orbit[2],
        zoomLimits: { ...limits },
        renderer: 'canvas2d',
      }),
    };
  } catch (error) {
    dispose();
    throw error;
  }
}

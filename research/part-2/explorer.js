import { createInspector } from './part-inspector.js?v=field-1';
import { robotParts } from './robot-parts.js?v=inline-1';
import { mountCallouts } from './robot-callouts.js?v=field-1';
import { mountTakuAtmosphere } from './taku-atmosphere.js?v=field-1';

const stage = document.querySelector('.taku-stage');
const surface = stage.querySelector('.taku-surface');
let canvas = document.querySelector('#taku-canvas');
const still = document.querySelector('#still');
const image = still.querySelector('img');
const status = stage.querySelector('.stage-status');
const tools = stage.querySelector('.stage-tools');
const engageButton = document.querySelector('#engage-model');
const zoomButtons = [...tools.querySelectorAll('[data-zoom]')];
const mobile = matchMedia('(max-width: 760px), (pointer: coarse) and (max-width: 1100px)');
const normalizeSide = (id, side) => robotParts[id].bilateral && side === 'right' ? 'right' : 'left';

function linkedView() {
  const fragment = location.hash.slice(1) || 'overview';
  const right = fragment.startsWith('right-');
  const id = right ? fragment.slice(6) : fragment;
  if (!Object.hasOwn(robotParts, id) || (right && !robotParts[id].bilateral)) return null;
  return [id, right ? 'right' : 'left'];
}
let [cameraView, cameraSide] = linkedView() || ['overview', 'left'];
let selectedPart = cameraView, selectedSide = cameraSide, openKey;
let controller, engaged = false, disposed = false;
let posterAnchors, posterSurfaces, decodedPlate;
const surfaceIds = ['overview', 'side', 'face', 'shoulder', 'elbow', 'wrist', 'claw', 'waist', 'base'];
const atmosphere = mountTakuAtmosphere(stage);
const callouts = mountCallouts(stage.querySelector('.robot-callouts'), document.querySelector('#part-study'), openStudy);
const inspector = createInspector({
  onAtlasSelect(id, side) {
    mark(id, side);
    if (stage.dataset.mode !== 'live') showStill(id, normalizeSide(id, side));
  },
  onCloseStudy() {
    openKey = undefined;
    callouts.select(selectedPart, selectedSide, openKey);
  },
});

function mark(id, side) {
  if (!Object.hasOwn(robotParts, id)) return;
  selectedPart = id;
  selectedSide = normalizeSide(id, side);
  stage.dataset.part = selectedPart;
  stage.dataset.side = selectedSide;
  controller?.selectPart(selectedPart, selectedSide);
  callouts.select(selectedPart, selectedSide, openKey);
}
function openStudy(id, side, opener) {
  if (!Object.hasOwn(robotParts, id)) return;
  const which = normalizeSide(id, side);
  const studyKey = id + '-' + which;
  if (openKey === studyKey && opener?.matches('[data-callout]')) {
    inspector.close();
    return;
  }
  inspector.open(id, which, opener || canvas);
  openKey = studyKey;
  mark(id, which);
  if (matchMedia('(max-width: 1039px)').matches) {
    const box = document.querySelector('#part-study').getBoundingClientRect();
    const extra = box.top + Math.min(box.height, 210) + 12 - innerHeight;
    if (extra > 0) window.scrollBy({
      top: extra, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  }
}

function setEngaged(value) {
  engaged = Boolean(value && controller && stage.dataset.mode === 'live');
  controller?.setEngaged(engaged);
  stage.dataset.engaged = String(engaged);
  engageButton.textContent = engaged ? 'Done' : 'Explore in 3D';
  engageButton.setAttribute('aria-pressed', String(engaged));
}
function activate() {
  setEngaged(true);
  if (engaged) canvas.focus({ preventScroll: true });
}

function showStill(id = cameraView, side = cameraSide) {
  const base = 'stills/' + (side === 'right' ? 'right-' : '') + id;
  still.dataset.part = id;
  still.dataset.side = side;
  still.querySelector('source').srcset = base + '-mobile.webp?v=field-1';
  image.src = base + '.webp?v=field-1';
  image.alt = 'Dyna Taku, ' + (robotParts[id].bilateral ? side + ' ' : '') + robotParts[id].label.toLowerCase() + ' view.';
  if (stage.dataset.mode !== 'live' && image.complete) updatePosterLinks();
}
function posterGeometry() {
  if (!image.naturalWidth || !image.naturalHeight) return;
  const rect = image.getBoundingClientRect();
  const scale = Math.min(rect.width / image.naturalWidth, rect.height / image.naturalHeight);
  const width = image.naturalWidth * scale, height = image.naturalHeight * scale;
  return { rect, width, height, left: (rect.width - width) / 2, top: (rect.height - height) / 2 };
}
function updatePosterLinks() {
  if (stage.dataset.mode === 'live' || disposed) return;
  const g = posterGeometry();
  if (!g || !g.rect.width || !image.currentSrc) return;
  const name = new URL(image.currentSrc).pathname.split('/').pop();
  callouts.update((posterAnchors?.[name] || []).map(a => ({
    ...a, x: (g.left + a.x * g.width) / g.rect.width, y: (g.top + a.y * g.height) / g.rect.height,
  })));
}
image.addEventListener('load', updatePosterLinks);
const posterSize = new ResizeObserver(updatePosterLinks);
posterSize.observe(surface);
function useStills() {
  controller?.dispose();
  controller = undefined;
  stage.dataset.mode = 'stills';
  delete stage.dataset.settled;
  setEngaged(false);
  tools.hidden = true;
  canvas.removeAttribute('tabindex');
  canvas.setAttribute('aria-hidden', 'true');
  status.textContent = '';
  showStill(selectedPart, selectedSide);
}
function loadPosterPicking() {
  // Let the printed plate work as soon as it appears, including during a slow first live frame.
  fetch(new URL('assets/still-anchors.json?v=field-1', import.meta.url))
    .then(r => r.ok ? r.json() : {}).then(value => { posterAnchors = value; updatePosterLinks(); }).catch(() => {});
  fetch(new URL('assets/still-surfaces.json?v=field-1', import.meta.url))
    .then(r => r.ok ? r.json() : {}).then(value => { posterSurfaces = value; }).catch(() => {});
}
function posterHit(event) {
  const g = posterGeometry();
  if (stage.dataset.mode === 'live' || !g || !image.currentSrc) return;
  const filename = new URL(image.currentSrc).pathname.split('/').pop();
  const plate = posterSurfaces?.[filename];
  if (!plate) return;
  const [cols, rows, data] = plate;
  if (decodedPlate?.filename !== filename) {
    const runs = atob(data), pixels = new Uint8Array(cols * rows);
    let cursor = 0;
    for (let i = 0; i < runs.length; i += 2) {
      const count = runs.charCodeAt(i);
      pixels.fill(runs.charCodeAt(i + 1), cursor, cursor + count);
      cursor += count;
    }
    decodedPlate = { filename, pixels };
  }
  const x = Math.floor((event.clientX - g.rect.left - g.left) / g.width * cols);
  const y = Math.floor((event.clientY - g.rect.top - g.top) / g.height * rows);
  if (x < 0 || y < 0 || x >= cols || y >= rows) return;
  const code = decodedPlate.pixels[y * cols + x];
  if (code) return [surfaceIds[(code - 1) % 9], code > 9 ? 'right' : 'left'];
}
still.addEventListener('pointermove', event => {
  still.style.cursor = posterHit(event) ? 'pointer' : '';
});
still.addEventListener('click', event => {
  const hit = posterHit(event);
  if (hit) openStudy(...hit, still);
});

function setCamera(id, which) {
  cameraView = id;
  cameraSide = which;
  stage.dataset.view = id;
  if (controller) controller.setView(id, { side: which });
  else showStill();
}
addEventListener('hashchange', () => {
  const target = linkedView();
  if (!target) return;
  inspector.close({ restoreFocus: false });
  setCamera(...target);
  mark(...target);
  inspector.init(...target);
});

// An ordinary touch swipe belongs to the page. An inactive mouse press may start a drag immediately.
let inactiveTouch;
surface.addEventListener('pointerdown', event => {
  if (event.target !== canvas || !controller || engaged || event.button !== 0) return;
  if (event.pointerType === 'mouse') activate();
  else if (!event.isPrimary || inactiveTouch) inactiveTouch = null;
  else inactiveTouch = { id: event.pointerId, x: event.clientX, y: event.clientY };
}, true);
surface.addEventListener('pointermove', event => {
  if (inactiveTouch?.id === event.pointerId && Math.hypot(event.clientX - inactiveTouch.x, event.clientY - inactiveTouch.y) > 7)
    inactiveTouch = null;
});
surface.addEventListener('pointercancel', () => { inactiveTouch = null; });
surface.addEventListener('pointerup', event => {
  if (!engaged && event.target === canvas && inactiveTouch?.id === event.pointerId) {
    activate();
    controller?.pickAt(event.clientX, event.clientY);
  }
  inactiveTouch = null;
});
document.addEventListener('pointerdown', event => {
  if (engaged && !stage.contains(event.target)) setEngaged(false);
}, true);
document.addEventListener('focusin', event => {
  if (engaged && !stage.contains(event.target)) setEngaged(false);
});
document.addEventListener('keydown', event => {
  if (event.target === canvas && !engaged && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    event.stopPropagation();
    activate();
  }
}, true);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && (engaged || openKey)) {
    event.preventDefault();
    if (openKey) inspector.close();
    setEngaged(false);
  }
});
tools.addEventListener('click', event => {
  const b = event.target.closest('button');
  if (!controller || !b) return;
  if (b === engageButton) {
    if (engaged) setEngaged(false);
    else activate();
  } else if (b.id === 'reset') {
    cameraView = 'overview';
    cameraSide = 'left';
    stage.dataset.view = cameraView;
    controller.reset();
    controller.selectPart(selectedPart, selectedSide);
  } else {
    activate();
    controller.zoom(Number(b.dataset.zoom));
  }
});

function graphicsReady() {
  if (!window.WebGL2RenderingContext) return Promise.resolve('unavailable');
  if (!window.Worker || !window.OffscreenCanvas) return Promise.resolve('unknown');
  return new Promise((resolve) => {
    let worker;
    try {
      worker = new Worker(new URL('gpu-check.js?v=studio-3', import.meta.url));
    } catch {
      resolve('unknown');
      return;
    }
    let timer = setTimeout(() => finish('unavailable'), 1900);
    function finish(result) {
      clearTimeout(timer);
      worker.terminate();
      resolve(result);
    }
    worker.onmessage = ({ data }) => {
      if (data !== 'probing') finish(data);
    };
    worker.onerror = () => finish('unknown');
  });
}

let generation = 0;
let request;
let deadline;
async function openRenderer(graphics) {
  const session = ++generation;
  clearTimeout(deadline);
  request?.abort();
  const oldCanvas = canvas;
  const previous = controller?.getState();
  controller?.dispose();
  controller = undefined;
  const hardware = graphics === 'hardware' || graphics === 'unknown';
  const tier = hardware ? (mobile.matches ? 'mobile' : 'desktop') : 'cpu';
  stage.dataset.graphics = graphics;
  if (!previous) {
    stage.dataset.mode = 'loading';
    stage.dataset.tier = tier;
  } else delete stage.dataset.settled;
  if (!previous) showStill(selectedPart, selectedSide);
  status.textContent = previous ? '' : 'Loading model';
  const fresh = canvas.cloneNode(false);
  fresh.removeAttribute('style');
  fresh.removeAttribute('data-part-hovered');
  if (previous) {
    fresh.removeAttribute('id');
    fresh.style.visibility = 'hidden';
    oldCanvas.after(fresh);
  } else {
    oldCanvas.replaceWith(fresh);
    canvas = fresh;
  }
  const opening = cameraView,
    openingSide = cameraSide;
  const stale = () => disposed || session !== generation;
  const callbacks = {
    canvas: fresh,
    initialView: opening,
    initialSide: openingSide,
    previous,
    onSettled(id) {
      if (!stale()) stage.dataset.settled = id;
    },
    onPick(id, side) {
      if (!stale()) openStudy(id, side, canvas);
    },
    onInspect(id, side) {
      if (!stale()) openStudy(id, side, canvas);
    },
    onAnchors(anchors, pose) {
      if (stale()) return;
      callouts.update(anchors);
      if (pose) atmosphere.setPose(pose);
    },
    onZoomChange({ canZoomIn, canZoomOut }) {
      if (stale()) return;
      for (const b of zoomButtons) {
        const disabled = Number(b.dataset.zoom) > 1 ? !canZoomIn : !canZoomOut;
        if (b.disabled !== disabled) b.disabled = disabled;
      }
    },
    onError(error) {
      if (stale()) return;
      if (hardware) {
        openRenderer('unavailable');
        return;
      }
      useStills();
      console.warn('The interactive robot could not initialize.', error);
    },
  };
  try {
    let next;
    if (hardware) {
      // A successful context probe may still precede a blocked real shader compile.
      // The replacement canvas is independent of the abandoned driver context.
      request = new AbortController();
      const assetUrl = new URL('assets/taku-' + tier + '.glb', import.meta.url).href;
      const assetData = fetch(assetUrl, { signal: request.signal }).then((response) => {
        if (!response.ok) throw Error('Model returned HTTP ' + response.status);
        return response.arrayBuffer();
      });
      assetData.catch(() => {});
      const [{ mountTaku }] = await Promise.all([import('./taku-viewer.min.js?v=field-1'), assetData]);
      if (stale()) return;
      deadline = setTimeout(() => {
        if (!stale()) openRenderer('unavailable');
      }, 6500);
      next = await mountTaku({
        ...callbacks,
        assetUrl,
        assetData,
        mobile: mobile.matches,
        antialiasing: mobile.matches ? 'software' : 'auto',
        onSlow: () => {
          if (!stale()) openRenderer('slow');
        },
      });
    } else {
      const { mountCpu } = await import('./taku-cpu.js?v=field-2');
      if (stale()) return;
      next = await mountCpu(callbacks);
    }
    if (stale()) {
      next.dispose();
      if (previous) fresh.remove();
      return;
    }
    clearTimeout(deadline);
    controller = next;
    if (previous) {
      oldCanvas.remove();
      fresh.id = 'taku-canvas';
      fresh.style.removeProperty('visibility');
      canvas = fresh;
    }
    if (hardware) stage.dataset.graphics = 'hardware';
    stage.dataset.tier = tier;
    stage.dataset.mode = 'live';
    if (cameraView !== opening || cameraSide !== openingSide) controller.setView(cameraView, { immediate: true, side: cameraSide });
    else stage.dataset.settled = cameraView;
    controller.selectPart(selectedPart, selectedSide);
    setEngaged(engaged);
    status.textContent = '';
    tools.hidden = false;
    canvas.removeAttribute('aria-hidden');
    canvas.tabIndex = 0;
    performance.mark('taku-interactive');
  } catch (error) {
    if (stale()) return;
    clearTimeout(deadline);
    if (hardware) {
      await openRenderer('unavailable');
      return;
    }
    if (previous) {
      fresh.remove();
      canvas = oldCanvas;
    }
    useStills();
    console.warn('The interactive robot could not initialize.', error);
  }
}

async function start() {
  stage.dataset.mode = 'loading';
  status.textContent = 'Loading model';
  const graphics = await graphicsReady();
  if (!disposed) await openRenderer(graphics);
}

addEventListener('pagehide', (event) => {
  if (event.persisted) return;
  disposed = true;
  clearTimeout(deadline);
  request?.abort();
  callouts.dispose();
  atmosphere.dispose();
  posterSize.disconnect();
  inspector.dispose();
  controller?.dispose();
});

stage.dataset.view = cameraView;
mark(selectedPart, selectedSide);
inspector.init(cameraView, cameraSide);
showStill();
loadPosterPicking();
start();

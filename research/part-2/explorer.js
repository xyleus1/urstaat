import { createInspector } from './part-inspector.js?v=orbit-2';

const stage = document.querySelector('.taku-stage');
let canvas = stage.querySelector('canvas');
const still = stage.querySelector('picture');
const views = document.querySelector('#views');
const links = new Map([...views.querySelectorAll('[data-shot]')].map((link) => [link.dataset.shot, link]));
const status = stage.querySelector('.stage-status');
const tools = stage.querySelector('.stage-tools');
const mobile = matchMedia('(max-width: 760px), (pointer: coarse) and (max-width: 1100px)');
const bilateral = new Set(['shoulder', 'elbow', 'wrist', 'claw']);
function linkedView() {
  const fragment = location.hash.slice(1);
  if (fragment.startsWith('right-') && bilateral.has(fragment.slice(6))) return [fragment.slice(6), 'right'];
  return [links.has(fragment) ? fragment : 'overview', 'left'];
}
let [current, side] = linkedView();
let controller;
let stillRegions;
let disposed = false;
const inspector = createInspector();

function select(id, which = 'left', syncUrl = true) {
  if (!links.has(id)) return;
  current = id;
  side = which === 'right' && bilateral.has(id) ? 'right' : 'left';
  inspector.select(id, side);
  stage.dataset.view = id;
  if (bilateral.has(id)) stage.dataset.side = side;
  else delete stage.dataset.side;
  const hash = id === 'overview' ? '' : '#' + (side === 'right' ? 'right-' : '') + id;
  if (syncUrl && location.hash !== hash)
    history.replaceState(history.state, '', location.pathname + location.search + hash);
  for (const [shot, link] of links) {
    if (shot === id) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  }
}

function showStill() {
  const url = side === 'right' ? 'stills/right-' + current + '.webp' : links.get(current).getAttribute('href');
  still.querySelector('source').srcset = url.replace('.webp', '-mobile.webp');
  const image = still.querySelector('img');
  image.src = url;
  const label = (bilateral.has(current) ? side + ' ' : '') + links.get(current).textContent.toLowerCase();
  image.alt = 'Dyna Taku, ' + label + ' view.';
}

function useStills() {
  stage.dataset.mode = 'stills';
  delete stage.dataset.settled;
  tools.hidden = true;
  canvas.removeAttribute('tabindex');
  canvas.setAttribute('aria-hidden', 'true');
  status.textContent = '';
  showStill();
  if (!stillRegions) {
    fetch(new URL('assets/still-regions.json', import.meta.url))
      .then(async (response) => {
        if (!response.ok || disposed) return;
        const masks = await response.json();
        stillRegions = new Map(
          Object.entries(masks).map(([key, [width, height, bits]]) => [
            key,
            { width, height, bits: atob(bits) },
          ]),
        );
      })
      .catch(() => {});
  }
}

function overStillPart(event) {
  if (stage.dataset.mode !== 'stills' || !stillRegions) return false;
  const image = still.querySelector('img');
  if (!image.complete || !image.naturalWidth) return false;
  const mask = stillRegions.get(new URL(image.currentSrc).pathname.split('/').pop());
  if (!mask) return false;
  const rect = image.getBoundingClientRect();
  const scale = Math.min(rect.width / image.naturalWidth, rect.height / image.naturalHeight);
  const width = image.naturalWidth * scale,
    height = image.naturalHeight * scale;
  const x = Math.floor(((event.clientX - rect.left - (rect.width - width) / 2) * mask.width) / width);
  const y = Math.floor(((event.clientY - rect.top - (rect.height - height) / 2) * mask.height) / height);
  if (x < 0 || x >= mask.width || y < 0 || y >= mask.height) return false;
  const bit = y * mask.width + x;
  return !!(mask.bits.charCodeAt(bit >> 3) & (1 << (bit & 7)));
}
still.addEventListener('pointermove', (event) => {
  still.style.cursor = overStillPart(event) ? 'pointer' : '';
});
still.addEventListener('click', (event) => {
  if (overStillPart(event)) inspector.inspect(current, side);
});

function goTo(id, which = 'left', syncUrl = true) {
  select(id, which, syncUrl);
  if (stage.dataset.mode === 'live' && controller) {
    delete stage.dataset.settled;
    controller.setView(current, { side });
  } else {
    showStill();
  }
}

views.addEventListener('click', (event) => {
  const link = event.target.closest('[data-shot]');
  if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  goTo(link.dataset.shot);
});

addEventListener('hashchange', () => {
  const [id, which] = linkedView();
  if (id !== 'overview' || !location.hash || location.hash === '#overview') goTo(id, which, false);
});

tools.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button || !controller) return;
  if (button.id === 'reset') controller.reset();
  else controller.zoom(Number(button.dataset.zoom));
});

function graphicsReady() {
  if (!window.WebGL2RenderingContext) return Promise.resolve('unavailable');
  if (!window.Worker || !window.OffscreenCanvas) return Promise.resolve('unknown');
  return new Promise((resolve) => {
    let worker;
    try {
      worker = new Worker(new URL('gpu-check.js?v=orbit-2', import.meta.url));
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
function project(value) {
  stage.takuProjection = value;
  stage.dispatchEvent(new CustomEvent('taku-projection', { detail: value }));
}
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
  showStill();
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
  const opening = current,
    openingSide = side;
  const stale = () => disposed || session !== generation;
  const callbacks = {
    canvas: fresh,
    initialView: opening,
    initialSide: openingSide,
    previous,
    onViewChange(id, which) {
      if (!stale() && stage.dataset.mode === 'live') {
        delete stage.dataset.settled;
        select(id, which);
      }
    },
    onSettled(id) {
      if (!stale()) stage.dataset.settled = id;
    },
    onInspect(id, which) {
      if (!stale()) inspector.inspect(id, which);
    },
    onProjection(value) {
      if (!stale()) project(value);
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
      const [{ mountTaku }] = await Promise.all([import('./taku-viewer.min.js?v=orbit-2'), assetData]);
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
      const { mountCpu } = await import('./taku-cpu.js?v=orbit-2');
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
    if (current !== opening || side !== openingSide) controller.setView(current, { immediate: true, side });
    else stage.dataset.settled = current;
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
  inspector.dispose();
  controller?.dispose();
});

select(current, side, false);
if (current !== 'overview') showStill();
start();

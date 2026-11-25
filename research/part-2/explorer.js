import { createInspector } from './part-inspector.js';

const stage = document.querySelector('.taku-stage');
const canvas = stage.querySelector('canvas');
const still = stage.querySelector('picture');
const views = document.querySelector('#views');
const links = new Map([...views.querySelectorAll('[data-shot]')].map(link => [link.dataset.shot, link]));
const instructions = document.querySelector('#instructions');
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
  if (syncUrl && location.hash !== hash) history.replaceState(history.state, '', location.pathname + location.search + hash);
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
  instructions.textContent = 'Explore the still images. Click the outlined part to trace its inputs.';
  showStill();
  if (!stillRegions) {
    fetch(new URL('assets/still-regions.json', import.meta.url)).then(async response => {
      if (!response.ok || disposed) return;
      const masks = await response.json();
      stillRegions = new Map(Object.entries(masks).map(([key,[width,height,bits]]) =>
        [key,{width,height,bits:atob(bits)}]));
    }).catch(() => {});
  }
}

function overStillPart(event) {
  if (stage.dataset.mode !== 'stills' || !stillRegions) return false;
  const image = still.querySelector('img');
  if (!image.complete || !image.naturalWidth) return false;
  const mask = stillRegions.get(new URL(image.currentSrc).pathname.split('/').pop());
  if (!mask) return false;
  const rect = image.getBoundingClientRect();
  const scale = Math.min(rect.width/image.naturalWidth, rect.height/image.naturalHeight);
  const width = image.naturalWidth*scale, height = image.naturalHeight*scale;
  const x = Math.floor((event.clientX-rect.left-(rect.width-width)/2)*mask.width/width);
  const y = Math.floor((event.clientY-rect.top-(rect.height-height)/2)*mask.height/height);
  if (x<0 || x>=mask.width || y<0 || y>=mask.height) return false;
  const bit=y*mask.width+x;
  return !!(mask.bits.charCodeAt(bit>>3)&(1<<(bit&7)));
}
still.addEventListener('pointermove', event => { still.style.cursor=overStillPart(event)?'pointer':''; });
still.addEventListener('click', event => { if (overStillPart(event)) inspector.inspect(current,side); });

function goTo(id, which = 'left', syncUrl = true) {
  select(id, which, syncUrl);
  if (stage.dataset.mode === 'live') {
    delete stage.dataset.settled;
    controller.setView(current, { side });
  } else {
    showStill();
  }
}

views.addEventListener('click', event => {
  const link = event.target.closest('[data-shot]');
  if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  goTo(link.dataset.shot);
});

addEventListener('hashchange', () => {
  const [id, which] = linkedView();
  if (id !== 'overview' || !location.hash || location.hash === '#overview') goTo(id, which, false);
});

tools.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button || !controller) return;
  if (button.id === 'reset') controller.reset();
  else controller.zoom(Number(button.dataset.zoom));
});

function graphicsReady() {
  if (!window.Worker || !window.OffscreenCanvas) return Promise.resolve(true);
  return new Promise(resolve => {
    const worker = new Worker(new URL('gpu-check.js?v=components-1', import.meta.url));
    const finish = ok => { clearTimeout(timer); worker.terminate(); resolve(ok); };
    let timer = setTimeout(() => finish(false), 15000);
    worker.onmessage = ({ data }) => {
      if (data === 'probing') {
        clearTimeout(timer);
        timer = setTimeout(() => finish(false), 4500);
      } else finish(data);
    };
    worker.onerror = () => finish(false);
  });
}

async function start() {
  stage.dataset.mode = 'loading';
  status.textContent = 'Loading 3D…';
  try {
    if (!window.WebGL2RenderingContext) { stage.dataset.graphics = 'unavailable'; useStills(); return; }
    const rendering = import('./taku-viewer.min.js?v=components-1');
    rendering.catch(() => {});
    const graphics = graphicsReady();
    // Phones can start their single model request immediately. A desktop worker
    // first determines whether the browser is drawing through a software driver.
    const tier = mobile.matches ? 'mobile' : (await graphics === 'software' ? 'software' : 'desktop');
    if (disposed) return;
    const assetUrl = new URL('assets/taku-' + tier + '.glb', import.meta.url).href;
    const request = new AbortController();
    const assetData = fetch(assetUrl, { signal: request.signal }).then(response => {
      if (!response.ok) throw new Error('Model returned HTTP ' + response.status);
      return response.arrayBuffer();
    });
    assetData.catch(() => {}); // mountTaku reports a rejected model after import completes.
    const [{ mountTaku }, canDraw] = await Promise.all([rendering, graphics]);
    if (disposed || !canDraw) {
      request.abort();
      if (!canDraw) stage.dataset.graphics = 'unavailable';
      if (!disposed) useStills();
      return;
    }
    const opening = current, openingSide = side;
    stage.dataset.tier = tier;
    controller = await mountTaku({
      canvas, assetUrl, assetData, mobile: tier === 'mobile', initialView: opening, initialSide: openingSide,
      onViewChange(id, which) {
        if (stage.dataset.mode === 'live') {
          delete stage.dataset.settled;
          select(id, which);
        }
      },
      onSettled(id) { stage.dataset.settled = id; },
      onInspect(id, which) { inspector.inspect(id, which); },
      onError(error) {
        if (disposed) return;
        useStills();
        console.warn('Dyna Taku is showing still images.', error);
        controller?.dispose();
        controller = undefined;
      },
    });
    if (disposed || stage.dataset.mode === 'stills') { controller.dispose(); return; }
    stage.dataset.mode = 'live';
    if (current !== opening || side !== openingSide) controller.setView(current, { immediate: true, side });
    stage.dataset.settled = current;
    status.textContent = '';
    instructions.textContent = 'Drag to orbit. Click the outlined part to trace its inputs.';
    tools.hidden = false;
    canvas.removeAttribute('aria-hidden');
    canvas.tabIndex = 0;
    performance.mark('taku-interactive');
  } catch (error) {
    if (!disposed && stage.dataset.mode !== 'stills') {
      useStills();
      console.warn('Dyna Taku is showing still images.', error);
    }
  }
}

addEventListener('pagehide', event => {
  if (event.persisted) return;
  disposed = true;
  inspector.dispose();
  controller?.dispose();
});

select(current, side, false);
if (current !== 'overview') showStill();
start();

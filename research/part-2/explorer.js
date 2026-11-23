const stage = document.querySelector('.taku-stage');
const canvas = stage.querySelector('canvas');
const still = stage.querySelector('picture');
const views = document.querySelector('#views');
const links = new Map([...views.querySelectorAll('[data-shot]')].map(link => [link.dataset.shot, link]));
const instructions = document.querySelector('#instructions');
const status = stage.querySelector('.stage-status');
const tools = stage.querySelector('.stage-tools');
const mobile = matchMedia('(max-width: 760px)');
const bilateral = new Set(['shoulder', 'elbow', 'wrist', 'claw']);
function linkedView() {
  const fragment = location.hash.slice(1);
  if (fragment.startsWith('right-') && bilateral.has(fragment.slice(6))) return [fragment.slice(6), 'right'];
  return [links.has(fragment) ? fragment : 'overview', 'left'];
}
let [current, side] = linkedView();
let controller;
let disposed = false;

function select(id, which = 'left', syncUrl = true) {
  if (!links.has(id)) return;
  current = id;
  side = which === 'right' && bilateral.has(id) ? 'right' : 'left';
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
  instructions.textContent = 'Choose a view to explore the still images.';
  showStill();
}

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

async function start() {
  stage.dataset.mode = 'loading';
  status.textContent = 'Loading 3D…';
  const tier = mobile.matches ? 'mobile' : 'desktop';
  const assetUrl = new URL('assets/taku-' + tier + '.glb', import.meta.url).href;
  try {
    const { mountTaku } = await import('./taku-viewer.min.js');
    if (disposed) return;
    const opening = current, openingSide = side;
    controller = await mountTaku({
      canvas, assetUrl, initialView: opening, initialSide: openingSide,
      onViewChange(id, which) {
        if (stage.dataset.mode === 'live') {
          delete stage.dataset.settled;
          select(id, which);
        }
      },
      onSettled(id) { stage.dataset.settled = id; },
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
    instructions.textContent = 'Drag to orbit. Select a part to look closer.';
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
  controller?.dispose();
});

select(current, side, false);
if (current !== 'overview') showStill();
start();

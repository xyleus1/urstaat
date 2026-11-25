const lenses = {
  overview: ['Torso enclosure panel', 'panel'],
  side: ['Lower support pivot'],
  face: ['Optical assembly'],
  shoulder: ['Shoulder actuator', 'actuator'],
  elbow: ['Elbow actuator cap', 'actuator'],
  wrist: ['Wrist bearing cartridge', 'wrist'],
  claw: ['DynaClaw fingers and pads'],
  waist: ['Folding linkage'],
  base: ['Wheel assembly'],
};
const cutawayTitles = {
  actuator: 'Rotary actuator',
  wrist: 'Wrist bearing cartridge',
  panel: 'Formed enclosure panel',
};
const cutawayDescriptions = {
  actuator:
    'Exploded rotary actuator showing the motor, copper windings, planetary gears and output carrier.',
  wrist: 'Exploded wrist cartridge with concentric bearing races, rolling elements and seals.',
  panel: 'Exploded study of a formed enclosure panel and its fasteners.',
};

export function createInspector() {
  const panel = document.querySelector('#part-inspector');
  const trace = document.querySelector('#trace-part'),
    cutaway = document.querySelector('#show-cutaway');
  const map = document.querySelector('#supply-map'),
    closeMap = document.querySelector('#close-map');
  const dialog = document.querySelector('#cutaway-dialog'),
    host = document.querySelector('#cutaway-host');
  const status = document.querySelector('#atlas-load');
  const preview = document.querySelector('#cutaway-preview');
  preview.addEventListener('error', () => {
    preview.hidden = true;
  });
  preview.addEventListener('load', () => {
    preview.hidden = false;
  });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 'overview',
    side = 'left',
    atlas,
    assembly,
    loadingAtlas,
    session = 0,
    cutawayRequest = 0;
  let returnTo = trace;
  const scrollTo = (el) =>
    el.scrollIntoView({ block: 'start', behavior: reduced.matches ? 'instant' : 'smooth' });

  let traceAfterClose;
  async function loadMap(focusNode) {
    const version = ++session;
    status.textContent = 'Loading the supply map…';
    status.hidden = !!atlas;
    document.querySelector('#supply-title').textContent = lenses[current][0];
    try {
      loadingAtlas ||= import('./supply-map.js')
        .then((mod) => mod.createAtlas(map))
        .catch((err) => {
          loadingAtlas = null;
          throw err;
        });
      atlas = await loadingAtlas;
      if (version !== session || map.hidden) return;
      atlas.setPart(current, focusNode);
      status.hidden = true;
      document.querySelector('.atlas-body').hidden = false;
      atlas.resize();
    } catch {
      if (version !== session || map.hidden) return;
      status.hidden = false;
      status.textContent = 'The supply map could not load. ';
      const retry = document.createElement('button');
      retry.type = 'button';
      retry.className = 'text-control';
      retry.textContent = 'Try again';
      retry.onclick = () => loadMap(focusNode);
      status.append(retry);
    }
  }
  function showMap(source = trace, focusNode) {
    returnTo = source;
    if (map.hidden) {
      map.hidden = false;
      trace.setAttribute('aria-expanded', 'true');
      loadMap(focusNode);
    } else if (focusNode) loadMap(focusNode);
    const title = document.querySelector('#supply-title');
    title.focus({ preventScroll: true });
    scrollTo(map);
  }
  function select(id, which) {
    if (!lenses[id]) return;
    const changed = id !== current;
    current = id;
    side = which;
    panel.hidden = false;
    const [label, type] = lenses[id];
    const bilateral = ['shoulder', 'elbow', 'wrist', 'claw'].includes(id);
    const sided = bilateral
      ? (side === 'right' ? 'Right ' : 'Left ') + label[0].toLowerCase() + label.slice(1)
      : label;
    document.querySelector('#focused-part').textContent = sided;
    trace.setAttribute('aria-label', 'Trace inputs for ' + sided);
    cutaway.hidden = !type;
    if (type) {
      cutaway.setAttribute('aria-label', 'Open exploded view of ' + cutawayTitles[type]);
      if (preview.dataset.part !== type) {
        preview.dataset.part = type;
        preview.src = 'cutaways/' + type + '.webp';
      }
    }
    if (!map.hidden && changed) loadMap();
  }
  function hideMap() {
    ++session;
    map.hidden = true;
    trace.setAttribute('aria-expanded', 'false');
    if (!returnTo?.isConnected || returnTo.tabIndex < 0) returnTo = trace;
    returnTo.focus({ preventScroll: true });
    scrollTo(document.querySelector('.taku-instrument'));
  }
  closeMap.addEventListener('click', hideMap);
  trace.addEventListener('click', () => showMap(trace));
  async function openCutaway() {
    const type = lenses[current][1];
    if (!type || dialog.open) return;
    if (assembly) releaseCutaway();
    const request = ++cutawayRequest;
    document.querySelector('#cutaway-title').textContent = cutawayTitles[type];
    const image = new Image();
    image.src = 'cutaways/' + type + '.webp';
    image.alt = cutawayDescriptions[type];
    host.replaceChildren(image);
    dialog.showModal();
    document.querySelector('#close-cutaway').focus({ preventScroll: true });
    try {
      const { mountTakuCutaway } = await import('../../hero/taku-cutaways.js');
      if (request !== cutawayRequest || !dialog.open) return;
      assembly = mountTakuCutaway(host, {
        part: type,
        allow3D: document.querySelector('.taku-stage').dataset.graphics !== 'unavailable',
        onTrace(node) {
          traceAfterClose = node;
          dialog.close();
        },
      });
      await assembly.ready;
    } catch {
      if (request !== cutawayRequest || !dialog.open) return;
      assembly?.destroy();
      assembly = null;
      host.replaceChildren(image);
      const p = document.createElement('p');
      p.textContent = 'Static assembly study. Internal geometry is representative.';
      host.append(p);
    }
  }
  cutaway.addEventListener('click', openCutaway);
  document.querySelector('#close-cutaway').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => {
    if (e.target !== dialog) return;
    const b = dialog.getBoundingClientRect();
    if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom)
      dialog.close();
  });
  function releaseCutaway() {
    ++cutawayRequest;
    assembly?.destroy();
    assembly = null;
    host.replaceChildren();
  }
  dialog.addEventListener('close', () => {
    if (dialog.open) return;
    releaseCutaway();
    if (traceAfterClose) {
      const node = traceAfterClose;
      traceAfterClose = undefined;
      showMap(cutaway, node);
    } else cutaway.focus({ preventScroll: true });
  });
  return {
    select,
    inspect(id, which) {
      select(id, which);
      showMap(document.querySelector('#taku-canvas'));
    },
    dispose() {
      ++session;
      releaseCutaway();
      atlas?.destroy();
    },
  };
}

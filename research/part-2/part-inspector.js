import { robotParts, studyCatalog } from './robot-parts.js?v=inline-1';

function element(tag, className, label) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (label) node.textContent = label;
  return node;
}
function button(className, label) {
  const control = element('button', className, label);
  control.type = 'button';
  return control;
}
function sideOf(id, side) {
  return robotParts[id].bilateral && side === 'right' ? 'right' : 'left';
}

// The evidence controls remain available while geometry loads or when only the poster is supported.
export function mountInlineStudy(host, id, side, { onTrace, onClose, allow3D = true } = {}) {
  const part = robotParts[id];
  const study = studyCatalog[part.study];
  const sided = part.bilateral
    ? side[0].toUpperCase() + side.slice(1) + ' ' + part.label.toLowerCase()
    : part.label;
  const heading = element('h3', 'study-title', sided);
  heading.tabIndex = -1;
  const header = element('div', 'study-head');
  const close = button('study-close', '×');
  close.setAttribute('aria-label', 'Close part study');
  close.addEventListener('click', () => onClose?.());
  header.append(heading, close);
  const trace = button('cutaway-trace', 'Trace →');
  const footer = element('div', 'study-foot');
  const info = element('p', 'study-detail');
  info.setAttribute('aria-live', 'polite');
  const children = [header];
  const pieceButtons = [];
  let selected = -1,
    renderer,
    dead = false,
    viewport,
    poster;
  function choose(index) {
    selected = study?.parts[index] ? index : -1;
    const piece = study?.parts[selected];
    pieceButtons.forEach((control, index) =>
      control.setAttribute('aria-pressed', String(index === selected)),
    );
    host.dataset.selected = String(selected);
    info.textContent = piece?.detail || (study ? '' : part.info);
    info.hidden = !info.textContent;
    const target = piece?.trace || 'Trace ' + part.label.toLowerCase();
    trace.title = target;
    trace.setAttribute('aria-label', target);
    renderer?.selectPiece(selected);
  }
  trace.addEventListener('click', () => onTrace?.(study?.parts[selected]?.node || part.node));
  footer.append(trace);
  if (study) {
    viewport = element('div', 'study-viewport');
    poster = element('img', 'study-poster');
    poster.src = new URL('cutaways/' + part.study + '.webp', import.meta.url);
    poster.alt = study.title + ', with its parts separated along the assembly axis.';
    viewport.append(poster);
    const pieces = element('div', 'study-pieces');
    pieces.setAttribute('role', 'group');
    pieces.setAttribute('aria-label', 'Pieces of the ' + study.title.toLowerCase());
    study.parts.forEach(({ name }, index) => {
      const control = button('study-piece', name);
      control.dataset.piece = String(index);
      control.addEventListener('click', () => choose(selected === index ? -1 : index));
      pieceButtons.push(control);
      pieces.append(control);
    });
    const stopPreview = () => renderer?.previewPiece(-1);
    pieces.addEventListener('pointerover', (event) => {
      const target = event.target.closest('[data-piece]');
      if (event.pointerType === 'mouse' && target) renderer?.previewPiece(Number(target.dataset.piece));
    });
    pieces.addEventListener('pointerleave', stopPreview);
    pieces.addEventListener('focusin', (event) => renderer?.previewPiece(Number(event.target.dataset.piece)));
    pieces.addEventListener('focusout', stopPreview);
    const sources = element('details', 'study-sources');
    sources.append(
      element('summary', null, 'About this study'),
      element('p', null, study.summary),
      element('p', null, study.caption),
    );
    for (const [label, url] of study.links) {
      const a = element('a', '', label);
      a.href = url;
      sources.append(a);
    }
    children.push(viewport, pieces, info, footer, sources);
  } else {
    children.push(info, footer);
  }
  host.replaceChildren(...children);
  host.dataset.part = id;
  host.dataset.side = side;
  choose(-1);
  const ready = (async () => {
    if (!study) return false;
    try {
      const { mountTakuCutaway } = await import('../../hero/taku-cutaways.js?v=inline-1');
      if (dead) return false;
      renderer = mountTakuCutaway(viewport, {
        part: part.study,
        allow3D,
        preferenceHost: host,
        onSelect: choose,
      });
      renderer.selectPiece(selected);
      return await renderer.ready;
    } catch {
      if (!dead) viewport.replaceChildren(poster);
      return false;
    }
  })();
  return {
    ready,
    heading,
    destroy() {
      dead = true;
      renderer?.destroy();
      host.replaceChildren();
      delete host.dataset.selected;
      delete host.dataset.side;
      delete host.dataset.part;
    },
  };
}

export function createInspector({ onAtlasSelect, onCloseStudy } = {}) {
  const panel = document.querySelector('#part-study');
  const host = document.querySelector('#part-study-host');
  const map = document.querySelector('#supply-map');
  const status = map.querySelector('#atlas-load');
  const tabs = map.querySelector('#atlas-parts');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const listeners = new AbortController();
  let live = true,
    assembly,
    opener,
    atlas,
    loadingAtlas,
    version = 0;
  let atlasSide = 'left';
  const buttons = new Map();
  for (const [id, part] of Object.entries(robotParts)) {
    const tab = button('atlas-part', part.tab);
    tab.dataset.atlasPart = id;
    tab.setAttribute('aria-label', part.label);
    tab.setAttribute('aria-pressed', 'false');
    tab.addEventListener('click', () => selectAtlas(id, atlasSide), { signal: listeners.signal });
    buttons.set(id, tab);
  }
  tabs.replaceChildren(...buttons.values());

  async function selectAtlas(id = 'overview', side = 'left', node, scroll = false, notify = true) {
    if (!live || !Object.hasOwn(robotParts, id)) return;
    const ticket = ++version;
    const which = sideOf(id, side);
    if (robotParts[id].bilateral) atlasSide = which;
    map.hidden = false;
    map.dataset.side = which;
    buttons.forEach((tab, key) => tab.setAttribute('aria-pressed', String(key === id)));
    if (notify) onAtlasSelect?.(id, which);
    if (!atlas) {
      status.hidden = false;
      status.textContent = 'Loading inputs…';
      map.querySelector('#supply-title').textContent = robotParts[id].label;
    }
    try {
      loadingAtlas ||= import('./supply-map.js?v=inline-1')
        .then(({ createAtlas }) => createAtlas(map))
        .catch((error) => {
          loadingAtlas = undefined;
          throw error;
        });
      const loaded = await loadingAtlas;
      if (ticket !== version || !live) return;
      atlas = loaded;
      status.hidden = true;
      map.querySelector('.atlas-body').hidden = false;
      atlas.setPart(id, node);
      atlas.resize();
      if (scroll) {
        const title = map.querySelector('#step-detail h3');
        title.tabIndex = -1;
        title.focus({ preventScroll: true });
        map
          .querySelector('#site-file')
          .scrollIntoView({ block: 'center', behavior: reduced.matches ? 'instant' : 'smooth' });
      }
    } catch {
      if (!live || ticket !== version) return;
      status.hidden = false;
      status.textContent = 'Inputs could not load. ';
      const retry = button('text-control', 'Try again');
      retry.addEventListener('click', () => selectAtlas(id, which, node, scroll, false));
      status.append(retry);
    }
  }
  function close({ restoreFocus = true } = {}) {
    if (!assembly) return;
    assembly.destroy();
    assembly = undefined;
    panel.hidden = true;
    if (restoreFocus && opener?.isConnected) opener.focus({ preventScroll: true });
    opener = undefined;
    onCloseStudy?.();
  }
  function open(id, side = 'left', trigger = document.activeElement) {
    if (!live || !Object.hasOwn(robotParts, id)) return;
    const which = sideOf(id, side);
    assembly?.destroy();
    opener = trigger;
    panel.hidden = false;
    assembly = mountInlineStudy(host, id, which, {
      allow3D: document.querySelector('.taku-stage').dataset.graphics === 'hardware',
      onTrace: (node) => {
        close({ restoreFocus: false });
        selectAtlas(id, which, node, true);
      },
      onClose: close,
    });
    assembly.heading.focus({ preventScroll: true });
    return assembly.ready;
  }
  panel.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        close();
      }
    },
    { signal: listeners.signal },
  );
  return {
    init: (id = 'overview', side = 'left') => selectAtlas(id, side, undefined, false, false),
    open,
    close,
    selectAtlas,
    dispose() {
      live = false;
      ++version;
      listeners.abort();
      assembly?.destroy();
      if (atlas) atlas.destroy();
      else
        loadingAtlas?.then(
          (pending) => pending.destroy(),
          () => {},
        );
    },
  };
}

import { parts, nodes, edges } from './supply-data.js?v=orbit-2';
import { companyIdentity } from './supply-identity.js?v=orbit-2';

const stages = {
  raw: 'Raw inputs',
  refining: 'Refining',
  material: 'Materials',
  component: 'Components',
  assembly: 'Assembly',
};
const scopeNames = {
  representative: 'Representative process',
  producer: 'Industry example',
  'documented-process': 'Documented process',
  'verified-relationship': 'Documented relationship',
};
const reading = [
  {
    title: 'Dyna Taku model',
    url: 'https://github.com/dyna-robotics/dyna_robot_description/tree/afa61685f434a9a2a61e255711788bcfe2f42f92/dyna_taku',
  },
  { title: 'Humanity’s Last Machine', url: 'https://www.humanityslastmachine.com/' },
  {
    title: 'Natural Earth land data',
    url: 'https://www.naturalearthdata.com/downloads/110m-physical-vectors/110m-land/',
  },
];

function element(tag, cls, text) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (text) el.textContent = text;
  return el;
}
function button(label, click, cls) {
  const el = element('button', cls, label);
  el.type = 'button';
  el.addEventListener('click', click);
  return el;
}
function sourceLinks(sources) {
  const links = element('span', 'supply-sources');
  for (const { title, url } of new Map(sources.map((s) => [s.url, s])).values()) {
    const a = element('a', null, title);
    a.href = url;
    links.append(a);
  }
  return links;
}

export function createAtlas(root) {
  const canvas = root.querySelector('#supply-globe'),
    detail = root.querySelector('#step-detail');
  const index = root.querySelector('#stage-index'),
    mapButtons = root.querySelector('.globe-controls');
  const sequence = index.parentElement;
  const mapHint = root.querySelector('#map-use'),
    flatButtons = [...root.querySelectorAll('[data-projection]')];
  let globe,
    flat = false,
    part,
    network = [],
    sites = [],
    selected;
  let diagramFrame = 0;
  let disposed = false;
  let selectionFocus = 'opening';
  async function mountGlobe() {
    try {
      const { createGlobe } = await import('./supply-globe.min.js');
      if (disposed) return;
      globe = createGlobe(canvas, (item) => pick(item, false));
      if (sites.length) globe.setData(sites, network);
      globe.setFlat(flat);
      if (selected) globe.select(selected, selectionFocus);
    } catch {
      if (disposed) return;
      canvas.hidden = true;
      root.querySelector('.map-toolbar').hidden = true;
      root.querySelector('.atlas-legend').hidden = true;
      mapHint.textContent = 'Map unavailable. Each site and route is listed below.';
    }
  }
  const visibility = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    visibility.disconnect();
    mountGlobe();
  }, { rootMargin: '160px' });
  visibility.observe(canvas);
  function projection(value) {
    flat = value;
    globe?.setFlat(value);
    mapButtons.hidden = value;
    canvas.dataset.flat = String(value);
    flatButtons.forEach((b) =>
      b.setAttribute('aria-pressed', String((b.dataset.projection === 'flat') === value)),
    );
    mapHint.textContent = value
      ? 'Select a site or route.'
      : 'Drag to rotate. Select a site or route.';
  }
  for (const b of flatButtons) b.onclick = () => projection(b.dataset.projection === 'flat');
  for (const b of mapButtons.querySelectorAll('button'))
    b.onclick = () => {
      if (b.dataset.mapCommand === 'reset') globe?.reset();
      else globe?.zoom(b.dataset.mapCommand === 'in' ? 1.23 : 1 / 1.23);
    };
  function roleLabel(text, stage) {
    const el = element('p', 'step-kicker', text);
    if (stage) el.dataset.stage = stage;
    return el;
  }
  function linksGroup(label, paths, direction) {
    if (!paths.length) return;
    const wrap = element('div', 'connection-list');
    wrap.append(element('h5', null, label));
    for (const e of paths) {
      const other = nodes[direction === 'input' ? e.from : e.to];
      const b = button('', () => pick({ kind: 'edge', id: e.id }, true, true), 'connection-link');
      b.append(
        element('span', 'step-name', other.label),
        companyIdentity(other),
        element('small', null, e.label),
      );
      wrap.append(b);
    }
    detail.append(wrap);
  }
  function renderDetail() {
    detail.replaceChildren();
    if (!selected) return;
    if (selected.kind === 'node') {
      const node = nodes[selected.id];
      detail.append(
        roleLabel(stages[node.stage], node.stage),
        element('h3', null, node.label),
        companyIdentity(node),
        element(
          'p',
          'step-location',
          [node.site, node.place]
            .filter(Boolean)
            .filter((s, i, a) => a.indexOf(s) === i)
            .join(' · '),
        ),
        element('p', 'step-prose', node.detail),
      );
      detail.append(
        element('p', 'scope-type', scopeNames[node.scope] || node.scope),
        sourceLinks(node.sources),
      );
      linksGroup(
        'Inputs',
        network.filter((e) => e.to === node.id),
        'input',
      );
      linksGroup(
        'Feeds into',
        network.filter((e) => e.from === node.id),
        'output',
      );
    } else {
      const edge = edges[selected.id];
      detail.append(
        roleLabel(scopeNames[edge.scope] || edge.scope),
        element('h3', null, edge.label),
        element('p', 'step-prose', edge.detail),
      );
      const ends = element('div', 'edge-ends');
      for (const [word, id] of [
        ['From', edge.from],
        ['To', edge.to],
      ]) {
        const n = nodes[id];
        const b = button('', () => pick({ kind: 'node', id }, true, true), 'connection-link');
        b.append(element('small', null, word + ' · ' + n.place), element('span', 'step-name', n.label), companyIdentity(n));
        ends.append(b);
      }
      detail.append(ends, sourceLinks(edge.sources));
    }
  }
  function pick(item, focus, moveFocus = false) {
    selected = item;
    selectionFocus = focus;
    renderDetail();
    root.querySelector('#site-file').scrollTop = 0;
    globe?.select(item, focus);
    const e = item.kind === 'edge' ? edges[item.id] : null;
    for (const b of index.querySelectorAll('[data-site]')) {
      if (item.kind === 'node' && b.dataset.site === item.id) b.setAttribute('aria-current', 'true');
      else b.removeAttribute('aria-current');
      b.classList.toggle('is-endpoint', !!e && (b.dataset.site === e.from || b.dataset.site === e.to));
    }
    for (const line of index.querySelectorAll('[data-wire]')) {
      const edge = edges[line.dataset.wire];
      line.classList.toggle(
        'is-selected',
        item.kind === 'edge' ? edge.id === item.id : edge.from === item.id || edge.to === item.id,
      );
    }
    if (moveFocus) {
      const title = detail.querySelector('h3');
      title.tabIndex = -1;
      title.focus({ preventScroll: true });
      root.querySelector('#site-file').scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
  }
  function drawWires() {
    diagramFrame = 0;
    const svg = index.querySelector('svg');
    if (!svg || !index.clientWidth) return;
    const ns = 'http://www.w3.org/2000/svg';
    const ref = index.getBoundingClientRect();
    sequence.closest('.chain-index').dataset.scrolls = String(
      sequence.scrollWidth > sequence.clientWidth + 2,
    );
    const boxes = new Map(
      [...index.querySelectorAll('[data-site]')].map((button) => {
        const rect = button.getBoundingClientRect();
        return [button.dataset.site, { x: rect.x - ref.x, y: rect.y - ref.y, w: rect.width, h: rect.height }];
      }),
    );
    svg.setAttribute('viewBox', '0 0 ' + ref.width + ' ' + ref.height);
    const fragment = document.createDocumentFragment();
    const defs = document.createElementNS(ns, 'defs'),
      arrow = document.createElementNS(ns, 'marker');
    arrow.id = 'sequence-arrow';
    arrow.setAttribute('viewBox', '0 0 6 6');
    arrow.setAttribute('refX', '6');
    arrow.setAttribute('refY', '3');
    arrow.setAttribute('markerWidth', '5');
    arrow.setAttribute('markerHeight', '5');
    arrow.setAttribute('orient', 'auto');
    const head = document.createElementNS(ns, 'polygon');
    head.setAttribute('points', '0,0 6,3 0,6');
    head.setAttribute('fill', '#a9bab4');
    arrow.append(head);
    defs.append(arrow);
    fragment.append(defs);
    for (const e of network) {
      const a = boxes.get(e.from),
        b = boxes.get(e.to);
      if (!a || !b) continue;
      const x1 = a.x + a.w,
        y1 = a.y + a.h / 2,
        x2 = b.x,
        y2 = b.y + b.h / 2;
      const gap = x2 - x1;
      const path = document.createElementNS(ns, 'path');
      path.dataset.wire = e.id;
      path.classList.toggle('is-recorded', e.scope === 'verified-relationship');
      path.classList.toggle(
        'is-selected',
        selected?.kind === 'edge' ? e.id === selected.id : e.from === selected?.id || e.to === selected?.id,
      );
      // Long connections travel along the top margin, clear of intermediate boxes.
      if (gap > a.w) {
        const lane = 11 + (network.indexOf(e) % 5) * 3.5;
        path.setAttribute(
          'd',
          'M' +
            x1 +
            ' ' +
            y1 +
            ' C' +
            (x1 + 12) +
            ' ' +
            y1 +
            ' ' +
            (x1 + 12) +
            ' ' +
            lane +
            ' ' +
            (x1 + 24) +
            ' ' +
            lane +
            ' H' +
            (x2 - 22) +
            ' C' +
            (x2 - 10) +
            ' ' +
            lane +
            ' ' +
            (x2 - 13) +
            ' ' +
            y2 +
            ' ' +
            x2 +
            ' ' +
            y2,
        );
      } else {
        const mid = (x1 + x2) / 2;
        path.setAttribute(
          'd',
          'M' + x1 + ' ' + y1 + ' C' + mid + ' ' + y1 + ' ' + mid + ' ' + y2 + ' ' + x2 + ' ' + y2,
        );
      }
      path.setAttribute('marker-end', 'url(#sequence-arrow)');
      const hit = document.createElementNS(ns, 'path');
      hit.setAttribute('class', 'wire-hit');
      hit.setAttribute('d', path.getAttribute('d'));
      const name = document.createElementNS(ns, 'title');
      name.textContent = e.label;
      hit.append(name);
      hit.addEventListener('click', () => pick({ kind: 'edge', id: e.id }, true, true));
      fragment.append(path, hit);
    }
    svg.replaceChildren(fragment);
  }
  function queueWires() {
    if (!diagramFrame) diagramFrame = requestAnimationFrame(drawWires);
  }
  const observer = new ResizeObserver(queueWires);
  observer.observe(index);
  for (const b of root.querySelectorAll('[data-sequence-scroll]'))
    b.onclick = () => {
      sequence.scrollBy({
        left: Number(b.dataset.sequenceScroll) * Math.max(220, sequence.clientWidth * 0.75),
        behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'instant' : 'smooth',
      });
    };
  function renderIndex() {
    index.replaceChildren();
    const depth = new Map();
    function rank(id) {
      if (depth.has(id)) return depth.get(id);
      const inputs = network.filter((e) => e.to === id);
      const n = inputs.length ? 1 + Math.max(...inputs.map((e) => rank(e.from))) : 0;
      depth.set(id, n);
      return n;
    }
    sites.forEach((n) => rank(n.id));
    const levels = 1 + Math.max(...depth.values());
    index.style.setProperty('--columns', levels);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('aria-hidden', 'true');
    index.append(svg);
    const rankOrder = new Map(sites.map((n, i) => [n.id, i]));
    for (let i = 0; i < levels; i++) {
      const group = sites.filter((n) => depth.get(n.id) === i);
      const upstream = (n) => {
        const positions = network.filter((e) => e.to === n.id).map((e) => rankOrder.get(e.from));
        return positions.length
          ? positions.reduce((a, b) => a + b, 0) / positions.length
          : rankOrder.get(n.id);
      };
      group.sort((a, b) => upstream(a) - upstream(b));
      const section = element('div', 'stage-column');
      for (const n of group) {
        const b = button('', () => pick({ kind: 'node', id: n.id }, true, true), 'index-step');
        b.dataset.site = n.id;
        b.dataset.stage = n.stage;
        rankOrder.set(n.id, group.indexOf(n));
        b.append(
          element('small', 'sequence-stage', stages[n.stage]),
          element('span', 'step-name', n.label),
          companyIdentity(n),
          element('small', 'sequence-location', n.place),
        );
        section.append(b);
      }
      index.append(section);
    }
    sequence.scrollLeft = 0;
    queueWires();
  }
  return {
    setPart(id, focusNode) {
      if (part === parts[id]) {
        if (focusNode && sites.some((node) => node.id === focusNode)) pick({ kind: 'node', id: focusNode }, true);
        return;
      }
      part = parts[id];
      network = part.edgeIds.map((key) => edges[key]);
      sites = [...new Set(network.flatMap((e) => [e.from, e.to]))].map((key) => nodes[key]);
      root.querySelector('#supply-title').textContent = part.label;
      root.querySelector('#supply-summary').textContent = part.summary;
      root.querySelector('#geometry-note').textContent = part.geometry;
      root.querySelector('#atlas-references').replaceChildren(sourceLinks([...part.sources, ...reading]));
      root.querySelector('#step-count').textContent =
        sites.length + ' steps · ' + network.length + ' connections';
      renderIndex();
      globe?.setData(sites, network);
      const fromStudy = focusNode && sites.some((node) => node.id === focusNode);
      pick({ kind: 'node', id: fromStudy ? focusNode : part.focusNode }, fromStudy ? true : 'opening');
      root.dataset.part = id;
    },
    resize() {
      queueWires();
    },
    destroy() {
      disposed = true;
      visibility.disconnect();
      globe?.destroy();
      observer.disconnect();
      cancelAnimationFrame(diagramFrame);
    },
  };
}

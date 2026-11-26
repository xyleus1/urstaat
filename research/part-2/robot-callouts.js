import { robotParts } from './robot-parts.js?v=inline-1';

const svgNS = 'http://www.w3.org/2000/svg';
const captions = { overview: 'Enclosure', face: 'Head optics', shoulder: 'shoulder', elbow: 'elbow', wrist: 'wrist' };
const key = (id, side) => id + '-' + side;

export function mountCallouts(layer, card, open) {
  const surface = layer.parentElement;
  const diagram = document.createElementNS(svgNS, 'svg');
  diagram.setAttribute('aria-hidden', 'true');
  layer.append(diagram);
  const entries = new Map();
  let latest = [], selected = '', width = 0, height = 0, rightEdge = 0;

  for (const [id, part] of Object.entries(robotParts)) {
    if (!part.study) continue;
    for (const side of part.bilateral ? ['left', 'right'] : ['left']) {
      const group = document.createElementNS(svgNS, 'g');
      group.dataset.part = id;
      group.dataset.side = side;
      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute('class', 'robot-leader');
      const pin = document.createElementNS(svgNS, 'circle');
      pin.setAttribute('class', 'robot-pin');
      pin.setAttribute('r', '2.6');
      group.append(path, pin);
      diagram.append(group);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'robot-callout';
      button.dataset.callout = '';
      button.dataset.part = id;
      button.dataset.side = side;
      button.setAttribute('aria-controls', 'part-study');
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', 'Inspect ' + (part.bilateral ? side + ' ' : '') + part.label.toLowerCase());
      const label = document.createElement('span');
      label.textContent = (part.bilateral ? (side === 'left' ? 'L. ' : 'R. ') : '') + captions[id];
      button.append(label);
      button.addEventListener('click', () => open(id, side, button));
      layer.append(button);
      button.hidden = true;
      group.style.display = 'none';
      entries.set(key(id, side), { button, group, pin, path, width: 0 });
    }
  }

  function select(id, side, studyKey) {
    selected = key(id, side);
    for (const [entryKey, entry] of entries) {
      const active = entryKey === selected;
      entry.button.toggleAttribute('data-selected', active);
      entry.group.toggleAttribute('data-selected', active);
      entry.button.setAttribute('aria-expanded', String(entryKey === studyKey));
    }
  }
  function measure() {
    const r = surface.getBoundingClientRect();
    width = r.width;
    height = r.height;
    const box = card.getBoundingClientRect();
    rightEdge = !card.hidden && box.top < r.bottom && box.left > r.left + r.width * .5
      ? Math.min(width, box.left - r.left - 12) : width;
    for (const entry of entries.values()) entry.width = 0;
    place();
  }
  function place() {
    if (!width || !height) return;
    const available = new Map();
    for (const p of latest) {
      if (p.x < 0 || p.y < 0 || p.x > 1 || p.y > 1) continue;
      available.set(key(p.id, robotParts[p.id]?.bilateral && p.side === 'right' ? 'right' : 'left'), p);
    }
    if (layer.hidden !== !available.size) layer.hidden = !available.size;
    const items = [];
    for (const [k, e] of entries) {
      const p = available.get(k);
      if (e.button.hidden !== !p) {
        e.button.hidden = !p;
        e.group.style.display = p ? '' : 'none';
      }
      if (p) items.push({ entry: e, x: p.x * width, y: p.y * height });
    }
    if (!items.length) return;
    for (const { entry } of items) {
      if (!entry.width) entry.width = entry.button.offsetWidth;
    }
    items.sort((a,b) => a.x - b.x);
    const middle = Math.ceil(items.length / 2);
    const halves = [items.slice(0, middle), items.slice(middle)];
    const mobile = width < 680, gutter = mobile ? 8 : Math.max(18, width * .035);
    const gap = mobile ? 39 : 44;
    for (const [index, members] of halves.entries()) {
      members.sort((a,b) => a.y - b.y);
      const bottom = height - (width > 760 ? 58 : 4);
      const row = Math.min(gap, (bottom - 4) / Math.max(1,members.length));
      let prev = 4 - row / 2;
      for (const [i, { entry: e, x, y }] of members.entries()) {
        const cy = Math.max(prev + row, Math.min(y, bottom - (members.length - i - .5) * row));
        prev = cy;
        const left = index === 0;
        const idealEdge = left ? Math.min(x - 23, width * .34) : Math.max(x + 23, width * .66);
        const bx = left
          ? Math.max(gutter, Math.min(idealEdge - e.width, rightEdge - e.width - gutter))
          : Math.max(gutter, Math.min(idealEdge, rightEdge - e.width - gutter));
        const tip = left ? bx + e.width : bx;
        const elbow = tip + (left ? 1 : -1) * Math.min(18, Math.abs(x - tip) * .45);
        const buttonHeight = width <= 760 ? 38 : 42;
        const position = 'translate(' + Math.round(bx) + 'px,' + Math.round(cy - buttonHeight / 2) + 'px)';
        if (position !== e.position) {
          e.button.style.transform = position;
          e.position = position;
        }
        const path = 'M' + Math.round(tip) + ' ' + Math.round(cy) + 'H' + Math.round(elbow) + 'L' + Math.round(x) + ' ' + Math.round(y);
        if (path !== e.leader) {
          e.path.setAttribute('d', path);
          e.pin.setAttribute('cx', Math.round(x));
          e.pin.setAttribute('cy', Math.round(y));
          e.leader = path;
        }
      }
    }
  }
  const sizes = new ResizeObserver(measure);
  sizes.observe(surface);
  sizes.observe(card);
  const change = new MutationObserver(measure);
  change.observe(card, { attributes: true, attributeFilter: ['hidden'] });
  measure();
  return {
    update(anchors) { latest = anchors; place(); },
    select,
    measure,
    dispose() { sizes.disconnect(); change.disconnect(); layer.replaceChildren(); },
  };
}

// Connect the visible CAD selection to its exploded study in page coordinates.
// Still masks already have the correct mobile crop and contain only visible ink.
export function mountCutawayConnector() {
  const instrument = document.querySelector('.taku-instrument'),
    stage = instrument?.querySelector('.taku-stage');
  const preview = instrument?.querySelector('#show-cutaway'),
    still = stage?.querySelector('#still img');
  if (!stage || !preview || !still) return { dispose() {} };
  const abort = new AbortController(),
    on = (target, type, callback, opts = {}) =>
      target.addEventListener(type, callback, { ...opts, signal: abort.signal });
  const ns = 'http://www.w3.org/2000/svg',
    svg = document.createElementNS(ns, 'svg'),
    path = document.createElementNS(ns, 'path'),
    dot = document.createElementNS(ns, 'circle');
  svg.classList.add('taku-cutaway-connector');
  svg.setAttribute('aria-hidden', 'true');
  dot.setAttribute('r', '3');
  svg.append(path, dot);
  instrument.append(svg);
  const masks = new Map();
  let request = 0,
    loading = false,
    previewHover = false,
    modelHover = false,
    pointer = null,
    focused = false,
    released = false;
  function paintSoon() {
    if (!released && !request) request = requestAnimationFrame(paint);
  }
  function imageMask() {
    if (!still.currentSrc || !still.complete || !still.naturalWidth) return;
    if (!loading) {
      loading = true;
      fetch(new URL('../research/part-2/assets/still-regions.json', import.meta.url), {
        signal: abort.signal,
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!data || released) return;
          for (const [key, [width, height, b64]] of Object.entries(data)) {
            const bits = atob(b64);
            let count = 0,
              sumX = 0,
              sumY = 0;
            for (let i = 0; i < width * height; i++)
              if (bits.charCodeAt(i >> 3) & (1 << (i & 7))) {
                sumX += i % width;
                sumY += Math.floor(i / width);
                count++;
              }
            if (!count) continue;
            const cx = sumX / count,
              cy = sumY / count;
            let best = Infinity,
              anchor;
            for (let i = 0; i < width * height; i++)
              if (bits.charCodeAt(i >> 3) & (1 << (i & 7))) {
                const x = i % width,
                  y = Math.floor(i / width),
                  d = (x - cx) ** 2 + (y - cy) ** 2;
                if (d < best) {
                  best = d;
                  anchor = [(x + 0.5) / width, (y + 0.5) / height];
                }
              }
            masks.set(key, { width, height, bits, anchor });
          }
          paintSoon();
        })
        .catch(() => {});
    }
    return masks.get(new URL(still.currentSrc).pathname.split('/').pop());
  }
  function boundsOfImage() {
    const b = still.getBoundingClientRect(),
      k = Math.min(b.width / still.naturalWidth, b.height / still.naturalHeight);
    const width = still.naturalWidth * k,
      height = still.naturalHeight * k;
    return { left: b.left + (b.width - width) / 2, top: b.top + (b.height - height) / 2, width, height };
  }
  function paint() {
    request = 0;
    let anchor = null,
      over = false;
    if (!preview.hidden && !document.querySelector('#cutaway-dialog')?.open) {
      if (stage.dataset.mode === 'stills') {
        const mask = imageMask();
        if (mask) {
          const b = boundsOfImage();
          anchor = [b.left + b.width * mask.anchor[0], b.top + b.height * mask.anchor[1]];
          if (pointer && modelHover) {
            const x = Math.floor(((pointer[0] - b.left) * mask.width) / b.width),
              y = Math.floor(((pointer[1] - b.top) * mask.height) / b.height),
              i = y * mask.width + x;
            over =
              x >= 0 &&
              x < mask.width &&
              y >= 0 &&
              y < mask.height &&
              !!(mask.bits.charCodeAt(i >> 3) & (1 << (i & 7)));
          }
        }
      } else if (stage.dataset.mode === 'live') {
        const p = stage.takuProjection,
          b = stage.querySelector('#taku-canvas').getBoundingClientRect();
        if (p?.visible && p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1) {
          anchor = [b.left + p.x * b.width, b.top + p.y * b.height];
          const canvas = stage.querySelector('#taku-canvas');
          over =
            modelHover &&
            (canvas.dataset.partHovered === undefined
              ? canvas.style.cursor === 'pointer'
              : canvas.dataset.partHovered === 'true');
        }
      }
    }
    if (!anchor || !(over || previewHover || focused)) {
      svg.removeAttribute('data-visible');
      return;
    }
    if (over && pointer && !previewHover) anchor = pointer;
    const box = instrument.getBoundingClientRect(),
      card = preview.getBoundingClientRect();
    if (!card.width || !box.height) {
      svg.removeAttribute('data-visible');
      return;
    }
    const a = [anchor[0] - box.left, anchor[1] - box.top],
      clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    // The endpoint is the nearest edge of the button, including its docked phone layout.
    const sides = [
      [card.left, clamp(anchor[1], card.top + 4, card.bottom - 4)],
      [card.right, clamp(anchor[1], card.top + 4, card.bottom - 4)],
      [clamp(anchor[0], card.left + 4, card.right - 4), card.top],
      [clamp(anchor[0], card.left + 4, card.right - 4), card.bottom],
    ];
    let target = sides[0],
      distance = Infinity;
    for (const s of sides) {
      const d = Math.hypot(s[0] - anchor[0], s[1] - anchor[1]);
      if (d < distance) {
        target = s;
        distance = d;
      }
    }
    const bx = target[0] - box.left,
      by = target[1] - box.top,
      sign = Math.sign(bx - a[0]);
    const bend = bx - sign * Math.min(Math.abs(bx - a[0]) * 0.36, 50);
    svg.setAttribute('viewBox', '0 0 ' + box.width + ' ' + box.height);
    path.setAttribute('d', 'M ' + a[0] + ' ' + a[1] + ' L ' + bend + ' ' + by + ' L ' + bx + ' ' + by);
    dot.setAttribute('cx', a[0]);
    dot.setAttribute('cy', a[1]);
    svg.dataset.visible = 'true';
  }
  on(preview, 'pointerenter', (event) => {
    previewHover = event.pointerType !== 'touch';
    paintSoon();
  });
  on(preview, 'pointerleave', () => {
    previewHover = false;
    paintSoon();
  });
  on(preview, 'focus', () => {
    focused = !matchMedia('(hover: none)').matches || preview.matches(':focus-visible');
    paintSoon();
  });
  on(preview, 'blur', () => {
    focused = false;
    paintSoon();
  });
  on(stage, 'focusin', (event) => {
    focused =
      event.target.id === 'taku-canvas' &&
      (!matchMedia('(hover: none)').matches || event.target.matches(':focus-visible'));
    paintSoon();
  });
  on(stage, 'focusout', () => {
    focused = false;
    paintSoon();
  });
  on(stage, 'pointermove', (e) => {
    modelHover = e.pointerType !== 'touch' && (e.target.id === 'taku-canvas' || e.target === still);
    pointer = [e.clientX, e.clientY];
    paintSoon();
  });
  on(stage, 'pointerleave', () => {
    modelHover = false;
    pointer = null;
    paintSoon();
  });
  on(stage, 'taku-projection', paintSoon);
  on(stage, 'taku-hover', paintSoon);
  on(still, 'load', paintSoon);
  on(document.querySelector('#cutaway-dialog'), 'close', paintSoon);
  const changes = new MutationObserver(paintSoon);
  changes.observe(stage, {
    attributes: true,
    subtree: true,
    attributeFilter: ['data-view', 'data-side', 'data-mode', 'data-part-hovered', 'style'],
  });
  changes.observe(preview, { attributes: true, attributeFilter: ['hidden'] });
  const size = new ResizeObserver(paintSoon);
  size.observe(instrument);
  size.observe(preview);
  paintSoon();
  return {
    dispose() {
      released = true;
      abort.abort();
      changes.disconnect();
      size.disconnect();
      cancelAnimationFrame(request);
      svg.remove();
    },
  };
}

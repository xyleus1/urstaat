(() => {
  'use strict';

  const canvas = document.querySelector('#circuit');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const makeLayer = () => {
    const surface = document.createElement('canvas');
    return { surface, context: surface.getContext('2d') };
  };
  const base = makeLayer();
  const lit = makeLayer();
  const heat = makeLayer();
  const reveal = makeLayer();
  const layers = [base, lit, heat, reveal];
  if (layers.some(layer => !layer.context)) return;

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0;
  let height = 0;
  let scale = 1;
  let frame = 0;
  let lastTime = 0;
  let lastMove = -Infinity;
  let fadeUntil = 0;
  let resizeTimer;
  const pointer = { x: -1000, y: -1000, inside: false };

  // Component-led routing rather than a repeating maze: ICs, tiny passives,
  // connector pads, two copper layers and loose, unfinished airwires.
  function makeBoard() {
    let seed = 8101987;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const between = (a, b) => a + random() * (b - a);
    const choose = list => list[Math.floor(random() * list.length)];
    const copper = [new Path2D(), new Path2D()];
    const silk = new Path2D();
    const pads = new Path2D();
    const holes = new Path2D();
    const bodies = new Path2D();
    const air = new Path2D();
    const terminals = [];
    const components = [];
    const labels = [];
    const area = width * height;

    function addComponent(x, y, w, h, kind, index, angle = 0) {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const point = (px, py) => [x + px * cos - py * sin, y + px * sin + py * cos];
      const line = (path, points, close = false) => {
        path.moveTo(...point(...points[0]));
        points.slice(1).forEach(p => path.lineTo(...point(...p)));
        if (close) path.closePath();
      };
      const rect = (path, px, py, pw, ph) => line(path, [[px, py], [px + pw, py], [px + pw, py + ph], [px, py + ph]], true);
      const pin = (px, py, pw, ph) => {
        rect(pads, px - pw / 2, py - ph / 2, pw, ph);
        const position = point(px, py);
        terminals.push({ x: position[0], y: position[1], component: components.length });
      };
      components.push({ x, y, w, h });
      rect(silk, -w / 2 - 3, -h / 2 - 3, w + 6, h + 6);
      rect(bodies, -w / 2, -h / 2, w, h);
      labels.push({ x: x - w / 2, y: y - h / 2 - 8, text: `${kind}${index}` });

      if (kind === 'U') {
        const pins = Math.floor(w / 6);
        for (let n = 0; n < pins; n++) {
          const position = -w / 2 + 4 + n * (w - 8) / (pins - 1);
          pin(position, -h / 2 - 4, 2.7, 7);
          pin(position, h / 2 + 4, 2.7, 7);
          pin(-w / 2 - 4, position, 7, 2.7);
          pin(w / 2 + 4, position, 7, 2.7);
        }
        const [dx, dy] = point(-w / 2 + 6, -h / 2 + 6);
        silk.moveTo(dx + 1.5, dy);
        silk.arc(dx, dy, 1.5, 0, Math.PI * 2);
        line(silk, [[-w / 2, -h / 2 + 8], [-w / 2 + 8, -h / 2]]);
      } else if (kind === 'J') {
        for (let n = 0; n < 8; n++) {
          for (const row of [-1, 1]) {
            const px = -w / 2 + 5 + n * 8;
            pin(px, row * 4, 4.6, 4.6);
            const [hx, hy] = point(px, row * 4);
            holes.moveTo(hx + 1.1, hy);
            holes.arc(hx, hy, 1.1, 0, Math.PI * 2);
          }
        }
      } else {
        pin(-w / 2, 0, 4, h + 2);
        pin(w / 2, 0, 4, h + 2);
        if (kind === 'C') line(silk, [[-1, -h / 2 - 2], [-1, h / 2 + 2]]);
      }
    }

    const anchors = [[.18, .22], [.76, .30], [.32, .78], [.82, .79], [.13, .58], [.57, .13], [.62, .86]];
    const chips = Math.min(7, Math.max(3, Math.floor(area / 210000) + 1));
    for (let i = 0; i < chips; i++) {
      const [ax, ay] = anchors[i];
      const size = between(35, 66);
      addComponent(ax * width + between(-18, 18), ay * height + between(-18, 18), size, size, 'U', i + 1);
    }
    const passives = Math.min(145, Math.floor(area / 10500));
    for (let i = 0; i < passives; i++) {
      const anchor = components[Math.floor(random() * chips)];
      let x = random() < .73 ? anchor.x + between(-135, 135) : between(10, width - 10);
      let y = random() < .73 ? anchor.y + between(-120, 120) : between(10, height - 10);
      x = Math.max(12, Math.min(width - 12, x));
      y = Math.max(14, Math.min(height - 14, y));
      if (components.some(c => Math.abs(c.x - x) < c.w / 2 + 10 && Math.abs(c.y - y) < c.h / 2 + 9)) continue;
      addComponent(x, y, between(10, 17), between(4, 6), i % 3 ? 'R' : 'C', i + 1, random() < .5 ? Math.PI / 2 : 0);
    }
    const connectors = width < 600 ? [[.22, .9], [.8, .08]] : [[.08, .1], [.91, .55], [.54, .93]];
    connectors.forEach(([x, y], i) => addComponent(width * x, height * y, 66, 15, 'J', i + 1, i % 2 ? Math.PI / 2 : 0));

    function via(path, x, y) {
      path.moveTo(x + 2.3, y);
      path.arc(x, y, 2.3, 0, Math.PI * 2);
      holes.moveTo(x + .85, y);
      holes.arc(x, y, .85, 0, Math.PI * 2);
    }

    function route(a, b, path) {
      let x = a.x;
      let y = a.y;
      path.moveTo(x, y);
      const horizontal = random() < .5;
      const lead = between(7, 23) * (horizontal ? Math.sign(b.x - x) : Math.sign(b.y - y));
      if (horizontal) x += lead; else y += lead;
      path.lineTo(x, y);
      const bend = horizontal ? x + (b.x - x) * between(.22, .8) : y + (b.y - y) * between(.22, .8);
      const points = horizontal ? [[bend, y], [bend, b.y], [b.x, b.y]] : [[x, bend], [b.x, bend], [b.x, b.y]];
      // Short 45-degree elbows, uneven run lengths, shared buses and crossings.
      for (let i = 0; i < points.length - 1; i++) {
        const [px, py] = points[i];
        const [nx, ny] = points[i + 1];
        const dx = Math.sign(px - x), dy = Math.sign(py - y);
        const tx = Math.sign(nx - px), ty = Math.sign(ny - py);
        const cut = Math.min(8, Math.abs(px - x || py - y) / 3, Math.abs(nx - px || ny - py) / 3);
        path.lineTo(px - dx * cut, py - dy * cut);
        path.lineTo(px + tx * cut, py + ty * cut);
        x = px + tx * cut; y = py + ty * cut;
      }
      path.lineTo(b.x, b.y);
      if (random() < .27) via(path, b.x, b.y);
    }

    terminals.forEach((terminal, i) => {
      const near = terminals.filter(t => t.component !== terminal.component && Math.hypot(t.x - terminal.x, t.y - terminal.y) < 310);
      if (!near.length || random() < .16) return;
      route(terminal, choose(near), copper[i % 4 === 0 ? 1 : 0]);
    });

    // These unrouted nets are intentionally direct, like a board still being worked on.
    for (let i = 0; i < (width < 600 ? 22 : 48); i++) {
      const a = choose(terminals);
      const b = choose(terminals);
      if (a.component === b.component) continue;
      air.moveTo(a.x, a.y);
      air.lineTo(b.x, b.y);
    }

    function draw(context, bright) {
      context.lineJoin = 'round';
      context.lineCap = 'round';
      context.fillStyle = bright ? '#101a13' : '#040604';
      context.fill(bodies);
      context.lineWidth = bright ? 1 : .65;
      context.strokeStyle = bright ? '#788a70' : '#1a2119';
      context.stroke(silk);
      context.fillStyle = bright ? '#a5ac70' : '#2a2c1c';
      context.fill(pads);
      for (let i = 0; i < 2; i++) {
        context.lineWidth = i ? .7 : 1;
        context.strokeStyle = bright ? (i ? '#be8062' : '#8fc391') : (i ? '#241916' : '#122319');
        context.shadowBlur = bright ? 4 : 0;
        context.shadowColor = i ? '#aa6249' : '#66b47a';
        context.stroke(copper[i]);
      }
      context.shadowBlur = 0;
      context.lineWidth = .55;
      context.strokeStyle = bright ? '#babd6a' : '#2a2a16';
      context.stroke(air);
      context.fillStyle = '#000';
      context.fill(holes);
      context.font = '8px Arial';
      context.fillStyle = bright ? '#969b79' : '#293023';
      labels.forEach(label => context.fillText(label.text, label.x, label.y));

      // A soft ink wash keeps the type readable without cutting a rectangular hole.
      const wash = context.createRadialGradient(width / 2, height / 2, 25, width / 2, height / 2, Math.min(width * .56, 330));
      wash.addColorStop(0, 'rgba(0,0,0,.96)');
      wash.addColorStop(.4, 'rgba(0,0,0,.87)');
      wash.addColorStop(1, 'rgba(0,0,0,0)');
      context.globalCompositeOperation = 'destination-out';
      context.fillStyle = wash;
      context.fillRect(0, 0, width, height);
      context.globalCompositeOperation = 'source-over';
    }
    draw(base.context, false);
    draw(lit.context, true);
  }

  function paint() {
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(base.surface, 0, 0, width, height);
    const r = reveal.context;
    r.clearRect(0, 0, width, height);
    r.globalCompositeOperation = 'source-over';
    r.drawImage(lit.surface, 0, 0, width, height);
    r.globalCompositeOperation = 'destination-in';
    r.drawImage(heat.surface, 0, 0, width, height);
    ctx.drawImage(reveal.surface, 0, 0, width, height);
  }

  function addLight() {
    const h = heat.context;
    const radius = width < 600 ? 135 : 205;
    const glow = h.createRadialGradient(pointer.x, pointer.y, 8, pointer.x, pointer.y, radius);
    glow.addColorStop(0, 'rgba(255,255,255,1)');
    glow.addColorStop(.22, 'rgba(255,255,255,.9)');
    glow.addColorStop(.6, 'rgba(255,255,255,.32)');
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    h.globalCompositeOperation = 'source-over';
    h.fillStyle = glow;
    h.fillRect(pointer.x - radius, pointer.y - radius, radius * 2, radius * 2);
  }

  function tick(time) {
    frame = 0;
    const elapsed = Math.min((time - lastTime) || 16, 80);
    lastTime = time;
    const h = heat.context;
    h.globalCompositeOperation = 'destination-out';
    h.fillStyle = `rgba(0,0,0,${1 - Math.exp(-elapsed / 175)})`;
    h.fillRect(0, 0, width, height);
    if (pointer.inside) addLight();
    paint();

    // Stop rendering when the pointer settles; resume only for new input.
    if (time - lastMove < 1000 || (!pointer.inside && time < fadeUntil)) {
      frame = requestAnimationFrame(tick);
    } else if (!pointer.inside) {
      h.clearRect(0, 0, width, height);
      paint();
    }
  }

  function wake() {
    if (!frame && !document.hidden) {
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    }
  }

  function move(event) {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.inside = true;
    lastMove = performance.now();
    if (motion.matches) {
      heat.context.clearRect(0, 0, width, height);
      addLight();
      paint();
    } else {
      wake();
    }
  }

  function leave() {
    pointer.inside = false;
    fadeUntil = performance.now() + 1000;
    if (motion.matches) {
      heat.context.clearRect(0, 0, width, height);
      paint();
    } else {
      wake();
    }
  }

  function resize() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    width = window.innerWidth;
    height = window.innerHeight;
    scale = Math.min(window.devicePixelRatio || 1, 2);
    for (const { surface, context } of [{ surface: canvas, context: ctx }, ...layers]) {
      surface.width = Math.round(width * scale);
      surface.height = Math.round(height * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0);
    }
    makeBoard();
    if (pointer.inside) addLight();
    paint();
  }

  window.addEventListener('pointermove', move, { passive: true });
  window.addEventListener('pointerdown', move, { passive: true });
  window.addEventListener('pointerup', event => {
    if (event.pointerType !== 'mouse') leave();
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', leave);
  window.addEventListener('pointercancel', leave);
  window.addEventListener('blur', leave);
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 100);
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) return;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    pointer.inside = false;
    heat.context.clearRect(0, 0, width, height);
    paint();
  });
  motion.addEventListener('change', () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    heat.context.clearRect(0, 0, width, height);
    if (pointer.inside) addLight();
    paint();
  });
  resize();
})();

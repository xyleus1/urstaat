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

  // A stable board layout: short orthogonal routes, chamfered bends, and vias.
  // Occupied grid cells prevent routes from crossing or joining by accident.
  function makeBoard() {
    let seed = 231819;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const cell = width < 600 ? 25 : 29;
    const cols = Math.ceil(width / cell) + 1;
    const rows = Math.ceil(height / cell) + 1;
    const used = new Set();
    const routes = [];
    const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    const offsetX = (width - (cols - 1) * cell) / 2;
    const offsetY = (height - (rows - 1) * cell) / 2;
    const point = (x, y) => [x * cell + offsetX, y * cell + offsetY];
    const key = (x, y) => y * cols + x;

    function available(x, y) {
      if (x < 0 || x >= cols || y < 0 || y >= rows || used.has(key(x, y))) return false;
      const [px, py] = point(x, y);
      // Leave breathing room around the announcement.
      return !(Math.abs(px - width / 2) < Math.min(width * .42, 320) && Math.abs(py - height / 2) < 116);
    }

    for (let attempt = 0; attempt < cols * rows * 2; attempt++) {
      let x = Math.floor(random() * cols);
      let y = Math.floor(random() * rows);
      if (!available(x, y)) continue;
      let direction = Math.floor(random() * 4);
      const route = [point(x, y)];
      const cells = [key(x, y)];
      used.add(key(x, y));
      const length = 4 + Math.floor(random() * 21);
      let run = 0;

      for (let step = 0; step < length; step++) {
        const turn = random() < .5 ? 1 : 3;
        const choices = run > 1 && random() < .28
          ? [(direction + turn) % 4, direction, (direction + 4 - turn) % 4]
          : [direction, (direction + turn) % 4, (direction + 4 - turn) % 4];
        const next = choices.find(d => available(x + directions[d][0], y + directions[d][1]));
        if (next === undefined) break;
        run = next === direction ? run + 1 : 0;
        direction = next;
        x += directions[direction][0];
        y += directions[direction][1];
        used.add(key(x, y));
        cells.push(key(x, y));
        route.push(point(x, y));
      }

      if (route.length < 4) {
        cells.forEach(id => used.delete(id));
        continue;
      }
      routes.push(route);
      if (used.size > cols * rows * .66) break;
    }

    const paths = new Path2D();
    const vias = new Path2D();
    const cores = new Path2D();
    const trim = 7;
    for (const route of routes) {
      paths.moveTo(...route[0]);
      for (let i = 1; i < route.length - 1; i++) {
        const previous = route[i - 1];
        const current = route[i];
        const next = route[i + 1];
        const from = [Math.sign(current[0] - previous[0]), Math.sign(current[1] - previous[1])];
        const to = [Math.sign(next[0] - current[0]), Math.sign(next[1] - current[1])];
        if (from[0] !== to[0] || from[1] !== to[1]) {
          paths.lineTo(current[0] - from[0] * trim, current[1] - from[1] * trim);
          paths.lineTo(current[0] + to[0] * trim, current[1] + to[1] * trim);
        } else {
          paths.lineTo(...current);
        }
      }
      paths.lineTo(...route[route.length - 1]);
      for (const [x, y] of [route[0], route[route.length - 1]]) {
        vias.moveTo(x + 3, y);
        vias.arc(x, y, 3, 0, Math.PI * 2);
        cores.moveTo(x + 1, y);
        cores.arc(x, y, 1, 0, Math.PI * 2);
      }
    }

    const draw = (context, bright) => {
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.lineWidth = bright ? 1.1 : .8;
      context.strokeStyle = bright ? '#8ed5a6' : '#101c15';
      if (bright) {
        context.shadowColor = '#4eee8c';
        context.shadowBlur = 10;
      }
      context.stroke(paths);
      context.stroke(vias);
      context.shadowBlur = 0;
      context.fillStyle = bright ? '#c1f4d2' : '#16271b';
      context.fill(cores);
    };
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
    if (time - lastMove < 140 || (!pointer.inside && time < fadeUntil)) {
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

import { geoDistance, geoEqualEarth, geoGraticule, geoInterpolate, geoOrthographic, geoPath } from 'd3-geo';
import land from './taku-land.json';

// Natural Earth 1:110m physical land, v5.1.2, rounded to hundredths of a degree.
// https://github.com/nvkelso/natural-earth-vector/blob/v5.1.2/geojson/ne_110m_land.geojson
const grid = geoGraticule().step([20, 20])();
const sphere = { type: 'Sphere' };
const colors = {
  raw: '#b4c8af',
  refining: '#8bc4bf',
  material: '#86b4d0',
  component: '#c4a8cc',
  assembly: '#f68a69',
};
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const coord = (n) => [n.lon, n.lat];
const documented = (e) => e.scope === 'verified-relationship';
const distanceToSegment = (x, y, a, b) => {
  const dx = b[0] - a[0],
    dy = b[1] - a[1],
    d = dx * dx + dy * dy;
  const t = d ? clamp(((x - a[0]) * dx + (y - a[1]) * dy) / d, 0, 1) : 0;
  return Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy);
};

function openingCenter(nodes, edges) {
  // Choose an initial hemisphere that shows a connected set of processing sites.
  let best = [10, 33],
    score = -Infinity;
  const locations = new Map(nodes.map((n) => [n.id, coord(n)]));
  for (const lat of [12, 32, 47])
    for (let lon = -165; lon < 180; lon += 15) {
      const visibility = (p) => Math.max(0, Math.cos(geoDistance([lon, lat], p)));
      const value =
        nodes.reduce((n, p) => n + visibility(coord(p)), 0) +
        edges.reduce(
          (n, e) =>
            n +
            (documented(e) ? 2 : 1) *
              Math.min(visibility(locations.get(e.from)), visibility(locations.get(e.to))),
          0,
        );
      if (value > score) {
        best = [lon, lat];
        score = value;
      }
    }
  return best;
}

export function createGlobe(canvas, onPick) {
  // Keep the atlas on the 2D software surface so the main model retains GPU resources.
  const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
  if (!ctx) throw new Error('Canvas drawing unavailable');
  function stipple(size, color, points) {
    const tile = document.createElement('canvas');
    tile.width = tile.height = size;
    const brush = tile.getContext('2d');
    brush.fillStyle = color;
    for (const [x, y] of points) brush.fillRect(x, y, 1, 1);
    return ctx.createPattern(tile, 'repeat');
  }
  const field = stipple(16, '#2c3537', [[12, 12]]);
  const grain = stipple(10, 'rgba(210,233,215,.22)', [
    [1, 1],
    [6, 1],
    [2, 6],
    [7, 6],
  ]);
  const ortho = geoOrthographic().clipAngle(90).precision(0.45);
  const flat = geoEqualEarth().precision(0.45);
  let width = 0,
    height = 0,
    ratio = 1,
    frame = 0,
    drag,
    zoom = 1,
    flatMode = false;
  let model,
    center = [10, 30],
    origin = center,
    selected,
    pins = [],
    strokes = [],
    moved = false,
    tween,
    pinch;
  const contacts = new Map();
  function magnify(value) {
    zoom = clamp(value, 0.8, 8);
    paint();
  }
  function span() {
    const [a, b] = contacts.values();
    return Math.hypot(a[0] - b[0], a[1] - b[1]);
  }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const project = () => (flatMode ? flat : ortho);
  const visible = (p) => flatMode || geoDistance(p, center) < Math.PI / 2 - 0.002;
  const paint = () => {
    if (!frame) frame = requestAnimationFrame(draw);
  };
  const events = new AbortController();
  const listen = (type, handler) => canvas.addEventListener(type, handler, { signal: events.signal });

  function prepare(nodes, edges) {
    const places = new Map(nodes.map((n) => [n.id, n]));
    const groups = new Map();
    for (const node of nodes) {
      const key = Math.round(node.lat * 3) + ',' + Math.round(node.lon * 3);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(node.id);
    }
    const offsets = new Map();
    for (const ids of groups.values())
      ids.forEach((id, i) => {
        const a = (2 * Math.PI * i) / ids.length - Math.PI / 2,
          radius = ids.length < 2 ? 0 : Math.min(18, 4 + 1.7 * ids.length);
        offsets.set(id, [Math.cos(a) * radius, Math.sin(a) * radius]);
      });
    const paths = edges.map((edge) => {
      const a = coord(places.get(edge.from)),
        b = coord(places.get(edge.to));
      const interpolate = geoInterpolate(a, b),
        angle = geoDistance(a, b);
      const count = clamp(Math.ceil(angle * 34), 12, 100);
      const samples = Array.from({ length: count + 1 }, (_, i) => interpolate(i / count));
      return { edge, samples, angle };
    });
    return { nodes, edges, places, offsets, paths };
  }

  function draw(now) {
    frame = 0;
    if (!width || !height || !model) return;
    if (tween) {
      const t = clamp((now - tween.start) / 420, 0, 1),
        p = t * t * (3 - 2 * t);
      center = tween.interpolate(p);
      if (t < 1) paint();
      else tween = null;
    }
    const cx = width / 2,
      cy = height / 2,
      radius = Math.min(width * 0.441, height * 0.445) * zoom;
    if (flatMode)
      flat.rotate([0, 0]).fitExtent(
        [
          [14, 28],
          [width - 14, height - 28],
        ],
        sphere,
      );
    else ortho.translate([cx, cy]).scale(radius).rotate([-center[0], -center[1]]);
    const projection = project(),
      path = geoPath(projection, ctx);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.fillStyle = '#0c1113';
    ctx.fillRect(0, 0, width, height);
    ctx.setLineDash([]);
    // A fine registration field continues behind the globe at the scale of the printed study.
    ctx.fillStyle = field;
    ctx.fillRect(0, 0, width, height);
    ctx.beginPath();
    path(sphere);
    const ocean = ctx.createRadialGradient(
      cx - radius * 0.31,
      cy - radius * 0.42,
      radius * 0.04,
      cx,
      cy,
      radius * 1.14,
    );
    ocean.addColorStop(0, '#26383b');
    ocean.addColorStop(0.73, '#172529');
    ocean.addColorStop(1, '#10181a');
    ctx.fillStyle = flatMode ? '#1c2a2e' : ocean;
    ctx.fill();
    ctx.strokeStyle = '#546467';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.beginPath();
    path(land);
    ctx.fillStyle = '#455759';
    ctx.fill();
    ctx.strokeStyle = '#81908d';
    ctx.lineWidth = 0.65;
    ctx.stroke();
    ctx.fillStyle = grain;
    ctx.fill();
    ctx.beginPath();
    path(grid);
    ctx.strokeStyle = 'rgba(181,207,206,.20)';
    ctx.lineWidth = 0.62;
    ctx.stroke();
    if (!flatMode) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(127,150,151,.19)';
      ctx.lineWidth = 0.65;
      ctx.stroke();
    }
    const projected = new Map();
    pins = [];
    for (const node of model.nodes) {
      const p = coord(node),
        position = projection(p),
        [ox, oy] = model.offsets.get(node.id);
      const pin = { node, x: position[0] + ox, y: position[1] + oy, point: position, visible: visible(p) };
      projected.set(node.id, pin);
      if (pin.visible) pins.push(pin);
    }
    const near = new Set();
    const active = (e) =>
      selected?.kind === 'edge'
        ? selected.id === e.id
        : selected?.kind === 'node' && (selected.id === e.from || selected.id === e.to);
    const ordered = [...model.paths].sort((a, b) => Number(active(a.edge)) - Number(active(b.edge)));
    strokes = [];
    for (const { edge, samples, angle } of ordered) {
      const a = projected.get(edge.from),
        b = projected.get(edge.to);
      const emphasized = active(edge);
      if (emphasized) {
        near.add(edge.from);
        near.add(edge.to);
      }
      const runs = [];
      let run = [];
      for (let i = 0; i < samples.length; i++) {
        const p = samples[i],
          t = i / (samples.length - 1);
        const q = projection(p),
          lift = flatMode ? 0 : 0.115 * Math.min(1, angle) * Math.sin(Math.PI * t);
        // Raised paths remain visible just past the horizon until the earth occludes them.
        if (!visible(p) && Math.hypot(q[0] - cx, q[1] - cy) * (1 + lift) < radius + 0.35) {
          if (run.length) runs.push(run);
          run = [];
          continue;
        }
        const x = q[0] + (q[0] - cx) * lift + (a.x - a.point[0]) * (1 - t) + (b.x - b.point[0]) * t;
        const y = q[1] + (q[1] - cy) * lift + (a.y - a.point[1]) * (1 - t) + (b.y - b.point[1]) * t;
        if (flatMode && run.length && Math.abs(x - run.at(-1)[0]) > width * 0.49) {
          runs.push(run);
          run = [];
        }
        run.push([x, y]);
      }
      if (run.length) runs.push(run);
      ctx.strokeStyle = emphasized ? '#ff9676' : documented(edge) ? '#e0e9da' : '#adc5c4';
      ctx.globalAlpha = emphasized ? 1 : selected?.kind === 'edge' ? 0.5 : 0.91;
      ctx.lineWidth = emphasized ? 2.2 : documented(edge) ? 1.55 : 1.15;
      ctx.setLineDash(documented(edge) ? [] : [3, 3.5]);
      for (const points of runs) {
        if (points.length < 2) continue;
        ctx.beginPath();
        ctx.moveTo(...points[0]);
        for (const pt of points.slice(1)) ctx.lineTo(...pt);
        ctx.stroke();
        strokes.push({ id: edge.id, points });
        if (emphasized && points.length > 9) {
          const k = Math.floor(points.length * 0.56),
            [x, y] = points[k],
            last = points[k - 2];
          const dir = Math.atan2(y - last[1], x - last[0]);
          if (Math.hypot(points.at(-1)[0] - points[0][0], points.at(-1)[1] - points[0][1]) > 34) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(dir);
            ctx.fillStyle = '#ff9676';
            ctx.beginPath();
            ctx.moveTo(4, 0);
            ctx.lineTo(-3, -2.3);
            ctx.lineTo(-3, 2.3);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }
        }
      }
    }
    ctx.globalAlpha = 1;
    ctx.setLineDash([]);
    const sorted = [...pins].sort(
      (a, b) => Number(a.node.id === selected?.id) - Number(b.node.id === selected?.id),
    );
    for (const { node, x, y, point } of sorted) {
      const hot = node.id === selected?.id,
        r = hot ? 4.8 : near.has(node.id) ? 3.6 : 2.8;
      if (Math.hypot(x - point[0], y - point[1]) > 3) {
        ctx.beginPath();
        ctx.moveTo(...point);
        ctx.lineTo(x, y);
        ctx.strokeStyle = '#9caaa6';
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = hot ? '#ff9676' : colors[node.stage] || '#d9e2dc';
      ctx.fill();
      ctx.strokeStyle = '#0b1416';
      ctx.lineWidth = 1.25;
      ctx.stroke();
      if (hot) {
        ctx.beginPath();
        ctx.arc(x, y, 8.3, 0, Math.PI * 2);
        ctx.lineWidth = 1.1;
        ctx.strokeStyle = '#ff9676';
        ctx.stroke();
      }
    }
    const placed = [];
    ctx.font = '11px Geist, Arial, sans-serif';
    const nick = (n) => n.site || n.place;
    const labels = [...sorted]
      .reverse()
      .sort(
        (a, b) =>
          Number(b.node.id === selected?.id) * 10 +
          Number(near.has(b.node.id)) -
          Number(a.node.id === selected?.id) * 10 -
          Number(near.has(a.node.id)),
      );
    for (const pin of labels) {
      if (placed.length >= (width < 430 ? 3 : 6)) break;
      const label = nick(pin.node),
        tw = ctx.measureText(label).width,
        h = 19;
      if (tw > width * 0.64) continue;
      const right = pin.x + 12 + tw < width - 8,
        x = right ? pin.x + 11 : pin.x - tw - 13,
        y = pin.y - 9;
      const rect = [x - 3, y, tw + 6, h];
      if (
        x < 3 ||
        y < 5 ||
        y + h > height - 5 ||
        placed.some(
          (r) =>
            r[0] < rect[0] + rect[2] + 14 &&
            r[0] + r[2] + 14 > rect[0] &&
            r[1] < rect[1] + h + 8 &&
            r[1] + r[3] + 8 > rect[1],
        )
      )
        continue;
      placed.push(rect);
      ctx.fillStyle = 'rgba(9,17,20,.88)';
      ctx.fillRect(...rect);
      ctx.fillStyle = pin.node.id === selected?.id ? '#ffb099' : '#e1e5df';
      ctx.fillText(label, x, y + 13);
    }
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    width = rect.width;
    height = rect.height;
    ratio = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.round(width * ratio),
      h = Math.round(height * ratio);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    paint();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);

  function aim(point) {
    if (flatMode || !point) return;
    if (reduced.matches || geoDistance(center, point) < 0.03) {
      center = point;
      tween = null;
    } else tween = { start: performance.now(), interpolate: geoInterpolate(center, point) };
    paint();
  }
  function hit(x, y) {
    let best,
      dist = 12;
    for (const p of pins) {
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < dist) {
        best = p;
        dist = d;
      }
    }
    if (best) return { kind: 'node', id: best.node.id };
    let edge;
    dist = 5;
    for (const s of strokes)
      for (let i = 1; i < s.points.length; i++) {
        const d = distanceToSegment(x, y, s.points[i - 1], s.points[i]);
        if (d < dist) {
          edge = s.id;
          dist = d;
        }
      }
    return edge ? { kind: 'edge', id: edge } : null;
  }
  listen('pointerdown', (e) => {
    if (e.button !== 0) return;
    contacts.set(e.pointerId, [e.clientX, e.clientY]);
    if (contacts.size === 2 && !flatMode) {
      pinch = { span: Math.max(8, span()), zoom };
      drag = null;
      moved = true;
      canvas.setPointerCapture(e.pointerId);
      return;
    }
    if (contacts.size > 1 || drag) return;
    tween = null;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, center: [...center] };
    moved = false;
    canvas.setPointerCapture(e.pointerId);
  });
  listen('pointermove', (e) => {
    if (contacts.has(e.pointerId)) contacts.set(e.pointerId, [e.clientX, e.clientY]);
    if (pinch && contacts.size >= 2) {
      magnify((pinch.zoom * span()) / pinch.span);
      return;
    }
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x,
      dy = e.clientY - drag.y;
    if (Math.hypot(dx, dy) > 4) moved = true;
    if (moved && !flatMode) {
      const scale = 90 / (Math.max(100, Math.min(width, height) * 0.44) * zoom);
      center = [drag.center[0] - dx * scale, clamp(drag.center[1] + dy * scale, -85, 85)];
      paint();
    }
  });
  listen('pointerup', (e) => {
    contacts.delete(e.pointerId);
    if (pinch) {
      pinch = null;
      drag = null;
      return;
    }
    if (!drag || e.pointerId !== drag.id) return;
    drag = null;
    if (!moved) {
      const b = canvas.getBoundingClientRect(),
        found = hit(e.clientX - b.left, e.clientY - b.top);
      if (found) onPick(found);
    }
  });
  const release = (e) => {
    contacts.delete(e.pointerId);
    if (drag?.id === e.pointerId) drag = null;
    if (contacts.size < 2) pinch = null;
  };
  listen('lostpointercapture', release);
  listen('pointercancel', release);
  listen('keydown', (e) => {
    if (flatMode) return;
    const keys = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, 10], ArrowDown: [0, -10] };
    if (keys[e.key]) {
      e.preventDefault();
      tween = null;
      center = [center[0] + keys[e.key][0], clamp(center[1] + keys[e.key][1], -85, 85)];
      paint();
    } else if (e.key === 'Home') {
      e.preventDefault();
      zoom = 1;
      aim(origin);
    } else if (['+', '=', '-'].includes(e.key)) {
      e.preventDefault();
      magnify(zoom * (e.key === '-' ? 1 / 1.3 : 1.3));
    }
  });
  return {
    setData(nodes, edges) {
      model = prepare(nodes, edges);
      origin = openingCenter(nodes, edges);
      center = [...origin];
      zoom = 1;
      tween = null;
      selected = null;
      resize();
      paint();
    },
    select(item, focus) {
      selected = item;
      if (focus && model && item) {
        let p;
        if (item.kind === 'node') p = coord(model.places.get(item.id));
        else {
          const path = model.paths.find((p) => p.edge.id === item.id);
          p = path?.samples[Math.floor(path.samples.length / 2)];
        }
        if (focus === 'opening') {
          // Preserve the geographic overview, bringing a hidden opening site just inside the limb.
          const distance = geoDistance(center, p);
          if (distance > 1.18) {
            center = geoInterpolate(center, p)(1 - 1.18 / distance);
            origin = [...center];
          }
        } else aim(p);
      }
      paint();
    },
    setFlat(value) {
      flatMode = value;
      tween = null;
      paint();
    },
    zoom(factor) {
      magnify(zoom * factor);
    },
    reset() {
      zoom = 1;
      aim(origin);
      paint();
    },
    destroy() {
      events.abort();
      observer.disconnect();
      cancelAnimationFrame(frame);
    },
  };
}

// Canvas 2D path for browsers without a WebGL context. Both renderers use the
// same indexed triangles, normals, articulated groups, camera and depth picking.
const normalize = (a, b, c) => {
  const k = 1 / Math.hypot(a, b, c);
  return [a * k, b * k, c * k];
};
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const keyLight = normalize(-0.62, -0.5, 0.76),
  stripLight = normalize(0.88, 0.44, 0.45),
  rimLight = normalize(-0.85, 0.3, -0.2);
function makeModel(packed, finishes) {
  const { indices, draws, vertices } = packed,
    n = vertices.byteLength / 8,
    data = new DataView(vertices.buffer, vertices.byteOffset, vertices.byteLength);
  const xyz = new Float32Array(n * 3),
    groups = new Uint8Array(n),
    materials = new Uint8Array(n),
    shades = new Uint32Array(n);
  const indexedColors = [],
    keys = new Map();
  for (const [group, mat, start, count] of draws)
    for (let i = start; i < start + count; i++) {
      groups[indices[i]] = group;
      materials[indices[i]] = mat;
    }
  for (let i = 0; i < n; i++) {
    const p = i * 8;
    for (let a = 0; a < 3; a++) xyz[i * 3 + a] = data.getInt16(p + a * 2, true) / 160;
    const ox = data.getInt8(p + 6),
      oy = data.getInt8(p + 7),
      mat = materials[i],
      key = (mat << 16) | ((ox + 128) << 8) | (oy + 128);
    if (!keys.has(key)) {
      let x = ox / 127,
        y = oy / 127,
        z = 1 - Math.abs(x) - Math.abs(y);
      if (z < 0) {
        const a = x;
        x = (1 - Math.abs(y)) * (Math.sign(x) || 1);
        y = (1 - Math.abs(a)) * (Math.sign(y) || 1);
      }
      keys.set(key, indexedColors.length);
      indexedColors.push({ normal: normalize(x, y, z), finish: finishes[mat] });
    }
    shades[i] = keys.get(key);
  }
  const screen = new Float32Array(n * 3),
    colors = new Uint32Array(indexedColors.length);
  let w = 0,
    h = 0,
    depth,
    ids;
  function render(frame, buffer) {
    const { right, up, eye, offsets, centerX, centerY, units, width, height, selected } = frame;
    if (width !== w || height !== h) {
      w = width;
      h = height;
      depth = new Float32Array(w * h);
      ids = new Uint8Array(w * h);
    }
    depth.fill(-Infinity);
    ids.fill(0);
    const rgba =
      buffer?.byteLength === w * h * 4 ? new Uint8ClampedArray(buffer) : new Uint8ClampedArray(w * h * 4);
    const pixels = new Uint32Array(rgba.buffer);
    pixels.fill(0);
    const half = (L) => normalize(eye[0] + L[0], eye[1] + L[1], eye[2] + L[2]);
    const halfKey = half(keyLight),
      halfStrip = half(stripLight),
      halfRim = half(rimLight);
    for (let i = 0; i < indexedColors.length; i++) {
      const { normal, finish } = indexedColors[i],
        side = dot(normal, eye) < 0 ? -1 : 1;
      const diffuse = Math.max(0, side * dot(normal, keyLight)),
        fill = Math.max(0, side * dot(normal, stripLight)),
        nz = normal[2] * side;
      const metal = finish[3],
        rough = finish[4];
      const reflection =
        0.075 +
        0.095 * (0.5 + nz * 0.5) +
        2.0 * Math.pow(Math.max(0, side * dot(normal, halfKey)), 10 + 25 * (1 - rough)) +
        1.6 * Math.pow(Math.max(0, side * dot(normal, halfStrip)), 15 + 40 * (1 - rough)) +
        0.6 * Math.pow(Math.max(0, side * dot(normal, halfRim)), 12);
      const light = (0.07 + 0.17 * (0.5 + nz * 0.5) + 0.86 * diffuse + 0.18 * fill) * (1 - 0.77 * metal),
        rim = 0.045 * (1 - Math.abs(dot(normal, eye))) ** 3;
      let packedColor = 0;
      for (let k = 0; k < 3; k++) {
        const reflectance = 0.055 * (1 - metal) + finish[k] * metal,
          linear = finish[k] * light + reflectance * reflection + rim;
        const channel = Math.min(255, Math.round(255 * Math.pow((1.24 * linear) / (linear + 0.72), 1 / 2.2)));
        packedColor |= channel << (8 * k);
      }
      colors[i] = packedColor;
    }
    const scale = h / (2 * units);
    for (let i = 0; i < n; i++) {
      const p = i * 3,
        x = xyz[p],
        y = xyz[p + 1],
        z = xyz[p + 2] + offsets[groups[i]];
      screen[p] = w * 0.5 + (x * right[0] + y * right[1] + z * right[2] - centerX) * scale;
      screen[p + 1] = h * 0.5 - (x * up[0] + y * up[1] + z * up[2] - centerY) * scale;
      screen[p + 2] = x * eye[0] + y * eye[1] + z * eye[2];
    }
    for (const [group, , start, count] of draws) {
      const intensity = selected < 0 || selected === group ? 1 : 0.58;
      for (let k = start; k < start + count; k += 3) {
        const i = indices[k],
          j = indices[k + 1],
          l = indices[k + 2],
          a = i * 3,
          b = j * 3,
          c = l * 3;
        const ax = screen[a],
          ay = screen[a + 1],
          az = screen[a + 2],
          bx = screen[b],
          by = screen[b + 1],
          cx = screen[c],
          cy = screen[c + 1];
        const ux = bx - ax,
          uy = by - ay,
          vx = cx - ax,
          vy = cy - ay,
          det = ux * vy - uy * vx;
        if (Math.abs(det) < 1e-7) continue;
        const left = Math.max(0, Math.ceil(Math.min(ax, bx, cx) - 0.5)),
          rightEdge = Math.min(w - 1, Math.floor(Math.max(ax, bx, cx) - 0.5));
        const top = Math.max(0, Math.ceil(Math.min(ay, by, cy) - 0.5)),
          bottom = Math.min(h - 1, Math.floor(Math.max(ay, by, cy) - 0.5));
        if (left > rightEdge || top > bottom) continue;
        const du = vy / det,
          dv = -uy / det,
          z1 = screen[b + 2] - az,
          z2 = screen[c + 2] - az;
        const ca = colors[shades[i]],
          cb = colors[shades[j]],
          cc = colors[shades[l]];
        const ar = ca & 255,
          ag = (ca >> 8) & 255,
          ab = (ca >> 16) & 255,
          br = (cb & 255) - ar,
          bg = ((cb >> 8) & 255) - ag,
          bb = ((cb >> 16) & 255) - ab;
        const cr = (cc & 255) - ar,
          cg = ((cc >> 8) & 255) - ag,
          cb2 = ((cc >> 16) & 255) - ab;
        for (let y = top; y <= bottom; y++) {
          const dy = y + 0.5 - ay;
          let u = ((left + 0.5 - ax) * vy - dy * vx) / det,
            v = (dy * ux - (left + 0.5 - ax) * uy) / det;
          for (let x = left, p = y * w + left; x <= rightEdge; x++, p++, u += du, v += dv) {
            if (u < -0.000001 || v < -0.000001 || u + v > 1.000001) continue;
            const z = az + u * z1 + v * z2;
            if (z < depth[p]) continue;
            depth[p] = z;
            ids[p] = group + 1;
            pixels[p] =
              0xff000000 |
              (((ab + u * bb + v * cb2) * intensity) << 16) |
              (((ag + u * bg + v * cg) * intensity) << 8) |
              ((ar + u * br + v * cr) * intensity);
          }
        }
      }
    }
    return rgba;
  }
  return {
    render,
    pick(x, y) {
      return (
        ids?.[
          Math.min(h - 1, Math.max(0, Math.floor(y * h))) * w +
            Math.min(w - 1, Math.max(0, Math.floor(x * w)))
        ] - 1
      );
    },
  };
}

if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
  let model;
  self.onmessage = ({ data }) => {
    if (data.type === 'load') {
      model = makeModel(data.packed, data.finishes);
      return;
    }
    if (data.type === 'pick') {
      self.postMessage({ type: 'pick', index: model.pick(data.x, data.y) });
      return;
    }
    const rgba = model.render(data.frame, data.buffer);
    self.postMessage({ type: 'frame', width: data.frame.width, height: data.frame.height, rgba }, [
      rgba.buffer,
    ]);
  };
}

export function createCutawayRaster(canvas, packed, finishes, onPick, onError) {
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) throw Error('Canvas 2D unavailable');
  let worker,
    model,
    busy = false,
    pending = null,
    reuse = null,
    dead = false,
    firstFrame = false,
    last;
  let complete;
  const ready = new Promise((resolve) => {
    complete = resolve;
  });
  function present(rgba, width, height) {
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    context.putImageData(new ImageData(rgba, width, height), 0, 0);
    if (!firstFrame) {
      firstFrame = true;
      complete(true);
    }
  }
  function render(frame) {
    last = frame;
    if (dead) return;
    if (!worker) {
      const rgba = model.render(frame, reuse);
      present(rgba, frame.width, frame.height);
      reuse = rgba.buffer;
      return;
    }
    if (busy) {
      pending = frame;
      return;
    }
    busy = true;
    const buffer = reuse;
    reuse = null;
    worker.postMessage({ type: 'draw', frame, buffer }, buffer ? [buffer] : []);
  }
  function direct() {
    worker?.terminate();
    worker = null;
    busy = false;
    pending = null;
    try {
      model = makeModel(packed, finishes);
      if (last) render(last);
    } catch (error) {
      complete(false);
      onError(error);
    }
  }
  try {
    worker = new Worker(new URL('./taku-cutaway-raster.js', import.meta.url), { type: 'module' });
    worker.onmessage = ({ data }) => {
      if (dead) return;
      if (data.type === 'pick') {
        onPick(data.index);
        return;
      }
      present(data.rgba, data.width, data.height);
      reuse = data.rgba.buffer;
      busy = false;
      if (pending) {
        const frame = pending;
        pending = null;
        render(frame);
      }
    };
    worker.onerror = direct;
    worker.postMessage({
      type: 'load',
      packed: { vertices: packed.vertices, indices: packed.indices, draws: packed.draws },
      finishes,
    });
  } catch {
    direct();
  }
  return {
    ready,
    render,
    pick(x, y) {
      if (worker) worker.postMessage({ type: 'pick', x, y });
      else onPick(model.pick(x, y));
    },
    destroy() {
      dead = true;
      complete(false);
      worker?.terminate();
    },
  };
}

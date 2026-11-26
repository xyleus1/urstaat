// A depth-buffered Canvas renderer. The worker consumes only the latest camera
// pose; the UI thread remains free to receive drag, scroll and inspection input.
const near = 0.009;
const rgba = (r, g, b) => (255 << 24) | (b << 16) | (g << 8) | r;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
function unpack(bytes, kernel) {
  const data = new DataView(bytes),
    length = data.getUint32(4, true);
  if (data.getUint32(0) !== 0x544b4331) throw Error('Invalid Taku geometry');
  const meta = JSON.parse(new TextDecoder().decode(new Uint8Array(bytes, 8, length)));
  let at = 8 + length;
  for (const part of meta.parts) {
    const vertices = new Float32Array(part.vertices * 8);
    for (let i = 0; i < part.vertices; i++, at += 11) {
      for (let k = 0; k < 3; k++) {
        vertices[i * 8 + k] = part.min[k] + (part.size[k] * data.getUint16(at + k * 2, true)) / 65535;
        vertices[i * 8 + 3 + k] = data.getInt8(at + 6 + k) / 127;
      }
      vertices[i * 8 + 6] = data.getUint8(at + 9);
      vertices[i * 8 + 7] = data.getUint8(at + 10);
    }
    const indices = new Uint16Array(part.indices);
    for (let i = 0; i < indices.length; i++, at += 2) indices[i] = data.getUint16(at, true);
    part.geom = vertices;
    part.tri = indices;
    if (!kernel) part.projected = new Float32Array(vertices.length);
    part.center = part.min.map((v, k) => v + part.size[k] / 2);
    part.radius = Math.hypot(...part.size) / 2;
  }
  if (at !== bytes.byteLength) throw Error('Truncated Taku geometry');
  return meta;
}

function basis(pose) {
  const [yaw, pitch, radius] = pose.orbit;
  const a = Math.sin(yaw),
    b = Math.cos(yaw),
    c = Math.cos(pitch),
    s = Math.sin(pitch);
  const right = [b, 0, -a],
    up = [-a * s, c, -b * s],
    eye = [a * c, s, b * c];
  return { right, up, eye, pos: eye.map((v, k) => pose.target[k] + radius * v) };
}
const dot = (x, y, z, a) => x * a[0] + y * a[1] + z * a[2];

export function createRaster({ model, lights, ink, inkSize }, kernel) {
  const meta = unpack(model, kernel);
  const palette = new Uint32Array(13 * 6400);
  let paletteKey = '',
    width = 0,
    height = 0,
    pixels,
    depths,
    surface;
  const wasm = kernel?.exports,
    memory = wasm?.memory;
  let cursor = Number(wasm?.__heap_base || 0),
    palettePtr,
    cameraPtr,
    scratchPtr,
    inkPtr,
    viewportPtr,
    centerPtr,
    nearestPtr;
  function reserve(bytes) {
    const offset = cursor;
    cursor = (cursor + bytes + 15) & ~15;
    if (cursor > memory.buffer.byteLength)
      memory.grow(Math.ceil((cursor - memory.buffer.byteLength) / 65536));
    return offset;
  }
  function copy(array) {
    const offset = reserve(array.byteLength);
    new Uint8Array(memory.buffer, offset, array.byteLength).set(
      new Uint8Array(array.buffer, array.byteOffset, array.byteLength),
    );
    return offset;
  }
  if (wasm) {
    palettePtr = reserve(palette.byteLength);
    cameraPtr = reserve(13 * 4);
    inkPtr = copy(ink);
    scratchPtr = reserve(Math.max(...meta.parts.map((p) => p.geom.byteLength)));
    for (const part of meta.parts) {
      part.vertexPtr = copy(part.geom);
      part.indexPtr = copy(part.tri);
      part.geom = null;
      part.tri = null;
    }
    centerPtr = reserve(64 * 4);
    nearestPtr = reserve(32 * 4);
    viewportPtr = cursor;
  }
  let outputPtr, depthPtr, idPtr;
  const scratch = Array.from({ length: 5 }, () => new Float32Array(8));
  function setPalette(yaw, pitch) {
    const az = ((((yaw / (2 * Math.PI)) * 8) % 8) + 8) % 8,
      el = clamp(1 + pitch / ((55 * Math.PI) / 180), 0, 2);
    const y0 = Math.floor(az),
      p0 = Math.floor(el),
      p1 = Math.min(2, p0 + 1),
      y1 = (y0 + 1) % 8;
    const wy = Math.round((az - y0) * 32) / 32,
      wp = Math.round((el - p0) * 32) / 32;
    const key = [p0, y0, wy, wp].join('/');
    if (key === paletteKey) return;
    paletteKey = key;
    const weights = [(1 - wy) * (1 - wp), wy * (1 - wp), (1 - wy) * wp, wy * wp];
    for (let f = 0; f < 13; f++) {
      const tiles = [p0 * 8 + y0, p0 * 8 + y1, p1 * 8 + y0, p1 * 8 + y1].map((i) => i + f * 24);
      for (let y = 0; y < 80; y++) {
        const row = tiles.map((i) => 4 * ((Math.floor(i / 16) * 80 + y) * 1280 + (i % 16) * 80));
        const [a, b, c, d] = row,
          [w0, w1, w2, w3] = weights;
        for (let x = 0, i = 0; x < 80; x++, i += 4) {
          const r = lights[a + i] * w0 + lights[b + i] * w1 + lights[c + i] * w2 + lights[d + i] * w3;
          const g =
            lights[a + i + 1] * w0 + lights[b + i + 1] * w1 + lights[c + i + 1] * w2 + lights[d + i + 1] * w3;
          const bl =
            lights[a + i + 2] * w0 + lights[b + i + 2] * w1 + lights[c + i + 2] * w2 + lights[d + i + 2] * w3;
          palette[f * 6400 + y * 80 + x] = rgba(r, g, bl);
        }
      }
    }
    if (wasm) new Uint32Array(memory.buffer, palettePtr, palette.length).set(palette);
  }
  function paint(a, ai, b, bi, c, ci, tag, printed) {
    const ax = a[ai],
      ay = a[ai + 1],
      bx = b[bi],
      by = b[bi + 1],
      cx = c[ci],
      cy = c[ci + 1];
    const x0 = Math.max(0, Math.ceil(Math.min(ax, bx, cx) - 0.5)),
      x1 = Math.min(width - 1, Math.floor(Math.max(ax, bx, cx) - 0.5));
    const y0 = Math.max(0, Math.ceil(Math.min(ay, by, cy) - 0.5)),
      y1 = Math.min(height - 1, Math.floor(Math.max(ay, by, cy) - 0.5));
    if (x0 > x1 || y0 > y1) return;
    const dx1 = bx - ax,
      dx2 = cx - ax,
      dy1 = by - ay,
      dy2 = cy - ay,
      d = dx1 * dy2 - dy1 * dx2;
    if (Math.abs(d) < 0.00001) return;
    const ux = dy2 / d,
      vx = -dy1 / d,
      uy = -dx2 / d,
      vy = dx1 / d;
    const z = a[ai + 2],
      zu = b[bi + 2] - z,
      zv = c[ci + 2] - z;
    const r = a[ai + 3],
      ru = b[bi + 3] - r,
      rv = c[ci + 3] - r,
      g = a[ai + 4],
      gu = b[bi + 4] - g,
      gv = c[ci + 4] - g;
    const bl = a[ai + 5],
      bu = b[bi + 5] - bl,
      bv = c[ci + 5] - bl;
    const dx = x0 + 0.5 - ax;
    for (let y = y0; y <= y1; y++) {
      let u = dx * ux + (y + 0.5 - ay) * uy,
        v = dx * vx + (y + 0.5 - ay) * vy;
      // Intersect the scanline with each barycentric half-plane; small CAD
      // triangles often cover only a few pixels of their bounding rectangle.
      let left = 0,
        right = x1 - x0;
      if (ux > 0) left = Math.max(left, Math.ceil(-u / ux));
      else if (ux < 0) right = Math.min(right, Math.floor(-u / ux));
      else if (u < 0) continue;
      if (vx > 0) left = Math.max(left, Math.ceil(-v / vx));
      else if (vx < 0) right = Math.min(right, Math.floor(-v / vx));
      else if (v < 0) continue;
      const w = 1 - u - v,
        wx = -ux - vx;
      if (wx > 0) left = Math.max(left, Math.ceil(-w / wx));
      else if (wx < 0) right = Math.min(right, Math.floor(-w / wx));
      else if (w < 0) continue;
      u += left * ux;
      v += left * vx;
      for (let x = left, p = y * width + x0 + left; x <= right; x++, p++, u += ux, v += vx) {
        const depth = z + u * zu + v * zv;
        if (depth + (printed ? 0.00045 : 0) < depths[p]) continue;
        if (printed) {
          const tx = clamp(
            Math.round(
              ((a[ai + 6] + u * (b[bi + 6] - a[ai + 6]) + v * (c[ci + 6] - a[ai + 6])) * (inkSize - 1)) / 255,
            ),
            0,
            inkSize - 1,
          );
          const ty = clamp(
            Math.round(
              ((a[ai + 7] + u * (b[bi + 7] - a[ai + 7]) + v * (c[ci + 7] - a[ai + 7])) * (inkSize - 1)) / 255,
            ),
            0,
            inkSize - 1,
          );
          if (ink[ty * inkSize + tx] < 25) continue;
        }
        depths[p] = depth;
        surface[p] = tag;
        pixels[p] = rgba(r + u * ru + v * rv, g + u * gu + v * gv, bl + u * bu + v * bv);
      }
    }
  }
  // Central perspective takes a convex box's extrema to its projected corners
  // whenever all eight corners are in front of the near plane.
  const corners = Array.from({ length: 8 }, (_, i) =>
    meta.center.map((c, k) => c + (i & (1 << k) ? 1 : -1) * meta.size[k] * 0.5),
  );
  function contourRegion(camera, focal, wide) {
    let xmin = width,
      xmax = 0,
      ymin = height,
      ymax = 0;
    const full = [wide, wide, width - wide, height - wide];
    for (const corner of corners) {
      const dx = corner[0] - camera.pos[0],
        dy = corner[1] - camera.pos[1],
        dz = corner[2] - camera.pos[2];
      const z = -dot(dx, dy, dz, camera.eye);
      if (z <= near) return full;
      const x = width * 0.5 + (focal * dot(dx, dy, dz, camera.right)) / z;
      const y = height * 0.5 - (focal * dot(dx, dy, dz, camera.up)) / z;
      xmin = Math.min(xmin, x);
      ymin = Math.min(ymin, y);
      xmax = Math.max(xmax, x);
      ymax = Math.max(ymax, y);
    }
    return [
      Math.max(wide, Math.floor(xmin) - wide - 1),
      Math.max(wide, Math.floor(ymin) - wide - 1),
      Math.min(width - wide, Math.ceil(xmax) + wide + 1),
      Math.min(height - wide, Math.ceil(ymax) + wide + 1),
    ];
  }
  function render(pose) {
    if (width !== pose.width || height !== pose.height) {
      width = pose.width;
      height = pose.height;
      const count = width * height;
      if (wasm) {
        cursor = viewportPtr;
        outputPtr = reserve(count * 4);
        depthPtr = reserve(count * 4);
        idPtr = reserve(count * 2);
        pixels = new Uint32Array(memory.buffer, outputPtr, count);
        depths = new Float32Array(memory.buffer, depthPtr, count);
        surface = new Uint16Array(memory.buffer, idPtr, count);
      } else {
        pixels = new Uint32Array(count);
        depths = new Float32Array(count);
        surface = new Uint16Array(count);
      }
    }
    setPalette(pose.orbit[0], pose.orbit[1]);
    pixels.fill(0);
    depths.fill(0);
    surface.fill(0);
    const { right, up, eye, pos } = basis(pose),
      focal = height / (2 * Math.tan(Math.PI / 12)),
      hw = width / 2,
      hh = height / 2;
    if (wasm) {
      new Float32Array(memory.buffer, cameraPtr, 13).set([...pos, ...right, ...up, ...eye, focal]);
      wasm.frame(width, height, outputPtr, depthPtr, idPtr, inkPtr, inkSize, cameraPtr);
    }
    const screen = (x, y, z) => [hw + (focal * x) / z, hh - (focal * y) / z, 1 / z];
    const selected = pose.code,
      tagMask = 31;
    let submitted = 0;
    for (const part of meta.parts) {
      const x = part.center[0] - pos[0],
        y = part.center[1] - pos[1],
        z = part.center[2] - pos[2];
      const cz = -dot(x, y, z, eye),
        radius = part.radius;
      if (
        cz + radius < near ||
        Math.abs(dot(x, y, z, right)) - ((cz + radius) * hw) / focal > radius ||
        Math.abs(dot(x, y, z, up)) - ((cz + radius) * hh) / focal > radius
      )
        continue;
      const tag = part.code | (part.pick << 5);
      if (wasm) {
        wasm.mesh(
          part.vertexPtr,
          part.vertices,
          part.indexPtr,
          part.indices,
          scratchPtr,
          palettePtr + part.finish * 6400 * 4,
          tag,
          part.finish === 8,
        );
        submitted += part.indices / 3;
        continue;
      }
      const data = part.geom,
        s = part.projected,
        indices = part.tri;
      for (let i = 0; i < data.length; i += 8) {
        const x = data[i] - pos[0],
          y = data[i + 1] - pos[1],
          z = data[i + 2] - pos[2];
        const depth = -dot(x, y, z, eye),
          nx = data[i + 3],
          ny = data[i + 4],
          nz = data[i + 5];
        const inv = 1 / depth;
        s[i] = hw + focal * dot(x, y, z, right) * inv;
        s[i + 1] = hh - focal * dot(x, y, z, up) * inv;
        s[i + 2] = inv;
        const facing = dot(nx, ny, nz, eye),
          k = (facing < 0 ? -38 : 38) / (1 + Math.abs(facing));
        const tx = clamp(Math.round(39.5 + k * dot(nx, ny, nz, right)), 0, 79);
        const ty = clamp(Math.round(39.5 + k * dot(nx, ny, nz, up)), 0, 79);
        const color = palette[part.finish * 6400 + ty * 80 + tx];
        s[i + 3] = color & 255;
        s[i + 4] = (color >> 8) & 255;
        s[i + 5] = (color >> 16) & 255;
        s[i + 6] = data[i + 6];
        s[i + 7] = data[i + 7];
      }
      submitted += indices.length / 3;
      for (let j = 0; j < indices.length; j += 3) {
        const a = indices[j] * 8,
          b = indices[j + 1] * 8,
          c = indices[j + 2] * 8;
        const za = s[a + 2],
          zb = s[b + 2],
          zc = s[c + 2];
        if (za > 0 && za < 1 / near && zb > 0 && zb < 1 / near && zc > 0 && zc < 1 / near) {
          paint(s, a, s, b, s, c, tag, part.finish === 8);
          continue;
        }
        if ((za <= 0 || za >= 1 / near) && (zb <= 0 || zb >= 1 / near) && (zc <= 0 || zc >= 1 / near))
          continue;
        // Clip against the near plane when zooming into, or through, a linkage.
        const corners = [a, b, c];
        let n = 0;
        for (let k = 0; k < 3; k++) {
          const i = corners[(k + 2) % 3],
            h = corners[k],
            di = 1 / s[i + 2],
            dh = 1 / s[h + 2];
          if (di >= near !== dh >= near) {
            const v = scratch[n++],
              t = (near - di) / (dh - di);
            const xx = data[i] + (data[h] - data[i]) * t - pos[0],
              yy = data[i + 1] + (data[h + 1] - data[i + 1]) * t - pos[1],
              zz = data[i + 2] + (data[h + 2] - data[i + 2]) * t - pos[2];
            v.set(screen(dot(xx, yy, zz, right), dot(xx, yy, zz, up), near));
            for (let f = 3; f < 8; f++) v[f] = s[i + f] + t * (s[h + f] - s[i + f]);
          }
          if (dh >= near) scratch[n++].set(s.subarray(h, h + 8));
        }
        for (let k = 1; k + 1 < n; k++)
          paint(scratch[0], 0, scratch[k], 0, scratch[k + 1], 0, tag, part.finish === 8);
      }
    }
    const centers = wasm ? new Float32Array(memory.buffer, centerPtr, 64) : new Float32Array(64);
    const nearest = wasm ? new Int32Array(memory.buffer, nearestPtr, 32) : new Int32Array(32);
    for (const [code, center] of targetEntries) {
      const dx = center[0] - pos[0],
        dy = center[1] - pos[1],
        dz = center[2] - pos[2];
      const [px, py] = screen(dot(dx, dy, dz, right), dot(dx, dy, dz, up), -dot(dx, dy, dz, eye));
      centers[code * 2] = px;
      centers[code * 2 + 1] = py;
    }
    const step = Math.max(1, Math.round(width / pose.cssWidth));
    const [x0, y0, x1, y1] = contourRegion({ pos, right, up, eye }, focal, step * 2);
    if (wasm) wasm.outline(selected, step, centerPtr, nearestPtr, x0, y0, x1, y1);
    else {
      nearest.fill(-1);
      const best = new Float64Array(32).fill(Infinity);
      const wide = step * 2,
        dy = step * width;
      for (let y = y0; y < y1; y++) {
        for (let x = x0, i = y * width + x0; x < x1; x++, i++) {
          const code = surface[i] & tagMask,
            left = surface[i - step] & tagMask,
            right = surface[i + step] & tagMask,
            above = surface[i - dy] & tagMask,
            below = surface[i + dy] & tagMask;
          if (code) {
            const d = (x - centers[code * 2]) ** 2 + (y - centers[code * 2 + 1]) ** 2;
            if (d < best[code]) {
              best[code] = d;
              nearest[code] = i;
            }
            if (left !== code || right !== code || above !== code || below !== code) {
              const light = pixels[i] & 255;
              if (code === selected) pixels[i] = light > 177 ? rgba(131, 64, 36) : rgba(244, 182, 116);
              else pixels[i] = light > 150 ? rgba(117, 97, 80) : rgba(185, 161, 134);
            }
          }
          if (code === selected) continue;
          if (left === selected || right === selected || above === selected || below === selected)
            pixels[i] = rgba(54, 47, 40);
          else if (
            (surface[i - wide] & 31) === selected ||
            (surface[i + wide] & 31) === selected ||
            (surface[i - 2 * dy] & 31) === selected ||
            (surface[i + 2 * dy] & 31) === selected
          )
            pixels[i] = rgba(174, 99, 60);
        }
      }
    }
    const visible = [];
    let projection = { x: 0, y: 0, visible: false };
    for (const [code] of targetEntries) {
      const index = nearest[code];
      if (index < 0) continue;
      const x = ((index % width) + 0.5) / width,
        y = (Math.floor(index / width) + 0.5) / height;
      visible.push({ code, x, y });
      if (code === selected) projection = { x, y, visible: true };
    }
    return { pixels, width, height, submitted, projection, visible };
  }
  function pick(x, y) {
    const px = clamp(Math.floor(x * width), 0, width - 1),
      py = clamp(Math.floor(y * height), 0, height - 1);
    return surface[py * width + px] || 0;
  }
  const { anchors, targets, center, size } = meta;
  const targetEntries = Object.entries(targets).map(([code, point]) => [Number(code), point]);
  return { render, pick, meta: { anchors, targets, center, size } };
}

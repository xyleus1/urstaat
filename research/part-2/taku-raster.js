import { arrangements, layoutSculpture } from './taku-composition.js?v=studio-3';
// A depth-buffered Canvas renderer. The worker consumes only the latest camera
// pose; the UI thread remains free to receive drag, scroll and inspection input.
const near = 0.009;
const rgba = (r, g, b) => (255 << 24) | (b << 16) | (g << 8) | r;
const background = rgba(16, 20, 21);
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

function decodeDots(bytes) {
  const data = new DataView(bytes);
  let at = 10;
  return [0, 1, 2].map((_, j) => {
    const count = data.getUint16(4 + j * 2, true);
    const dots = new Float32Array(count * 5);
    for (let i = 0; i < count; i++, at += 3) {
      const packed = data.getUint8(at + 2),
        layer = packed >> 5,
        ink = layer < 5 ? (packed & 31) / 31 : 1.22;
      const k = i * 5;
      dots[k] = data.getInt8(at) / 125;
      dots[k + 1] = data.getInt8(at + 1) / 125;
      dots[k + 2] = layer < 5 ? layer : (layer - 5) * 2;
      dots[k + 3] = 1.75 + ink * 1.8;
      dots[k + 4] = 0.19 + 0.81 * ink;
    }
    return dots;
  });
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

export function createRaster({ model, lights, ink, inkSize, dots }, kernel) {
  const meta = unpack(model, kernel),
    patterns = dots ? decodeDots(dots) : [[], [], []];
  const palette = new Uint32Array(13 * 6400);
  let paletteKey = '',
    backKey = '',
    width = 0,
    height = 0,
    pixels,
    depths,
    surface,
    back;
  const wasm = kernel?.exports,
    memory = wasm?.memory;
  let cursor = Number(wasm?.__heap_base || 0),
    palettePtr,
    cameraPtr,
    scratchPtr,
    inkPtr,
    viewportPtr;
  function reserve(bytes) {
    const offset = cursor;
    cursor = (cursor + bytes + 15) & ~15;
    if (cursor > memory.buffer.byteLength) memory.grow(Math.ceil((cursor - memory.buffer.byteLength) / 65536));
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
  function setBackground(pose, camera) {
    const key = [width, height, pose.cssWidth, pose.id, ...pose.orbit, ...pose.target].join('/');
    if (backKey === key) return;
    backKey = key;
    back.fill(background);
    const registration = pose.preset || pose,
      distance = registration.orbit[2],
      aspect = width / height;
    const halfAngle = Math.tan(Math.PI / 12),
      focal = height / (halfAngle * 2);
    const dpr = (width / pose.cssWidth) * (pose.mobile ? 0.88 : 1);
    const smooth = (x) => {
      const v = clamp(x, 0, 1);
      return v * v * (3 - 2 * v);
    };
    const ref = basis(registration);
    const d = ref.pos.map((v, k) => v - camera.pos[k]);
    const projectAxis = (axis) => [
      dot(...d, axis),
      dot(...ref.right, axis),
      dot(...ref.up, axis),
      dot(...ref.eye, axis),
    ];
    const rx = projectAxis(camera.right),
      ry = projectAxis(camera.up),
      rz = projectAxis(camera.eye);
    for (let i = 0; i < 2; i++) {
      const spec = layoutSculpture(arrangements[pose.id][i], i, aspect),
        points = patterns[spec.shape];
      // Each cloud spans only five planes. Project an entire plane's basis once;
      // a plane outside the frustum can skip all of its point and ink samples.
      const planes = Array.from({ length: 5 }, (_, layer) => {
        const distanceToPlane = distance * (1.32 + 0.21 * layer),
          planeHalf = distanceToPlane * halfAngle;
        const x = spec.x * aspect * planeHalf,
          y = spec.y * planeHalf,
          radius = spec.radius * planeHalf;
        const sheetAxis = (a, sign) => [
          (a[0] + a[1] * x + a[2] * y - a[3] * distanceToPlane) * sign,
          a[1] * radius * sign,
          a[2] * radius * sign,
        ];
        const xAxis = sheetAxis(rx, 1),
          yAxis = sheetAxis(ry, 1),
          depth = sheetAxis(rz, -1);
        const outside = (a, slope, sign) =>
          slope * depth[0] +
            sign * a[0] +
            Math.abs(slope * depth[1] + sign * a[1]) +
            Math.abs(slope * depth[2] + sign * a[2]) <
          0;
        const visible =
          depth[0] + Math.abs(depth[1]) + Math.abs(depth[2]) > 0.001 &&
          !outside(xAxis, aspect * halfAngle, 1) &&
          !outside(xAxis, aspect * halfAngle, -1) &&
          !outside(yAxis, halfAngle, 1) &&
          !outside(yAxis, halfAngle, -1);
        return { xAxis, yAxis, depth, visible, distanceToPlane };
      });
      if (!planes.some((p) => p.visible)) continue;
      for (let j = 0; j < points.length; j += pose.mobile ? 10 : 5) {
        const u = points[j],
          v = points[j + 1],
          sheet = planes[points[j + 2]];
        if (!sheet.visible) continue;
        const z = sheet.depth,
          depth = z[0] + u * z[1] + v * z[2];
        if (depth <= 0.001) continue;
        const x = sheet.xAxis,
          y = sheet.yAxis,
          scale = focal / depth,
          plane = sheet.distanceToPlane;
        const cx = width * 0.5 + scale * (x[0] + u * x[1] + v * x[2]),
          cy = height * 0.5 - scale * (y[0] + u * y[1] + v * y[2]);
        if (cx < 0 || cy < 0 || cx >= width || cy >= height) continue;
        const size = dpr * clamp(points[j + 3] * Math.pow(plane / depth, 0.42), 1.4, 4.4);
        const radius = size * 0.5,
          density = points[j + 4] * spec.ink * smooth((depth / distance - 0.16) / 0.42);
        const core2 = (0.33 * size) ** 2,
          radius2 = radius * radius;
        const y0 = Math.max(0, Math.ceil(cy - radius - 0.5)),
          y1 = Math.min(height - 1, Math.floor(cy + radius - 0.5));
        const x0 = Math.max(0, Math.ceil(cx - radius - 0.5)),
          x1 = Math.min(width - 1, Math.floor(cx + radius - 0.5));
        for (let py = y0; py <= y1; py++)
          for (let px = x0; px <= x1; px++) {
            const dx = px + 0.5 - cx,
              dy = py + 0.5 - cy,
              r2 = dx * dx + dy * dy;
            if (r2 >= radius2) continue;
            const coverage = r2 <= core2 ? 1 : 1 - smooth((Math.sqrt(r2) / size - 0.33) / 0.17);
            const alpha = clamp(density * coverage, 0, 1),
              index = py * width + px,
              current = back[index];
            const r = current & 255,
              g = (current >>> 8) & 255,
              b = (current >>> 16) & 255;
            back[index] = rgba(r + (135 - r) * alpha, g + (143 - g) * alpha, b + (145 - b) * alpha);
          }
      }
    }
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
      back = new Uint32Array(count);
    }
    setPalette(pose.orbit[0], pose.orbit[1]);
    setBackground(pose, basis(pose));
    pixels.set(back);
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
        if ((za <= 0 || za >= 1 / near) && (zb <= 0 || zb >= 1 / near) && (zc <= 0 || zc >= 1 / near)) continue;
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
    const center = meta.targets[selected],
      dx = center[0] - pos[0],
      dy = center[1] - pos[1],
      dz = center[2] - pos[2];
    const [px, py] = screen(dot(dx, dy, dz, right), dot(dx, dy, dz, up), -dot(dx, dy, dz, eye));
    let best = Infinity,
      bestX = 0,
      bestY = 0;
    const inner = rgba(244, 182, 116),
      outer = rgba(174, 99, 60),
      dark = rgba(54, 47, 40);
    // Mask and color share a Z test. Occluded portions of the part never appear in the keyline.
    const step = Math.max(1, Math.round(width / pose.cssWidth)),
      wide = step * 2,
      dyStep = step * width,
      dyWide = wide * width;
    if (wasm) {
      const nearest = wasm.outline(selected, step, px, py);
      return {
        pixels,
        width,
        height,
        submitted,
        projection: {
          x: (nearest % width) / width,
          y: Math.floor(nearest / width) / height,
          visible: nearest >= 0,
        },
      };
    }
    for (let y = wide; y < height - wide; y++)
      for (let x = wide, i = y * width + wide; x < width - wide; x++, i++) {
        const on = (surface[i] & tagMask) === selected;
        if (on) {
          const distance = (x - px) ** 2 + (y - py) ** 2;
          if (distance < best) {
            best = distance;
            bestX = x;
            bestY = y;
          }
        }
        const major =
          (surface[i - step] & tagMask) === selected ||
          (surface[i + step] & tagMask) === selected ||
          (surface[i - dyStep] & tagMask) === selected ||
          (surface[i + dyStep] & tagMask) === selected;
        if (on) {
          if (
            (surface[i - step] & tagMask) !== selected ||
            (surface[i + step] & tagMask) !== selected ||
            (surface[i - dyStep] & tagMask) !== selected ||
            (surface[i + dyStep] & tagMask) !== selected
          )
            pixels[i] = (pixels[i] & 255) > 177 ? rgba(131, 64, 36) : inner;
        } else if (major) pixels[i] = dark;
        else if (
          (surface[i - wide] & tagMask) === selected ||
          (surface[i + wide] & tagMask) === selected ||
          (surface[i - dyWide] & tagMask) === selected ||
          (surface[i + dyWide] & tagMask) === selected
        )
          pixels[i] = outer;
      }
    return {
      pixels,
      width,
      height,
      submitted,
      projection: { x: bestX / width, y: bestY / height, visible: best < Infinity },
    };
  }
  function pick(x, y) {
    const px = clamp(Math.floor(x * width), 0, width - 1),
      py = clamp(Math.floor(y * height), 0, height - 1);
    return surface[py * width + px] || 0;
  }
  const { anchors, targets, center, size } = meta;
  return { render, pick, meta: { anchors, targets, center, size } };
}

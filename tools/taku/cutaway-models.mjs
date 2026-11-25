// Rebuild with node tools/taku/cutaway-models.mjs after npm ci --prefix hero.
import { mkdir, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import * as T from '../../hero/node_modules/three/build/three.module.js';
import { toCreasedNormals } from '../../hero/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js';
import { NodeIO } from '../../hero/node_modules/@gltf-transform/core/dist/index.js';
import { ALL_EXTENSIONS } from '../../hero/node_modules/@gltf-transform/extensions/dist/index.js';
import { MeshoptDecoder, MeshoptSimplifier } from '../../hero/node_modules/meshoptimizer/index.js';

const out = new URL('../../research/part-2/cutaways/', import.meta.url);
const tau = 2 * Math.PI;
// Color/finish slots are kept in sync with the cutaway renderer.
const shell = 0,
  alloy = 1,
  machined = 2,
  black = 3,
  copper = 4,
  steel = 5,
  gasket = 6,
  brass = 7,
  filterGlass = 8,
  lensGlass = 9,
  solderMask = 10,
  silicon = 11,
  smokedWindow = 12;
const batches = new Map();
function add(group, material, geo) {
  const id = group + '/' + material;
  if (!batches.has(id)) batches.set(id, { group, material, vertices: [], indices: [], map: new Map() });
  const b = batches.get(id);
  const positions = geo.getAttribute('position'),
    normals = geo.getAttribute('normal');
  const ids = geo.index?.array || Array.from({ length: positions.count }, (_, i) => i);
  const cached = new Int32Array(positions.count).fill(-1);
  for (const i of ids) {
    if (cached[i] === -1) {
      let x = normals.getX(i),
        y = normals.getY(i),
        z = normals.getZ(i);
      const norm = Math.abs(x) + Math.abs(y) + Math.abs(z) || 1;
      x /= norm;
      y /= norm;
      const ox = z < 0 ? (1 - Math.abs(y)) * (Math.sign(x) || 1) : x;
      const oy = z < 0 ? (1 - Math.abs(x)) * (Math.sign(y) || 1) : y;
      const v = [positions.getX(i), positions.getY(i), positions.getZ(i)].map((value) =>
        Math.round(value * 160),
      );
      v.push(Math.round(ox * 127), Math.round(oy * 127));
      const key = v.join(',');
      if (!b.map.has(key)) {
        b.map.set(key, b.vertices.length);
        b.vertices.push(v);
      }
      cached[i] = b.map.get(key);
    }
    b.indices.push(cached[i]);
  }
  geo.dispose();
}

async function save(name) {
  const draws = [],
    list = [...batches.values()];
  let vertices = 0,
    indices = 0;
  for (const b of list) {
    draws.push([b.group, b.material, indices, b.indices.length]);
    indices += b.indices.length;
    vertices += b.vertices.length;
  }
  const descriptor = Buffer.from(JSON.stringify({ draws, vertices, indices }));
  const offset = Math.ceil((descriptor.length + 4) / 4) * 4;
  const buf = Buffer.alloc(offset + vertices * 8 + indices * 4);
  buf.writeUInt32LE(descriptor.length);
  descriptor.copy(buf, 4);
  let v = 0,
    k = 0;
  for (const b of list) {
    for (let i = 0; i < b.vertices.length; i++) {
      const row = b.vertices[i],
        p = offset + (v + i) * 8;
      for (let a = 0; a < 3; a++) buf.writeInt16LE(row[a], p + 2 * a);
      buf.writeInt8(row[3], p + 6);
      buf.writeInt8(row[4], p + 7);
    }
    for (const i of b.indices) buf.writeUInt32LE(v + i, offset + vertices * 8 + 4 * k++);
    v += b.vertices.length;
  }
  const data = gzipSync(buf, { level: 9 });
  await writeFile(new URL(name + '.bin.gz', out), data);
  console.log(name, vertices, 'vertices', indices / 3, 'triangles,', data.length, 'bytes');
  batches.clear();
}
const vec = (x, y, z) => new T.Vector3(x, y, z);
function lathe(profile, segments = 72) {
  return new T.LatheGeometry(
    profile.map(([r, z]) => new T.Vector2(r, z)),
    segments,
  ).rotateX(Math.PI / 2);
}
function roundPath(w, h, r, Constructor = T.Shape) {
  const s = new Constructor(),
    x = w / 2,
    y = h / 2;
  s.moveTo(-x + r, -y);
  s.lineTo(x - r, -y);
  s.quadraticCurveTo(x, -y, x, -y + r);
  s.lineTo(x, y - r);
  s.quadraticCurveTo(x, y, x - r, y);
  s.lineTo(-x + r, y);
  s.quadraticCurveTo(-x, y, -x, y - r);
  s.lineTo(-x, -y + r);
  s.quadraticCurveTo(-x, -y, -x + r, -y);
  s.closePath();
  return s;
}
function circ(x, y, r, Constructor = T.Path) {
  const s = new Constructor();
  s.absarc(x, y, r, 0, tau, false);
  s.closePath();
  return s;
}
function extrusion(shape, depth, bevel = 0.2, curveSegments = 28) {
  return new T.ExtrudeGeometry(shape, {
    curveSegments,
    depth,
    steps: 1,
    bevelEnabled: !!bevel,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
  }).translate(0, 0, -depth / 2);
}
const circleArray = (count, r, phase = 0) =>
  Array.from({ length: count }, (_, i) => [
    r * Math.cos((i * tau) / count + phase),
    r * Math.sin((i * tau) / count + phase),
  ]);
function flange(r, bore, depth, holeCircle, holeR, count) {
  const s = circ(0, 0, r, T.Shape);
  s.holes.push(circ(0, 0, bore));
  for (const [x, y] of circleArray(count, holeCircle)) s.holes.push(circ(x, y, holeR));
  return extrusion(s, depth, 0.34);
}
function tube(points, r, segments = 48, sides = 6, closed = false) {
  return new T.TubeGeometry(new T.CatmullRomCurve3(points, closed), segments, r, sides, closed);
}
function screws(group, points, len = 8, r = 1.75) {
  for (const [x, y] of points) {
    const shank = lathe(
      [
        [0, -len],
        [r * 0.82, -len],
        [r, -len + 0.6],
        [r, -0.2],
        [r * 0.9, 0],
        [0, 0],
      ],
      18,
    );
    add(group, steel, shank.translate(x, y, 0));
    const spiral = [];
    for (let i = 0; i <= 140; i++) {
      const a = (i * tau) / 14;
      spiral.push(vec(x + r * Math.cos(a), y + r * Math.sin(a), -len + 0.6 + (i * (len - 1.7)) / 140));
    }
    add(group, machined, tube(spiral, 0.22, 140, 4));
    const hex = new T.Path();
    for (let i = 0; i <= 6; i++) {
      const a = (i * tau) / 6;
      hex[i ? 'lineTo' : 'moveTo'](r * 0.92 * Math.cos(a), r * 0.92 * Math.sin(a));
    }
    const s = circ(0, 0, r * 1.75, T.Shape);
    s.holes.push(hex);
    add(group, black, extrusion(s, 2.9, 0.17).translate(x, y, 1.52));
    add(
      group,
      black,
      lathe(
        [
          [0, 0.2],
          [r * 1.03, 0.2],
          [r * 1.03, 0.75],
          [0, 0.75],
        ],
        24,
      ).translate(x, y, 0),
    );
  }
}
async function actuator() {
  await Promise.all([MeshoptDecoder.ready, MeshoptSimplifier.ready]);
  const path = fileURLToPath(new URL('../../hero/assets/actuator.web.glb', import.meta.url));
  const doc = await new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'meshopt.decoder': MeshoptDecoder })
    .read(path);
  const specs = [
    ['Back housing', 0, 129, shell],
    ['Motor stator', 1, 47, black],
    ['Motor rotor', 2, 86, alloy],
    ['Sun gear', 3, -22, machined],
    ['Sun gear key', 3, -22, steel],
    ...['A', 'B', 'C'].map((s) => ['Planet gear ' + s, 3, -47, steel]),
    ['Ring gear', 4, 8, alloy],
    ['Planet carrier / upper', 5, -85, machined],
    ...['A', 'B', 'C'].map((s) => ['Output pin ' + s, 5, -99, steel]),
    ['Planet carrier / lower', 5, -111, alloy],
  ];
  const nodes = doc.getRoot().listNodes();
  for (const [name, group, center, material] of specs) {
    const n = nodes.find((n) => n.getName() === name);
    if (!n) throw Error('Missing ' + name);
    const matrix = new T.Matrix4().fromArray(n.getWorldMatrix()),
      normalMatrix = new T.Matrix3().getNormalMatrix(matrix);
    for (const prim of n.getMesh().listPrimitives()) {
      const pos = prim.getAttribute('POSITION'),
        normal = prim.getAttribute('NORMAL'),
        p = [],
        ns = [];
      const v = new T.Vector3(),
        tmp = [];
      for (let i = 0; i < pos.getCount(); i++) {
        v.fromArray(pos.getElement(i, tmp)).applyMatrix4(matrix);
        const localZ = name.endsWith('/ lower') ? -4 : name.endsWith('/ upper') ? 4 : 0;
        p.push(v.x, -v.z, v.y - center + localZ);
        if (normal) {
          v.fromArray(normal.getElement(i, tmp)).applyMatrix3(normalMatrix).normalize();
          ns.push(v.x, -v.z, v.y);
        }
      }
      const geo = new T.BufferGeometry();
      const points = new Float32Array(p);
      geo.setAttribute('position', new T.BufferAttribute(points, 3));
      if (normal) geo.setAttribute('normal', new T.Float32BufferAttribute(ns, 3));
      const index = new Uint32Array(prim.getIndices().getArray());
      const [lean] = MeshoptSimplifier.simplify(
        index,
        points,
        3,
        Math.floor((index.length * 0.34) / 3) * 3,
        0.0019,
        ['Permissive'],
      );
      geo.setIndex(new T.BufferAttribute(lean, 1));
      add(group, material, normal ? geo : toCreasedNormals(geo, Math.PI / 5));
    }
  }
  // The replica has 36 tooth stems centered 2.25 degrees past each ten-degree radial.
  for (let tooth = 0; tooth < 36; tooth++) {
    const a = (tau * (tooth + 0.225)) / 36,
      p = [];
    for (let i = 0; i <= 7 * 32; i++) {
      const phase = (i * tau) / 32,
        t = 1.85 * Math.sign(Math.cos(phase)) * Math.pow(Math.abs(Math.cos(phase)), 0.34);
      const z = 4.85 * Math.sign(Math.sin(phase)) * Math.pow(Math.abs(Math.sin(phase)), 0.34);
      const r = 31.8 + (5.9 * i) / (7 * 32);
      p.push(vec(r * Math.cos(a) - t * Math.sin(a), r * Math.sin(a) + t * Math.cos(a), z));
    }
    add(1, copper, tube(p, 0.43, 7 * 28, 5));
  }
  // Illustrative magnet segments line the inside of the rotor bell, clear of the 40.5 mm stator.
  for (let i = 0; i < 42; i++) {
    const angle = (i * tau) / 42,
      arc = (tau / 42) * 0.91;
    const shape = new T.Shape();
    shape.absarc(0, 0, 41.9, angle, angle + arc, false);
    shape.absarc(0, 0, 40.82, angle + arc, angle, true);
    shape.closePath();
    add(2, steel, extrusion(shape, 8.1, 0.09, 3).translate(0, 0, 3.45));
  }
  await save('actuator');
}
function wrist() {
  add(0, shell, flange(36, 18, 6, 30, 2.3, 8));
  add(
    0,
    black,
    lathe(
      [
        [18, -2],
        [21, -2],
        [21, 2],
        [20.3, 2.6],
        [18, 2.6],
        [18, -2],
      ],
      72,
    ).translate(0, 0, 4),
  );
  add(
    1,
    machined,
    lathe(
      [
        [15, -3.8],
        [21.1, -3.8],
        [23.2, -2.6],
        [20.8, 0],
        [23.2, 2.6],
        [21.1, 3.8],
        [15, 3.8],
        [14.5, 3.3],
        [14.5, -3.3],
        [15, -3.8],
      ],
      96,
    ),
  );
  for (let i = 0; i < 32; i++) {
    const a = (tau * i) / 32,
      r = 24;
    const cylinder = lathe(
      [
        [0, -2.8],
        [1.42, -2.8],
        [1.72, -2.55],
        [1.82, -2.27],
        [1.82, 2.27],
        [1.72, 2.55],
        [1.42, 2.8],
        [0, 2.8],
      ],
      24,
    );
    cylinder
      .rotateY(((i % 2 ? -1 : 1) * Math.PI) / 4)
      .rotateZ(a)
      .translate(r * Math.cos(a), r * Math.sin(a), 0);
    add(2, steel, cylinder);
    const b = a + tau / 64;
    add(
      2,
      black,
      new T.BoxGeometry(1.55, 0.8, 3.3).rotateZ(b).translate(r * Math.cos(b), r * Math.sin(b), 0),
    );
  }
  add(
    3,
    alloy,
    lathe(
      [
        [27.4, -4],
        [31.3, -4],
        [32, -3.3],
        [32, 3.3],
        [31.3, 4],
        [27.4, 4],
        [25.3, 2.55],
        [27.8, 0],
        [25.3, -2.55],
        [27.4, -4],
      ],
      96,
    ),
  );
  add(
    3,
    gasket,
    lathe(
      [
        [28.3, 4],
        [31.2, 4],
        [31.2, 4.55],
        [28.3, 4.55],
        [28.3, 4],
      ],
      96,
    ),
  );
  add(4, machined, flange(31, 12, 5.4, 24, 2.6, 6));
  add(
    4,
    alloy,
    lathe(
      [
        [12, -1],
        [16, -1],
        [16, 1.25],
        [15.7, 1.55],
        [12, 1.55],
        [12, -1],
      ],
      72,
    ).translate(0, 0, 3.4),
  );
  screws(5, circleArray(6, 24), 8.5, 1.8);
}
function panel() {
  const fasteners = [
    [-34, -21],
    [34, -21],
    [-34, 21],
    [34, 21],
  ];
  const frame = roundPath(83, 55, 5);
  frame.holes.push(roundPath(57, 34, 5, T.Path));
  for (const [x, y] of fasteners) frame.holes.push(circ(x, y, 2.9));
  add(0, alloy, extrusion(frame, 3.2, 0.36));
  for (const [x, y] of fasteners) {
    add(
      1,
      brass,
      lathe(
        [
          [1.9, -2.9],
          [2.7, -2.9],
          [3.2, -2.3],
          [3.2, 1.8],
          [4, 1.8],
          [4, 2.6],
          [1.9, 2.6],
          [1.9, -2.9],
        ],
        36,
      ).translate(x, y, 0),
    );
    for (let i = 0; i < 15; i++) {
      const a = (tau * i) / 15;
      add(
        1,
        brass,
        new T.BoxGeometry(0.65, 0.38, 3.5)
          .rotateZ(a)
          .translate(x + 3.15 * Math.cos(a), y + 3.15 * Math.sin(a), -0.15),
      );
    }
  }
  const seal = roundPath(80, 53, 6);
  seal.holes.push(roundPath(70, 43, 4, T.Path));
  for (const [x, y] of fasteners) seal.holes.push(circ(x, y, 2.35));
  add(2, gasket, extrusion(seal, 1.4, 0.12));
  const face = roundPath(82, 54, 2);
  for (const [x, y] of fasteners) face.holes.push(circ(x, y, 2.3));
  for (const y of [-9, 0, 9]) {
    const slot = new T.Path();
    slot.absarc(-17, y, 1.65, Math.PI / 2, (3 * Math.PI) / 2, false);
    slot.lineTo(17, y - 1.65);
    slot.absarc(17, y, 1.65, -Math.PI / 2, Math.PI / 2, false);
    slot.closePath();
    face.holes.push(slot);
    // Pressed louver lip spans the punched slot, rising out of the skin.
    const lip = new T.Shape();
    lip.moveTo(-1.65, 0.9);
    lip.quadraticCurveTo(-0.25, 3.6, 1.65, 3.0);
    lip.lineTo(1.65, 2.2);
    lip.quadraticCurveTo(-0.12, 2.65, -1.03, 0.7);
    lip.closePath();
    add(
      3,
      shell,
      extrusion(lip, 33, 0.08)
        .rotateX(Math.PI / 2)
        .rotateZ(Math.PI / 2)
        .translate(0, y, 0),
    );
  }
  add(3, shell, extrusion(face, 1.4, 0.12));
  // Cross section of the parallel inner and outer quarter bends, extruded along each edge.
  function fold(length) {
    const section = new T.Shape();
    section.moveTo(0, 0.7);
    section.absarc(0, -2.3, 3, Math.PI / 2, 0, true);
    section.lineTo(3, -7);
    section.lineTo(1.6, -7);
    section.lineTo(1.6, -2.3);
    section.absarc(0, -2.3, 1.6, 0, Math.PI / 2, false);
    section.closePath();
    return extrusion(section, length, 0).rotateX(Math.PI / 2);
  }
  for (const sign of [-1, 1]) {
    add(
      3,
      shell,
      fold(49)
        .rotateZ(sign === 1 ? 0 : Math.PI)
        .translate(sign * 41, 0, 0),
    );
    add(
      3,
      shell,
      fold(76)
        .rotateZ((sign * Math.PI) / 2)
        .translate(0, sign * 27, 0),
    );
  }
  screws(4, fasteners, 7, 1.65);
}
// Preserve the left face aperture and the cover from the site model in the same
// head-local frame. Head CAD axes are forward/up/right. Study axes are left/up/forward.
async function opticalWindow() {
  await MeshoptDecoder.ready;
  const path = fileURLToPath(new URL('../../research/part-2/assets/taku-desktop.glb', import.meta.url));
  const doc = await new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'meshopt.decoder': MeshoptDecoder })
    .read(path);
  const nodes = doc.getRoot().listNodes();
  const head = nodes.find((node) => node.getName() === 'head_roll_link');
  const relative = new T.Matrix4().fromArray(head.getWorldMatrix()).invert();
  const transform = new T.Matrix4()
    .set(0, 0, -1000, -29.75, 0, 1000, 0, -38.03, 1000, 0, 0, -81.59, 0, 0, 0, 1)
    .multiply(relative);
  for (const [name, finish] of [
    ['head_roll_link_surface_3', black],
    ['head_optical_cover_left', smokedWindow],
  ]) {
    const source = nodes.find((node) => node.getName() === name);
    source.traverse((node) => {
      if (!node.getMesh()) return;
      const matrix = transform.clone().multiply(new T.Matrix4().fromArray(node.getWorldMatrix()));
      const normalMatrix = new T.Matrix3().getNormalMatrix(matrix);
      for (const primitive of node.getMesh().listPrimitives()) {
        const p = primitive.getAttribute('POSITION'),
          n = primitive.getAttribute('NORMAL');
        const pos = [],
          normals = [],
          indices = [];
        const point = new T.Vector3(),
          normal = new T.Vector3();
        for (let i = 0; i < p.getCount(); i++) {
          point.fromArray(p.getElement(i, [])).applyMatrix4(matrix);
          normal.fromArray(n.getElement(i, [])).applyNormalMatrix(normalMatrix);
          pos.push(point.x, point.y, point.z);
          normals.push(normal.x, normal.y, normal.z);
        }
        const faces = primitive.getIndices().getArray();
        for (let i = 0; i < faces.length; i += 3) {
          // The source surround mesh contains both apertures, 60 mm apart.
          if (pos[3 * faces[i]] > -28) indices.push(faces[i], faces[i + 1], faces[i + 2]);
        }
        if (!indices.length) continue;
        const geometry = new T.BufferGeometry();
        geometry.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
        geometry.setAttribute('normal', new T.Float32BufferAttribute(normals, 3));
        geometry.setIndex(indices);
        add(5, finish, geometry);
      }
    });
  }
}

async function optics() {
  const posts = [
    [-8.6, -12],
    [8.6, -12],
    [-8.6, 12],
    [8.6, 12],
  ];
  const plate = (g, mat, w, h, r, depth, z, x = 0, y = 0) =>
    add(g, mat, extrusion(roundPath(w, h, r), depth, 0.11, 8).translate(x, y, z));
  const block = (g, mat, w, h, d, x, y, z) => add(g, mat, new T.BoxGeometry(w, h, d).translate(x, y, z));
  const ring = (g, mat, outer, inner, depth, z, x = 0, y = 0) =>
    add(
      g,
      mat,
      lathe(
        [
          [inner, -depth / 2],
          [outer - 0.16, -depth / 2],
          [outer, -depth / 2 + 0.16],
          [outer, depth / 2 - 0.16],
          [outer - 0.16, depth / 2],
          [inner, depth / 2],
          [inner, -depth / 2],
        ],
        56,
      ).translate(x, y, z),
    );
  const carrier = roundPath(23, 32, 3);
  carrier.holes.push(roundPath(16, 21, 2, T.Path));
  add(0, alloy, extrusion(carrier, 4.2, 0.28, 10));
  const back = roundPath(22, 31, 3);
  for (const x of [-5, 0, 5]) back.holes.push(circ(x, 0, 1.45));
  add(0, alloy, extrusion(back, 1.2, 0.15, 9).translate(0, 0, -2.5));
  for (const [x, y] of posts) ring(0, brass, 1.57, 0.85, 3.7, 1, x, y);
  for (const sign of [-1, 1]) {
    for (let i = -2; i <= 2; i++) block(0, machined, 0.9, 1.1, 3.1, sign * 11.45, i * 3.2, -0.5);
  }

  const pcb = roundPath(21, 29, 2.2);
  for (const [x, y] of posts) pcb.holes.push(circ(x, y, 0.95));
  add(1, solderMask, extrusion(pcb, 0.85, 0.12, 10));
  for (const [x, y] of posts) ring(1, brass, 1.5, 0.95, 0.42, 0.37, x, y);
  plate(1, black, 12.3, 10.6, 0.55, 1.45, 1.1);
  plate(1, shell, 10.3, 8.7, 0.3, 0.38, 1.91);
  plate(1, brass, 9.0, 7.45, 0.2, 0.2, 2.12);
  plate(1, silicon, 8.5, 6.95, 0.14, 0.2, 2.32);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 11; i++) {
      const y = -4.1 + i * 0.82;
      block(1, brass, 1.05, 0.32, 0.25, side * 6.23, y, 0.64);
      const x = 6.74 + (i % 3) * 0.66;
      block(1, brass, x - 6.3, 0.13, 0.1, (side * (x + 6.3)) / 2, y, 0.51);
      block(1, brass, 0.13, 0.72, 0.1, side * x, y + 0.29, 0.51);
    }
    for (let i = 0; i < 4; i++) {
      const x = -6.3 + 3.85 * i,
        y = side * (7.6 + (i % 2));
      block(1, steel, 2.05, 1.14, 0.64, x, y, 0.78);
      block(1, black, 1.31, 1.18, 0.76, x, y, 0.82);
    }
  }
  plate(1, shell, 7.2, 2.2, 0.2, 1.25, 1.0, 0, -12);
  for (let i = 0; i < 8; i++) block(1, brass, 0.33, 1.5, 0.35, -2.65 + i * 0.75, -11.3, 1.5);

  const filter = roundPath(18, 19.4, 2);
  filter.holes.push(roundPath(13.6, 14.9, 1, T.Path));
  add(2, black, extrusion(filter, 1.15, 0.16, 12));
  plate(2, filterGlass, 14.3, 15.7, 1.2, 0.83, 0);
  for (const sign of [-1, 1]) block(2, machined, 3.7, 1.15, 0.42, 0, sign * 7.75, 0.66);

  // Forward-facing iris, a stepped retaining shoulder, external grip flutes and two end notches.
  add(
    3,
    black,
    lathe(
      [
        [4.3, -5.1],
        [7.15, -5.1],
        [7.7, -4.5],
        [7.7, -2.2],
        [9.0, -2.2],
        [9.45, -1.7],
        [9.45, 3.0],
        [8.75, 3.6],
        [8.75, 5.3],
        [7.95, 5.5],
        [7.95, 4.0],
        [6.85, 4.0],
        [6.85, -1.2],
        [4.3, -2.8],
        [4.3, -5.1],
      ],
      96,
    ),
  );
  for (let i = 0; i < 36; i++) {
    const angle = (i * tau) / 36;
    add(
      3,
      alloy,
      new T.BoxGeometry(0.35, 0.48, 3.35)
        .rotateZ(angle)
        .translate(9.42 * Math.cos(angle), 9.42 * Math.sin(angle), 0.8),
    );
  }
  for (const z of [-4.05, -3.2, 4.2, 4.9]) ring(3, alloy, z < 0 ? 7.84 : 8.87, z < 0 ? 7.58 : 8.6, 0.39, z);
  for (const sign of [-1, 1]) block(3, machined, 0.65, 1.03, 0.22, 0, sign * 8.17, 5.49);

  // Revolved optical sections. Vertex normals follow each convex crown into its ground perimeter.
  add(
    4,
    lensGlass,
    lathe(
      [
        [0, -3.2],
        [2.7, -3.0],
        [5.2, -2.65],
        [6.8, -2.25],
        [7.08, -2.0],
        [7.08, -1.25],
        [6.8, -1.02],
        [5.1, -0.74],
        [2.7, -0.52],
        [0, -0.45],
      ],
      80,
    ),
  );
  ring(4, black, 7.75, 6.82, 1.14, -0.36);
  add(
    4,
    lensGlass,
    lathe(
      [
        [0, 0.16],
        [3, 0.32],
        [5.4, 0.55],
        [6.9, 0.84],
        [7.35, 1.12],
        [7.35, 1.8],
        [7.12, 2.07],
        [6.2, 2.51],
        [4.9, 2.98],
        [3.15, 3.36],
        [1.55, 3.53],
        [0, 3.6],
      ],
      96,
    ),
  );
  ring(4, machined, 7.73, 7.25, 0.58, 1.6);
  await opticalWindow();
  await save('optics');
}

await mkdir(out, { recursive: true });
const recipes = {
  actuator,
  wrist: async () => {
    wrist();
    await save('wrist');
  },
  panel: async () => {
    panel();
    await save('panel');
  },
  optics,
};
const requested = process.argv[2];
if (requested && !Object.hasOwn(recipes, requested)) throw Error('Unknown study ' + requested);
for (const run of requested ? [recipes[requested]] : Object.values(recipes)) await run();

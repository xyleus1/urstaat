// Author the Canvas 2D renderer's opaque CAD, per-surface picking and cameras.
// Run from the repository root after installing the existing hero dependencies.
import fs from 'node:fs';
import * as T from '../../hero/node_modules/three/build/three.module.js';
import { GLTFLoader } from '../../hero/node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from '../../hero/node_modules/three/examples/jsm/libs/meshopt_decoder.module.js';
import { MeshoptSimplifier } from '../../hero/node_modules/meshoptimizer/index.js';
import { dressTakuJoints } from '../../hero/taku-joint-detail.js';
import { identifySurface, partCode } from '../../hero/taku-outline.js';

globalThis.self = globalThis;
const base = new URL('../../research/part-2/assets/', import.meta.url);
const raw = fs.readFileSync(new URL('taku-mobile.glb', base)),
  length = raw.readUInt32LE(12);
const doc = JSON.parse(raw.subarray(20, 20 + length)),
  bin = raw.subarray(28 + length);
const print = doc.materials.find((m) => m.name.endsWith('chest print')).pbrMetallicRoughness.baseColorTexture;
const transform = print.extensions.KHR_texture_transform;
const image = doc.bufferViews[doc.images[doc.textures[print.index].source].bufferView];
fs.writeFileSync(
  new URL('taku-ink.png', base),
  bin.subarray(image.byteOffset || 0, (image.byteOffset || 0) + image.byteLength),
);
delete doc.images;
delete doc.textures;
for (const m of doc.materials) delete m.pbrMetallicRoughness.baseColorTexture;
const json = JSON.stringify(doc),
  j = Buffer.from(json + ' '.repeat((4 - (Buffer.byteLength(json) % 4)) % 4));
const h = Buffer.from(raw.subarray(0, 20));
h.writeUInt32LE(raw.length - length + j.length, 8);
h.writeUInt32LE(j.length, 12);
const b = Buffer.concat([h, j, raw.subarray(20 + length)]);
const robot = (
  await new GLTFLoader()
    .setMeshoptDecoder(MeshoptDecoder)
    .parseAsync(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), '')
).scene;
robot.updateWorldMatrix(true, true);
dressTakuJoints(T, robot, true);
robot.updateWorldMatrix(true, true);
await MeshoptSimplifier.ready;
const tags = [
  'satin porcelain shell',
  'graphite',
  'bead-blasted alloy',
  'elastomer',
  'smoke optical glass',
  'optical surround',
  'satin joint cap',
  'dynaclaw grip surface',
  'chest print',
  'illustrative satin retainer',
  'illustrative machined edge',
  'illustrative graphite seal',
  'illustrative recessed fastener',
];
const overall = new T.Box3().setFromObject(robot),
  selected = {},
  chunks = [],
  parts = [];
robot.traverse((n) => {
  if (!n.isMesh) return;
  const g = n.geometry,
    finish = tags.findIndex((tag) => n.material.name.toLowerCase().endsWith(tag));
  if (finish < 0) throw Error(n.material.name);
  const pick = identifySurface(n),
    code = pick?.code || 0;
  const fullPick = pick ? partCode(pick.id, pick.side) : 0;
  const p = g.attributes.position,
    normal = g.attributes.normal,
    uv = g.attributes.uv;
  const positions = new Float32Array(3 * p.count),
    normals = new Float32Array(3 * p.count);
  const vector = new T.Vector3(),
    nm = new T.Matrix3().getNormalMatrix(n.matrixWorld),
    box = new T.Box3();
  for (let i = 0; i < p.count; i++) {
    vector
      .fromBufferAttribute(p, i)
      .applyMatrix4(n.matrixWorld)
      .toArray(positions, 3 * i);
    box.expandByPoint(vector);
    vector
      .fromBufferAttribute(normal, i)
      .applyNormalMatrix(nm)
      .toArray(normals, 3 * i);
  }
  if (code) (selected[code] ||= new T.Box3()).union(box);
  const indices = Uint32Array.from({ length: g.index?.count || p.count }, (_, i) =>
    g.index ? g.index.getX(i) : i,
  );
  const target = Math.max(12, Math.floor((indices.length * 0.13) / 3) * 3);
  const result =
    finish === 8 || indices.length <= 96
      ? indices
      : MeshoptSimplifier.simplifyWithAttributes(
          indices,
          positions,
          3,
          normals,
          3,
          [0.003, 0.003, 0.003],
          null,
          target,
          code ? 0.00035 : 0.0007,
          ['ErrorAbsolute', 'Permissive'],
        )[0];
  const unique = [...new Set(result)],
    remap = new Uint32Array(p.count);
  const vertices = Buffer.alloc(unique.length * 11),
    tri = Buffer.alloc(result.length * 2);
  const size = box.getSize(new T.Vector3()).toArray(),
    min = box.min.toArray();
  unique.forEach((src, i) => {
    remap[src] = i;
    for (let k = 0; k < 3; k++) {
      vertices.writeUInt16LE(
        Math.max(0, Math.min(65535, Math.round((65535 * (positions[3 * src + k] - min[k])) / (size[k] || 1)))),
        i * 11 + k * 2,
      );
      vertices.writeInt8(Math.round(127 * normals[3 * src + k]), i * 11 + 6 + k);
    }
    if (finish === 8) {
      const coords = [uv.getX(src), uv.getY(src)];
      for (let k = 0; k < 2; k++)
        vertices[i * 11 + 9 + k] = Math.max(
          0,
          Math.min(255, Math.round(255 * (coords[k] * transform.scale[k] + transform.offset[k]))),
        );
    }
  });
  if (unique.length > 65535) throw Error('Local index overflow');
  for (let i = 0; i < result.length; i++) tri.writeUInt16LE(remap[result[i]], i * 2);
  chunks.push(vertices, tri);
  parts.push({ min, size, vertices: unique.length, indices: result.length, finish, code, pick: fullPick });
});
const anchors = {};
for (const [name, box] of Object.entries(selected)) anchors[name] = box.getCenter(new T.Vector3()).toArray();
robot.traverse((n) => {
  if (!n.name.startsWith('view_')) return;
  const m = /^view_(?:(right)_)?(face|shoulder|elbow|wrist|claw|waist|base)$/.exec(n.name);
  if (m && m[2] !== 'base')
    anchors[partCode(m[2], m[1] || 'left')] = n.getWorldPosition(new T.Vector3()).toArray();
});
for (const s of ['left', 'right'])
  anchors[partCode('wrist', s)] = robot
    .getObjectByName(s + '_wrist_inspection_interface')
    .getWorldPosition(new T.Vector3())
    .toArray();
const targets = Object.fromEntries(
  Object.entries(selected).map(([k, v]) => [k, v.getCenter(new T.Vector3()).toArray()]),
);
const metadata = Buffer.from(
  JSON.stringify({
    parts,
    anchors,
    targets,
    center: overall.getCenter(new T.Vector3()).toArray(),
    size: overall.getSize(new T.Vector3()).toArray(),
  }),
);
const header = Buffer.alloc(8);
header.write('TKC1');
header.writeUInt32LE(metadata.length, 4);
import { gzipSync } from 'node:zlib';
const out = Buffer.concat([header, metadata, ...chunks]);
fs.writeFileSync(new URL('taku-cpu.bin.gz', base), gzipSync(out, { level: 9 }));
console.log(
  parts.length,
  'surfaces',
  parts.reduce((s, p) => s + p.indices / 3, 0),
  'triangles',
  out.length,
  'decoded bytes',
);

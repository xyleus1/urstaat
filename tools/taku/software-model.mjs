// Builds a fixed software-renderer asset from the checked-in desktop CAD.
// From the repository root, run npm ci --prefix hero, then node tools/taku/software-model.mjs [output.glb].
import { mkdir, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodeIO } from '../../hero/node_modules/@gltf-transform/core/dist/index.js';
import {
  ALL_EXTENSIONS,
  EXTMeshoptCompression,
} from '../../hero/node_modules/@gltf-transform/extensions/dist/index.js';
import {
  MeshoptDecoder,
  MeshoptEncoder,
  MeshoptSimplifier,
} from '../../hero/node_modules/meshoptimizer/index.js';

const source = new URL('../../research/part-2/assets/taku-desktop.glb', import.meta.url);
const destination = process.argv[2]
  ? resolve(process.argv[2])
  : fileURLToPath(new URL('taku-software.glb', source));
if (
  ['taku-mobile.glb', 'taku-desktop.glb'].some(
    (name) => destination.toLowerCase() === fileURLToPath(new URL(name, source)).toLowerCase(),
  )
) {
  throw Error('Choose a distinct output for the software geometry.');
}

function sourcePart(node) {
  for (let parent = node; parent; parent = parent.getParentNode()) {
    if (/link_surface|optical_cover|link_logo/.test(parent.getName())) return parent.getName();
  }
  return '';
}

function compactAttributes(primitive, indices) {
  // Keep the existing integer quantization, authored normals and UVs bit-for-bit on retained vertices.
  const [remap, count] = MeshoptEncoder.reorderMesh(indices, true, true);
  for (const semantic of primitive.listSemantics()) {
    const accessor = primitive.getAttribute(semantic);
    const raw = accessor.getArray(),
      width = accessor.getElementSize();
    const compact = new raw.constructor(count * width);
    for (let i = 0; i < remap.length; i++) {
      if (remap[i] === 0xffffffff) continue;
      for (let k = 0; k < width; k++) compact[remap[i] * width + k] = raw[i * width + k];
    }
    accessor.setArray(compact);
  }
  primitive.getIndices().setArray(count <= 65535 ? new Uint16Array(indices) : indices);
}

await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready, MeshoptSimplifier.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.decoder': MeshoptDecoder,
  'meshopt.encoder': MeshoptEncoder,
});
const document = await io.read(fileURLToPath(source));
const instances = new Map();
for (const node of document.getRoot().listNodes()) {
  const mesh = node.getMesh();
  if (!mesh) continue;
  if (!instances.has(mesh)) instances.set(mesh, []);
  instances.get(mesh).push(node);
}
let trianglesBefore = 0,
  trianglesAfter = 0,
  exactPrimitives = 0;
for (const [mesh, nodes] of instances) {
  const labels = nodes.map(sourcePart);
  const joint = labels.some((name) => /head_|wrist|elbow|shoulder_pitch_link_surface_[23]/.test(name));
  for (const primitive of mesh.listPrimitives()) {
    const attribute = primitive.getAttribute('POSITION'),
      normal = primitive.getAttribute('NORMAL');
    const original = primitive.getIndices().getArray();
    const material = primitive.getMaterial().getName();
    trianglesBefore += (nodes.length * original.length) / 3;
    // The cap drives Hermite dressing at runtime; the overlay and optics carry tiny registered details.
    const exact = /joint cap|optical|smoke|chest print|grip surface/i.test(material) || original.length < 300;
    if (exact) {
      trianglesAfter += (nodes.length * original.length) / 3;
      exactPrimitives++;
      continue;
    }
    const points = new Float32Array(attribute.getCount() * 3),
      normals = new Float32Array(points.length);
    const m = nodes[0].getWorldMatrix(),
      tmp = [];
    // Every desktop instance uses a rigid transform and uniform quantization scale.
    // Work in metres so the solver's absolute error is comparable across CAD parts.
    const scales = [0, 4, 8].map((i) => Math.hypot(m[i], m[i + 1], m[i + 2]));
    if (Math.max(...scales) - Math.min(...scales) > scales[0] * 0.00001) throw Error('Nonuniform CAD scale');
    for (let i = 0; i < attribute.getCount(); i++) {
      attribute.getElement(i, tmp);
      for (let k = 0; k < 3; k++) points[3 * i + k] = tmp[k] * scales[0];
      normal.getElement(i, tmp);
      const n = Math.hypot(...tmp) || 1;
      for (let k = 0; k < 3; k++) normals[3 * i + k] = tmp[k] / n;
    }
    const tolerance = joint ? 0.00012 : 0.0005;
    const target = Math.max(9, Math.floor((original.length * 0.025) / 3) * 3);
    const [indices] = MeshoptSimplifier.simplifyWithAttributes(
      Uint32Array.from(original),
      points,
      3,
      normals,
      3,
      [0.04, 0.04, 0.04],
      null,
      target,
      tolerance,
      ['ErrorAbsolute', 'Permissive'],
    );
    compactAttributes(primitive, indices);
    trianglesAfter += (nodes.length * indices.length) / 3;
  }
}
document
  .createExtension(EXTMeshoptCompression)
  .setRequired(true)
  .setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
await mkdir(dirname(destination), { recursive: true });
await io.write(destination, document);
console.log(
  JSON.stringify({
    file: destination,
    bytes: (await stat(destination)).size,
    trianglesBefore,
    trianglesAfter,
    exactPrimitives,
  }),
);

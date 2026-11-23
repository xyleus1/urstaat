// Bake the fixed display pose into stage coordinates. The source scene stays
// intact for semantic hit testing and joint targets.
export function batchTakuMeshes(THREE, robot) {
  const batches = new Map();
  const display = new THREE.Group();
  display.name = 'Taku display surfaces';
  robot.updateWorldMatrix(true, true);

  function collect(geometry, material, matrix, ranges) {
    if (!material || !material.visible) return;
    const index = geometry.index, position = geometry.attributes.position;
    const total = index?.count ?? position.count;
    const draw = geometry.drawRange;
    const intervals = [];
    let count = 0;
    for (const range of ranges) {
      const first = Math.max(0, draw.start, range.start);
      const end = Math.min(total, draw.start + draw.count, range.start + range.count);
      const length = Math.floor((end - first) / 3) * 3;
      if (length > 0) { intervals.push([first, first + length]); count += length; }
    }
    if (!count) return;
    let batch = batches.get(material);
    if (!batch) {
      batch = { parts: [], vertices: 0, indices: 0, hasUv: false };
      batches.set(material, batch);
    }
    batch.parts.push({ geometry, matrix, intervals });
    batch.vertices += position.count;
    batch.indices += count;
    batch.hasUv ||= !!geometry.attributes.uv;
  }

  robot.traverseVisible(node => {
    if (!node.isMesh || !node.geometry.attributes.position) return;
    const geometry = node.geometry;
    const ranges = new Map();
    if (Array.isArray(node.material)) {
      for (const group of geometry.groups) {
        const mat = node.material[group.materialIndex];
        if (!ranges.has(mat)) ranges.set(mat, []);
        ranges.get(mat).push(group);
      }
    } else ranges.set(node.material, [{ start: 0, count: Infinity }]);
    const instances = node.isInstancedMesh ? node.count : 1;
    for (let i = 0; i < instances; i++) {
      let matrix = node.matrixWorld;
      if (node.isInstancedMesh) {
        matrix = new THREE.Matrix4();
        node.getMatrixAt(i, matrix);
        matrix.premultiply(node.matrixWorld);
      }
      for (const [mat, groupRanges] of ranges) collect(geometry, mat, matrix, groupRanges);
    }
  });

  const normalMatrix = new THREE.Matrix3();
  const sourcePoint = new THREE.Vector3(), sourceNormal = new THREE.Vector3();
  for (const [material, batch] of batches) {
    const positions = new Float32Array(batch.vertices * 3);
    const normals = new Float32Array(batch.vertices * 3);
    // The shared studio shader also samples a white swatch for untextured
    // parts. For those, its default uv=(0,0) needs no vertex buffer.
    const uv = batch.hasUv ? new Float32Array(batch.vertices * 2) : null;
    const indices = batch.vertices > 65535 ? new Uint32Array(batch.indices) : new Uint16Array(batch.indices);
    const bounds = new THREE.Box3();
    let firstVertex = 0, writeIndex = 0;
    for (const { geometry, matrix, intervals } of batch.parts) {
      const source = geometry.attributes.position, texcoord = geometry.attributes.uv;
      let originalNormals = geometry.attributes.normal;
      if (!originalNormals) {
        const local = new THREE.BufferGeometry().setAttribute('position', source);
        local.setIndex(geometry.index);
        local.computeVertexNormals();
        originalNormals = local.attributes.normal;
      }
      normalMatrix.getNormalMatrix(matrix);
      const mirrored = matrix.determinant() < 0;
      for (let i = 0; i < source.count; i++) {
        // Three attribute accessors decode strided glTF buffers and normalized
        // integer quantization. The node matrix includes gltfpack's position scale.
        sourcePoint.fromBufferAttribute(source, i).applyMatrix4(matrix);
        sourceNormal.fromBufferAttribute(originalNormals, i).applyNormalMatrix(normalMatrix);
        const vertex = firstVertex + i;
        sourcePoint.toArray(positions, vertex * 3);
        sourceNormal.toArray(normals, vertex * 3);
        bounds.expandByPoint(sourcePoint);
        if (uv && texcoord) {
          uv[vertex * 2] = texcoord.getX(i);
          uv[vertex * 2 + 1] = texcoord.getY(i);
        }
      }
      const original = geometry.index;
      for (const [start, end] of intervals) {
        for (let i = start; i < end; i += 3) {
          const a = original ? original.getX(i) : i;
          const b = original ? original.getX(i + 1) : i + 1;
          const c = original ? original.getX(i + 2) : i + 2;
          indices[writeIndex++] = firstVertex + a;
          indices[writeIndex++] = firstVertex + (mirrored ? c : b);
          indices[writeIndex++] = firstVertex + (mirrored ? b : c);
        }
      }
      firstVertex += source.count;
    }
    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    result.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    if (uv) result.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    result.setIndex(new THREE.BufferAttribute(indices, 1));
    result.boundingBox = bounds;
    result.boundingSphere = bounds.getBoundingSphere(new THREE.Sphere());
    const mesh = new THREE.Mesh(result, material);
    mesh.name = material.name;
    mesh.matrixAutoUpdate = false;
    display.add(mesh);
  }
  return {
    group: display,
    dispose() {
      for (const mesh of display.children) mesh.geometry.dispose();
      display.clear();
    },
  };
}

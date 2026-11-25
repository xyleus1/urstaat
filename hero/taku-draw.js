// Nearby cells receive nearby index ranges, allowing the renderer to skip a
// whole limb without changing a single vertex or introducing a draw per cell.
const cellSize = .11;
const mergeGap = 1800 * 3;

function spacedBits(value) {
  // Interleave ten bits per coordinate into a Morton key. Taku occupies a
  // small portion of this 112 m span in its fixed stage coordinates.
  let n = (value + 256) & 1023;
  n = (n | (n << 16)) & 0x30000ff;
  n = (n | (n << 8)) & 0x300f00f;
  n = (n | (n << 4)) & 0x30c30c3;
  return (n | (n << 2)) & 0x9249249;
}

function makeSpatialIndex(THREE, positions, indices) {
  const byKey = new Map(), cells = [];
  const assignment = new Uint32Array(indices.length / 3);
  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i] * 3, b = indices[i + 1] * 3, c = indices[i + 2] * 3;
    const x = Math.floor((positions[a] + positions[b] + positions[c]) / (3 * cellSize));
    const y = Math.floor((positions[a+1] + positions[b+1] + positions[c+1]) / (3 * cellSize));
    const z = Math.floor((positions[a+2] + positions[b+2] + positions[c+2]) / (3 * cellSize));
    const key = spacedBits(x) | (spacedBits(y) << 1) | (spacedBits(z) << 2);
    let cell = byKey.get(key);
    if (!cell) {
      cell = { id: cells.length, key, box: new THREE.Box3(), start: 0, count: 0 };
      byKey.set(key, cell);
      cells.push(cell);
    }
    assignment[i / 3] = cell.id;
    cell.count += 3;
    // Cull against the complete triangle, including vertices outside its centroid's cell.
    const { min, max } = cell.box;
    min.x = Math.min(min.x, positions[a], positions[b], positions[c]);
    min.y = Math.min(min.y, positions[a+1], positions[b+1], positions[c+1]);
    min.z = Math.min(min.z, positions[a+2], positions[b+2], positions[c+2]);
    max.x = Math.max(max.x, positions[a], positions[b], positions[c]);
    max.y = Math.max(max.y, positions[a+1], positions[b+1], positions[c+1]);
    max.z = Math.max(max.z, positions[a+2], positions[b+2], positions[c+2]);
  }
  if (cells.length < 2) return null;
  cells.sort((a, b) => a.key - b.key);
  const offsets = new Uint32Array(cells.length);
  let start = 0;
  for (const cell of cells) {
    cell.box.expandByScalar(.000003);
    cell.start = offsets[cell.id] = start;
    start += cell.count;
  }
  const sorted = new indices.constructor(indices.length);
  for (let i = 0; i < indices.length; i += 3) {
    const id = assignment[i / 3], offset = offsets[id];
    sorted[offset] = indices[i];
    sorted[offset+1] = indices[i+1];
    sorted[offset+2] = indices[i+2];
    offsets[id] += 3;
  }
  return { indices: sorted, cells };
}

function containsBox(frustum, { min, max }) {
  for (const plane of frustum.planes) {
    const { x, y, z } = plane.normal;
    if (x*(x >= 0 ? min.x : max.x) + y*(y >= 0 ? min.y : max.y) +
        z*(z >= 0 ? min.z : max.z) + plane.constant < 0) return false;
  }
  return true;
}

function showRanges(batch, frustum, showAll) {
  const { geometry, cells, pool } = batch;
  const groups = geometry.groups;
  if (showAll || containsBox(frustum, geometry.boundingBox)) {
    if (batch.full) return;
    groups.length = 1;
    groups[0] = pool[0];
    groups[0].start = 0;
    groups[0].count = geometry.index.count;
    batch.full = true;
    return;
  }
  batch.full = false;
  let count = 0, last = null;
  if (frustum.intersectsBox(geometry.boundingBox)) {
    for (const cell of cells) {
      if (!frustum.intersectsBox(cell.box)) continue;
      if (last && cell.start - (last.start + last.count) <= mergeGap) {
        last.count = cell.start + cell.count - last.start;
      } else {
        last = pool[count];
        last.start = cell.start;
        last.count = cell.count;
        groups[count++] = last;
      }
    }
  }
  groups.length = count;
}

// Bake the fixed display pose into stage coordinates. The source scene stays
// intact for semantic hit testing and joint targets.
export function batchTakuMeshes(THREE, robot, surfaceTags) {
  const batches = new Map();
  const display = new THREE.Group();
  const spatialBatches = [], displayBounds = new THREE.Box3();
  const frustum = new THREE.Frustum(), projection = new THREE.Matrix4(), previousProjection = new THREE.Matrix4();
  let hasProjection = false;
  display.name = 'Taku display surfaces';
  robot.updateWorldMatrix(true, true);

  function collect(geometry, material, matrix, ranges, tag) {
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
    batch.parts.push({ geometry, matrix, intervals, tag });
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
      for (const [mat, groupRanges] of ranges) collect(geometry, mat, matrix, groupRanges, surfaceTags?.get(node)?.code || 0);
    }
  });

  const normalMatrix = new THREE.Matrix3();
  const sourcePoint = new THREE.Vector3(), sourceNormal = new THREE.Vector3();
  for (const [material, batch] of batches) {
    const positions = new Float32Array(batch.vertices * 3);
    const normals = new Float32Array(batch.vertices * 3);
    const partTags = new Uint8Array(batch.vertices);
    // The shared studio shader also samples a white swatch for untextured
    // parts. For those, its default uv=(0,0) needs no vertex buffer.
    const uv = batch.hasUv ? new Float32Array(batch.vertices * 2) : null;
    const indices = batch.vertices > 65535 ? new Uint32Array(batch.indices) : new Uint16Array(batch.indices);
    const bounds = new THREE.Box3();
    let firstVertex = 0, writeIndex = 0;
    for (const { geometry, matrix, intervals, tag } of batch.parts) {
      const source = geometry.attributes.position, texcoord = geometry.attributes.uv;
      partTags.fill(tag,firstVertex,firstVertex+source.count);
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
    result.setAttribute('partTag', new THREE.BufferAttribute(partTags, 1));
    if (uv) result.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    // Preserve submission order for overlay/transparent surfaces, including
    // the offset print on the chest. Small materials already cost one draw.
    const spatial = indices.length > mergeGap && !material.transparent &&
      material.depthWrite && !material.polygonOffset ? makeSpatialIndex(THREE, positions, indices) : null;
    result.setIndex(new THREE.BufferAttribute(spatial ? spatial.indices : indices, 1));
    result.boundingBox = bounds;
    result.boundingSphere = bounds.getBoundingSphere(new THREE.Sphere());
    const mesh = new THREE.Mesh(result, spatial ? [material] : material);
    if (spatial) {
      const pool = spatial.cells.map(() => ({ start: 0, count: 0, materialIndex: 0 }));
      pool[0].count = indices.length;
      result.groups.push(pool[0]);
      spatialBatches.push({ geometry: result, cells: spatial.cells, pool, full: true });
      displayBounds.union(bounds);
    }
    mesh.name = material.name;
    mesh.matrixAutoUpdate = false;
    display.add(mesh);
  }
  return {
    group: display,
    updateVisible(camera) {
      if (!spatialBatches.length) return;
      projection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      if (hasProjection && previousProjection.equals(projection)) return;
      previousProjection.copy(projection);
      hasProjection = true;
      frustum.setFromProjectionMatrix(projection, camera.coordinateSystem, camera.reversedDepth);
      const showAll = containsBox(frustum, displayBounds);
      for (const batch of spatialBatches) showRanges(batch, frustum, showAll);
    },
    dispose() {
      for (const mesh of display.children) mesh.geometry.dispose();
      spatialBatches.length = 0;
      display.clear();
    },
  };
}

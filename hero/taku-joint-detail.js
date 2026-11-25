// Display study. The cap remains Dyna's geometry. The neighboring retaining
// rings, face screws and seals are illustrative details sized to its CAD
// interfaces. Source link coordinates are metres; the glTF is Y-up.
function smoothCap(THREE, original, subdivisions) {
  const p = [],
    n = [];
  // gltfpack stores some indices in interleaved views and quantizes positions.
  let indices = Array.from({ length: original.index.count }, (_, i) => original.index.getX(i));
  const a = new THREE.Vector3(),
    b = new THREE.Vector3();
  const normals = original.attributes.normal,
    positions = original.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    a.fromBufferAttribute(positions, i).toArray(p, i * 3);
    b.fromBufferAttribute(normals, i)
      .normalize()
      .toArray(n, i * 3);
  }
  const na = new THREE.Vector3(),
    nb = new THREE.Vector3(),
    delta = new THREE.Vector3();
  for (let step = 0; step < subdivisions; step++) {
    const mids = new Map(),
      next = [];
    const stride = p.length / 3;
    function midpoint(i, j) {
      const key = Math.min(i, j) * stride + Math.max(i, j);
      if (mids.has(key)) return mids.get(key);
      a.fromArray(p, 3 * i);
      b.fromArray(p, 3 * j);
      na.fromArray(n, 3 * i);
      nb.fromArray(n, 3 * j);
      delta.subVectors(b, a);
      a.lerp(b, 0.5);
      // Hermite midpoint constrained by the original normals. Hard corners
      // have distinct source vertices and do not get blended together.
      if (na.dot(nb) > 0.8) {
        a.addScaledVector(na, -0.125 * delta.dot(na)).addScaledVector(nb, 0.125 * delta.dot(nb));
      }
      const id = p.length / 3;
      p.push(a.x, a.y, a.z);
      na.add(nb).normalize();
      n.push(na.x, na.y, na.z);
      mids.set(key, id);
      return id;
    }
    for (let k = 0; k < indices.length; k += 3) {
      const i = indices[k],
        j = indices[k + 1],
        l = indices[k + 2];
      const ij = midpoint(i, j),
        jl = midpoint(j, l),
        li = midpoint(l, i);
      next.push(i, ij, li, ij, j, jl, li, jl, l, ij, jl, li);
    }
    indices = next;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(n, 3));
  geometry.setIndex(indices);
  geometry.computeBoundingBox();
  return geometry;
}

function annulus(THREE, inner, outer, thickness, sockets, radius, seat, bevel) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, outer, 0, Math.PI * 2, false);
  const bore = new THREE.Path();
  bore.absarc(0, 0, inner, 0, Math.PI * 2, true);
  shape.holes.push(bore);
  for (let i = 0; i < sockets; i++) {
    const angle = ((i + 0.5) * 2 * Math.PI) / sockets;
    const hole = new THREE.Path();
    hole.absarc(radius * Math.cos(angle), radius * Math.sin(angle), seat, 0, Math.PI * 2, true);
    shape.holes.push(hole);
  }
  return new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: bevel,
    bevelThickness: bevel,
    curveSegments: 36,
  });
}

function socketHead(THREE, radius) {
  const shape = new THREE.Shape(),
    socket = new THREE.Path();
  shape.absarc(0, 0, radius, 0, Math.PI * 2, false);
  for (let i = 0; i < 6; i++) {
    const angle = (-i * Math.PI) / 3;
    const x = 0.48 * radius * Math.cos(angle),
      y = 0.48 * radius * Math.sin(angle);
    if (!i) socket.moveTo(x, y);
    else socket.lineTo(x, y);
  }
  socket.closePath();
  shape.holes.push(socket);
  return new THREE.ExtrudeGeometry(shape, {
    depth: radius * 0.17,
    bevelEnabled: true,
    bevelSegments: 1,
    bevelSize: radius * 0.06,
    bevelThickness: radius * 0.05,
    curveSegments: 8,
  });
}

function wristSleeve(THREE) {
  // In the Dyna link frame, the roll axis is Z-up CAD Z (glTF Y).
  // The shallow scallops actually change the metal's cross-section.
  const rings = [
    [-0.009, 0.0314, 0],
    [-0.008, 0.0336, 0],
    [-0.006, 0.0341, 0],
    [-0.005, 0.0338, 0.0012],
    [0.005, 0.0338, 0.0012],
    [0.006, 0.0341, 0],
    [0.008, 0.0336, 0],
    [0.009, 0.0314, 0],
  ];
  const positions = [],
    indices = [],
    segments = 192;
  for (let j = 0; j < rings.length; j++) {
    const [height, outer, depth] = rings[j];
    for (let i = 0; i < segments; i++) {
      const angle = (i * 2 * Math.PI) / segments;
      const radius = outer - depth * Math.pow(0.5 + 0.5 * Math.cos(32 * angle), 2);
      positions.push(radius * Math.cos(angle), height, radius * Math.sin(angle));
      if (j) {
        const a = (j - 1) * segments + i,
          b = (j - 1) * segments + ((i + 1) % segments);
        indices.push(a, a + segments, b, b, a + segments, b + segments);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function wheelTread(THREE) {
  // The published wheel is a radius-62.5 mm cylinder, 38 mm wide. The alloy
  // hub occupies the middle of its end face. An annulus avoids coincident
  // coplanar rubber/metal caps and gives its circular profile 128 segments.
  const profile = [
    [0.043, -0.0187],
    [0.0609, -0.019],
    [0.0618, -0.0188],
    [0.0624, -0.0182],
    [0.0625, -0.0175],
    [0.0625, 0.0175],
    [0.0624, 0.0182],
    [0.0618, 0.0188],
    [0.0609, 0.019],
    [0.043, 0.0187],
  ];
  return new THREE.LatheGeometry(
    profile.map((p) => new THREE.Vector2(...p)),
    128,
  ).rotateX(Math.PI / 2);
}

export function dressTakuJoints(THREE, robot, mobile) {
  function finish(name, color, metalness, roughness) {
    return new THREE.MeshStandardMaterial({ name, color, metalness, roughness });
  }
  const steel = finish('Illustrative satin retainer', 0x768185, 0.72, 0.34);
  const edge = finish('Illustrative machined edge', 0xa8b0af, 0.72, 0.25);
  const dark = finish('Illustrative graphite seal', 0x30393b, 0.16, 0.57);
  const screw = finish('Illustrative recessed fastener', 0x495153, 0.54, 0.36);
  const refined = new Map();
  robot.traverse((node) => {
    if (!node.isMesh) return;
    if (/wheel_link_surface_2/.test(node.parent?.name)) {
      const toQuantized = node.matrixWorld.clone().invert().multiply(node.parent.matrixWorld);
      node.geometry = wheelTread(THREE).applyMatrix4(toQuantized);
      return;
    }
    if (!/joint cap/i.test(node.material.name)) return;
    const input = node.geometry;
    if (!refined.has(input)) refined.set(input, smoothCap(THREE, input, mobile ? 2 : 1));
    node.geometry = refined.get(input);
  });
  const calibrations = [
    {
      id: 'elbow',
      link: 'elbow_link',
      height: 0.0523,
      inner: 0.03365,
      outer: 0.04035,
      seats: 6,
      seat: 0.00145,
      boltCircle: 0.03725,
      plate: 0.00085,
    },
  ];
  for (const c of calibrations) {
    const body = annulus(THREE, c.inner, c.outer, c.plate, c.seats, c.boltCircle, c.seat, 0.00011);
    const lip = annulus(THREE, c.outer - 0.00008, c.outer + 0.00048, 0.00022, 0, 0, 0, 0.000065);
    const gasket = annulus(THREE, c.inner - 0.0002, c.outer + 0.00054, 0.00056, 0, 0, 0, 0.00013);
    const fastener = socketHead(THREE, c.seat * 0.8);
    for (const side of ['left', 'right']) {
      const link = robot.getObjectByName(side + '_' + c.link);
      if (!link) continue;
      const sign = side === 'left' ? -1 : 1;
      const flange = new THREE.Group();
      flange.name = side + '_' + c.id + '_inspection_interface';
      flange.position.z = sign * c.height;
      if (sign < 0) flange.rotation.y = Math.PI;
      link.add(flange);
      function attach(geometry, material, x, y, z) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = material.name;
        mesh.userData.takuPart = { id: c.id, side };
        mesh.position.set(x, y, z);
        flange.add(mesh);
      }
      attach(gasket, dark, 0, 0, -0.00068);
      attach(body, steel, 0, 0, 0);
      attach(lip, edge, 0, 0, c.plate * 0.86);
      for (let i = 0; i < c.seats; i++) {
        const a = ((i + 0.5) * 2 * Math.PI) / c.seats;
        attach(fastener, screw, c.boltCircle * Math.cos(a), c.boltCircle * Math.sin(a), c.plate - 0.00034);
      }
    }
  }
  const sleeve = wristSleeve(THREE);
  const seal = new THREE.TorusGeometry(0.03145, 0.00105, 8, 128).rotateX(Math.PI / 2);
  const bead = new THREE.TorusGeometry(0.03335, 0.0005, 8, 128).rotateX(Math.PI / 2);
  for (const side of ['left', 'right']) {
    const link = robot.getObjectByName(side + '_wrist_roll_link');
    if (!link) continue;
    const group = new THREE.Group();
    group.name = side + '_wrist_inspection_interface';
    group.position.y = -0.0435;
    link.add(group);
    for (const [geometry, material, y] of [
      [sleeve, steel, 0],
      [seal, dark, -0.0093],
      [seal, dark, 0.0093],
      [bead, edge, -0.0064],
      [bead, edge, 0.0064],
    ]) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData.takuPart = { id: 'wrist', side };
      mesh.position.y = y;
      group.add(mesh);
    }
  }
  robot.updateWorldMatrix(true, true);
}

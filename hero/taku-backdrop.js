// A contour is split over five physical planes. Its samples land on the
// intended outline from one camera pose; orbiting reveals their separation.
const arrangements = {
  // [shape, horizontal position, vertical position, radius, ink]
  overview: [[0, -.52, .09, .67, .94], [1, .56, -.11, .62, .76]],
  side:     [[2, -.52, .03, .75, .96], [1, .55, .13, .59, .71]],
  face:     [[0, -.54, .08, .83, 1], [2, .59, -.12, .63, .69]],
  shoulder: [[0, -.56, .15, .70, .90], [1, .58, -.10, .59, .73]],
  elbow:    [[1, .57, -.05, .76, .97], [2, -.58, .13, .62, .72]],
  wrist:    [[1, -.56, -.01, .76, .97], [0, .57, .16, .55, .72]],
  claw:     [[1, -.56, -.01, .80, 1], [2, .59, .11, .64, .73]],
  waist:    [[2, -.54, -.02, .80, .98], [0, .59, .16, .55, .75]],
  base:     [[2, .55, .04, .72, .94], [1, -.56, .13, .57, .73]],
};

const vertexShader = /* glsl */`
  uniform mat4 presetFrame;
  uniform vec2 center;
  uniform float aspect, radius, distanceToTarget, halfAngle, pixelRatio;
  attribute float ink;
  varying float density;
  void main() {
    float distanceToPlane = distanceToTarget * (1.32 + .21 * position.z);
    vec2 drawing = vec2(center.x * aspect, center.y) + position.xy * radius;
    vec4 world = presetFrame * vec4(drawing * distanceToPlane * halfAngle, -distanceToPlane, 1.);
    vec4 eye = viewMatrix * world;
    gl_Position = projectionMatrix * eye;
    // The sculpture is a backdrop from every orbit angle. Keeping its projected
    // depth behind opaque CAD surfaces preserves thin fingers and close joints.
    gl_Position.z = gl_Position.w * .99999;
    float travel = distanceToPlane / max(-eye.z, .001);
    gl_PointSize = pixelRatio * clamp((1.75 + ink * 1.8) * pow(travel, .42), 1.4, 4.4);
    density = (.19 + .81 * ink) * smoothstep(.16, .58, -eye.z / distanceToTarget);
  }
`;

const fragmentShader = /* glsl */`
  uniform float strength;
  varying float density;
  void main() {
    float r = length(gl_PointCoord - vec2(.5));
    float alpha = (1. - smoothstep(.33, .5, r)) * density * strength;
    gl_FragColor = vec4(.53, .56, .57, alpha);
  }
`;

function unpack(THREE, buffer, mobile) {
  const bytes = new DataView(buffer);
  if (bytes.getUint32(0) !== 0x544b4431) throw new Error('Unexpected Taku contour file');
  let cursor = 10;
  return [0, 1, 2].map(shape => {
    const total = bytes.getUint16(4 + shape * 2, true);
    const positions = [], tones = [];
    for (let i = 0; i < total; i++, cursor += 3) {
      if (mobile && i % 2) continue;
      const packed = bytes.getUint8(cursor + 2), plane = packed >> 5;
      positions.push(bytes.getInt8(cursor) / 125, bytes.getInt8(cursor + 1) / 125, plane < 5 ? plane : (plane - 5) * 2);
      tones.push(plane < 5 ? (packed & 31) / 31 : 1.22);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('ink', new THREE.Float32BufferAttribute(tones, 1));
    return geo;
  });
}

export function createTakuBackdrop({ THREE, scene, renderer, mobile, invalidate }) {
  const group = new THREE.Group();
  group.name = 'Taku optical sections';
  scene.add(group);
  const controller = new AbortController();
  const geometries = [];
  const presetFrame = new THREE.Matrix4(), direction = new THREE.Vector3();
  const common = {
    presetFrame: { value: presetFrame }, distanceToTarget: { value: 1 },
    pixelRatio: { value: 1 }, halfAngle: { value: 1 }, aspect: { value: 1 },
  };
  let lastView, savedEye, savedTarget;
  const dots = [0, 1].map(() => {
    const material = new THREE.ShaderMaterial({
      uniforms: { ...common, center: { value: new THREE.Vector2() }, radius: { value: 1 }, strength: { value: .8 } },
      vertexShader, fragmentShader, transparent: true, depthWrite: false,
    });
    const cloud = new THREE.Points(undefined, material);
    cloud.frustumCulled = false;
    cloud.visible = false;
    cloud.renderOrder = -100;
    group.add(cloud);
    return cloud;
  });
  const emptyGeometries = dots.map(cloud => cloud.geometry);

  function update(camera, viewId, preset) {
    const specs = arrangements[viewId] || arrangements.overview;
    if (preset?.position && preset?.target) {
      savedEye = preset.position;
      savedTarget = preset.target;
    } else if (!savedEye || viewId !== lastView) {
      savedEye = camera.position.clone();
      savedTarget = camera.getWorldDirection(direction).add(savedEye).clone();
    }
    lastView = viewId;
    presetFrame.lookAt(savedEye, savedTarget, camera.up).setPosition(savedEye);
    common.distanceToTarget.value = Math.max(.01, savedEye.distanceTo(savedTarget));
    common.aspect.value = camera.aspect;
    common.halfAngle.value = Math.tan(THREE.MathUtils.degToRad(camera.getEffectiveFOV()) * .5);
    common.pixelRatio.value = renderer.getPixelRatio() * (mobile ? .88 : 1);
    dots.forEach((cloud, i) => {
      const [shape, x, y, radius, strength] = specs[i];
      const uniforms = cloud.material.uniforms;
      const narrow = camera.aspect < 1.12;
      const horizontal = narrow ? x * .93 : x;
      uniforms.center.value.set(horizontal, narrow ? y + (i ? -.27 : .30) : y);
      uniforms.radius.value = Math.min(radius, camera.aspect * (1 - Math.abs(horizontal) - .045));
      uniforms.strength.value = strength;
      if (geometries.length) {
        cloud.geometry = geometries[shape];
        cloud.visible = true;
      }
    });
  }
  const ready = fetch('assets/taku-dots.bin', { signal: controller.signal })
    .then(response => {
      if (!response.ok) throw new Error(`Taku contours HTTP ${response.status}`);
      return response.arrayBuffer();
    })
    .then(buffer => {
      if (controller.signal.aborted) return false;
      geometries.push(...unpack(THREE, buffer, mobile));
      invalidate();
      return true;
    }).catch(error => {
      if (!controller.signal.aborted) console.warn('Taku backdrop unavailable.', error);
      return false;
    });
  function dispose() {
    controller.abort();
    scene.remove(group);
    for (const geometry of [...emptyGeometries, ...geometries]) geometry.dispose();
    for (const cloud of dots) cloud.material.dispose();
  }
  return { update, dispose, ready };
}

import { preservePartMask } from './taku-outline.js';
import { arrangements, layoutSculpture } from '../research/part-2/taku-composition.js';

// A contour is split over five physical planes. Its samples land on the
// intended outline from one camera pose; orbiting reveals their separation.
const vertexShader = /* glsl */ `
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

const fragmentShader = /* glsl */ `
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
  return [0, 1, 2].map((shape) => {
    const total = bytes.getUint16(4 + shape * 2, true);
    const positions = [],
      tones = [];
    for (let i = 0; i < total; i++, cursor += 3) {
      if (mobile && i % 2) continue;
      const packed = bytes.getUint8(cursor + 2),
        plane = packed >> 5;
      positions.push(
        bytes.getInt8(cursor) / 125,
        bytes.getInt8(cursor + 1) / 125,
        plane < 5 ? plane : (plane - 5) * 2,
      );
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
  const presetFrame = new THREE.Matrix4();
  const common = {
    distanceToTarget: { value: 1 },
    pixelRatio: { value: 1 },
    halfAngle: { value: 1 },
    aspect: { value: 1 },
  };
  const dots = Array.from({ length: 2 }, (_, i) => {
    const uniforms = {
      ...common,
      presetFrame: { value: presetFrame },
      center: { value: new THREE.Vector2() },
      radius: { value: 1 },
      strength: { value: 1 },
    };
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      ...preservePartMask(THREE),
    });
    const cloud = new THREE.Points(undefined, material);
    cloud.frustumCulled = false;
    cloud.visible = false;
    cloud.renderOrder = -100;
    group.add(cloud);
    return cloud;
  });
  const emptyGeometries = dots.map((cloud) => cloud.geometry);
  function update(camera, id, preset) {
    if (!preset?.position) return;
    presetFrame.lookAt(preset.position, preset.target, camera.up).setPosition(preset.position);
    common.distanceToTarget.value = preset.position.distanceTo(preset.target);
    common.aspect.value = camera.aspect;
    common.halfAngle.value = Math.tan(THREE.MathUtils.degToRad(camera.getEffectiveFOV()) * 0.5);
    common.pixelRatio.value = renderer.getPixelRatio() * (mobile ? 0.88 : 1);
    dots.forEach((cloud, i) => {
      cloud.visible = geometries.length > 0;
      if (!cloud.visible) return;
      const item = layoutSculpture(arrangements[id][i], i, camera.aspect);
      const uniforms = cloud.material.uniforms;
      cloud.geometry = geometries[item.shape];
      uniforms.center.value.set(item.x, item.y);
      uniforms.radius.value = item.radius;
      uniforms.strength.value = item.ink;
    });
  }
  const ready = fetch('assets/taku-dots.bin', { signal: controller.signal })
    .then((response) => {
      if (!response.ok) throw new Error(`Taku contours HTTP ${response.status}`);
      return response.arrayBuffer();
    })
    .then((buffer) => {
      if (controller.signal.aborted) return false;
      geometries.push(...unpack(THREE, buffer, mobile));
      invalidate();
      return true;
    })
    .catch((error) => {
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

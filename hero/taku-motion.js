// Preset IDs in the packed motion asset. Colors are linear glTF base colors.
const finishes = [
  [/shell|photo_white/i, [.72, .755, .765], .36, .035, .15],
  [/graphite|photo_black/i, [.017, .021, .023], .42, .10, 0],
  [/alloy|photo_gray/i, [.34, .36, .365], .33, .64, 0],
  [/elastomer|rubber/i, [.016, .019, .020], .68, 0, 0],
  [/optical glass/i, [.023, .032, .041], .22, .26, .36],
  [/optical surround/i, [.012, .014, .016], .30, .30, 0],
  [/joint cap|end.cap/i, [.11, .13, .14], .39, .47, .06],
  [/grip surface|photo_green/i, [.071, .31, .115], .58, 0, 0],
  [/chest/i, [.72, .755, .765], .36, .035, .15],
];

const vertexShader = /* glsl */ `
  #define ENVMAP_TYPE_CUBE_UV
  #define CUBEUV_MAX_MIP 6.0
  #define CUBEUV_TEXEL_WIDTH (1.0 / 336.0)
  #define CUBEUV_TEXEL_HEIGHT (1.0 / 256.0)
  #include <cube_uv_reflection_fragment>
  uniform sampler2D studioAtlas;
  uniform float hasStudio;
  uniform vec3 paint[9], finish[9];
  attribute float surfaceId;
  varying vec3 litColor;

  vec3 studioLight(vec3 n, vec3 v, vec3 l, vec3 power, vec3 pigment,
                   vec3 f0, float rough, float metal, float coat) {
    float nl = max(dot(n,l), 0.);
    vec3 h = normalize(l+v);
    float nh = max(dot(n,h), 0.), vh = max(dot(v,h), 0.);
    vec3 f = f0 + (1.-f0)*pow(1.-vh,5.);
    // A broad highlight survives interpolation on the coarser joint shells.
    float gloss = mix(10., 88., (1.-rough)*(1.-rough));
    float spec = pow(nh,gloss)*(gloss+2.)*.03979;
    return power*nl*(pigment*(1.-metal)*(1.-f)*.31831 + (f+coat*.028)*spec);
  }
  void main() {
    vec4 world = modelMatrix*vec4(position,1.);
    vec3 n = normalize((vec4(normalMatrix*normal,0.)*viewMatrix).xyz);
    vec3 v = normalize(cameraPosition-world.xyz);
    int id = int(surfaceId+.5);
    vec3 pigment = paint[id], surface = finish[id];
    float rough = surface.x, metal = surface.y, coat = surface.z;
    vec3 f0 = mix(vec3(.04),pigment,metal);
    litColor = studioLight(n,v,normalize(vec3(2.3,4.5,-2.5)),vec3(2.16,2.04,1.88),pigment,f0,rough,metal,coat);
    litColor += studioLight(n,v,normalize(vec3(1.7,.45,2.1)),vec3(.32,.38,.45),pigment,f0,rough,metal,coat);
    litColor += studioLight(n,v,normalize(vec3(-2.1,1.8,1.4)),vec3(2.05,2.3,2.6),pigment,f0,rough,metal,coat);
    litColor += mix(vec3(.055,.060,.062),vec3(.23,.26,.29),.5+.5*n.y)*pigment*(1.-metal);
    vec3 ray = reflect(-v,n);
    vec3 env = mix(vec3(.045,.047,.048),vec3(.65,.72,.8),smoothstep(-.25,.95,ray.y));
    if (hasStudio > .5) {
      float level = floor(clamp(roughnessToMip(max(rough,.15)), -2., 6.)+.5);
      env = 6.*bilinearCubeUV(studioAtlas,ray,level);
    }
    float grazing = pow(1.-clamp(dot(n,v),0.,1.),5.);
    litColor += .78*env*((f0+(1.-f0)*grazing)*(1.-.42*rough) + coat*(.04+.96*grazing));
    gl_Position = projectionMatrix*viewMatrix*world;
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 litColor;
  void main() {
    gl_FragColor = vec4(litColor,1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function unpack(THREE, buffer) {
  const data = new DataView(buffer);
  if (data.byteLength < 36 || data.getUint32(0) !== 0x544b4d31) throw new Error('Invalid Taku motion asset.');
  const vertices = data.getUint32(4, true), indexCount = data.getUint32(8, true);
  if (!vertices || vertices > 65536 || !indexCount || indexCount % 3 || data.byteLength !== 36 + 12*vertices + 2*indexCount) {
    throw new Error('Invalid Taku motion mesh dimensions.');
  }
  const lower = new THREE.Vector3(), upper = new THREE.Vector3();
  for (let axis = 0; axis < 3; axis++) {
    lower.setComponent(axis, data.getFloat32(12+4*axis, true));
    upper.setComponent(axis, data.getFloat32(24+4*axis, true));
  }
  const step = upper.clone().sub(lower).multiplyScalar(1/65535);
  const positions = new Float32Array(vertices*3);
  const normals = new Float32Array(vertices*3);
  const ids = new Uint8Array(vertices);
  for (let i = 0, offset = 36; i < vertices; i++, offset += 12) {
    const j = i*3;
    positions[j] = lower.x + step.x*data.getUint16(offset,true);
    positions[j+1] = lower.y + step.y*data.getUint16(offset+2,true);
    positions[j+2] = lower.z + step.z*data.getUint16(offset+4,true);
    let x = Math.max(-1,data.getInt8(offset+6)/127), y = Math.max(-1,data.getInt8(offset+7)/127);
    const z = 1-Math.abs(x)-Math.abs(y);
    if (z < 0) {
      const previousX = x;
      x = (1-Math.abs(y))*(previousX < 0 ? -1 : 1);
      y = (1-Math.abs(previousX))*(y < 0 ? -1 : 1);
    }
    const length = Math.sqrt(x*x+y*y+z*z);
    normals[j] = x/length; normals[j+1] = y/length; normals[j+2] = z/length;
    ids[i] = data.getUint8(offset+8);
    if (ids[i] >= finishes.length) throw new Error('Unknown Taku motion surface.');
  }
  const indices = new Uint16Array(buffer, 36+vertices*12, indexCount);
  for (const index of indices) if (index >= vertices) throw new Error('Invalid Taku motion index.');
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions,3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals,3));
  geometry.setAttribute('surfaceId', new THREE.BufferAttribute(ids,1));
  geometry.setIndex(new THREE.BufferAttribute(indices,1));
  geometry.boundingBox = new THREE.Box3(lower,upper);
  geometry.boundingSphere = geometry.boundingBox.getBoundingSphere(new THREE.Sphere());
  return geometry;
}

export async function loadTakuMotion(THREE, assetUrl, robot, atlas, motionData) {
  const bytes = motionData ? await motionData : await fetch(new URL('taku-motion.bin', new URL(assetUrl, globalThis.location?.href))).then(response => {
    if (!response.ok) throw new Error('Taku motion asset HTTP ' + response.status);
    return response.arrayBuffer();
  });
  const geometry = unpack(THREE, bytes);
  const paint = finishes.map(([,rgb]) => new THREE.Color(...rgb));
  const properties = finishes.map(([, ,rough,metal,coat]) => new THREE.Vector3(rough,metal,coat));
  const seen = new Set();
  robot?.traverse(node => {
    if (!node.isMesh) return;
    for (const source of [].concat(node.material)) {
      if (seen.has(source)) continue;
      seen.add(source);
      const index = finishes.findIndex(([pattern]) => pattern.test(source.name));
      if (index < 0) continue;
      const u = source.uniforms || {};
      const albedo = u.paint?.value || source.color;
      if (albedo) paint[index].copy(albedo);
      const p = properties[index];
      p.set(u.roughness?.value ?? source.roughness ?? p.x,
        u.metalness?.value ?? source.metalness ?? p.y,
        u.coat?.value ?? source.clearcoat ?? p.z);
    }
  });
  const material = new THREE.ShaderMaterial({
    name: 'Taku motion studio',
    vertexShader, fragmentShader,
    uniforms: { paint: {value: paint}, finish: {value: properties},
      studioAtlas: {value: atlas || null}, hasStudio: {value: atlas ? 1 : 0} },
  });
  const mesh = new THREE.Mesh(geometry,material);
  mesh.name = 'Taku motion display'; mesh.matrixAutoUpdate = false;
  return { mesh, dispose() { geometry.dispose(); material.dispose(); } };
}

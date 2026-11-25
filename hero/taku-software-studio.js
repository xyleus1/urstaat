// Eight azimuths and three elevations capture the fixed world-space studio.
// Orbiting blends neighboring captures rather than switching finishes.
const finishNames = [
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
const tileSize = 80,
  columns = 16,
  yawCount = 8,
  viewCount = 24;
const rows = Math.ceil((finishNames.length * viewCount) / columns);

const vertexShader = /* glsl */ `
  attribute float partTag;
  uniform float activePart, unselectedAlpha;
  varying float partMask;
  varying vec3 captureNormal;
  #ifdef CHEST_PRINT
    uniform mat3 printTransform;
    varying vec2 printUv;
  #endif
  void main() {
    vec4 eye = modelViewMatrix * vec4(position,1.);
    vec3 facing = normalize(-eye.xyz);
    vec3 right = normalize(vec3(facing.z,0.,-facing.x));
    vec3 up = cross(facing,right);
    vec3 n = normalize(normalMatrix * normal);
    captureNormal = vec3(dot(n,right),dot(n,up),dot(n,facing));
    partMask = mix(1.,unselectedAlpha,step(.5,abs(partTag-activePart)));
    #ifdef CHEST_PRINT
      printUv = (printTransform*vec3(uv,1.)).xy;
    #endif
    gl_Position = projectionMatrix * eye;
  }
`;
const fragmentShader = /* glsl */ `
  uniform sampler2D finishes;
  uniform vec2 origins[4], weights, tileScale, gutter;
  varying float partMask;
  varying vec3 captureNormal;
  #ifdef CHEST_PRINT
    uniform sampler2D printMap;
    varying vec2 printUv;
  #endif
  void main() {
    #ifdef CHEST_PRINT
      vec3 ink = texture2D(printMap,printUv).rgb;
      float chroma = ink.r-ink.b;
      if (chroma < .018) discard;
    #endif
    vec3 n = normalize(captureNormal) * (gl_FrontFacing ? 1. : -1.);
    // Stereographic disk avoids the long, stretched border texels of an
    // orthographic sphere capture on cylindrical rims and optical glass.
    vec2 local = gutter + tileScale*(.5+.5*n.xy/(1.+max(n.z,0.)));
    vec3 color = texture2D(finishes,origins[0]+local).rgb;
    if (weights.x>0.) color = mix(color,texture2D(finishes,origins[1]+local).rgb,weights.x);
    if (weights.y>0.) {
      vec3 next = texture2D(finishes,origins[2]+local).rgb;
      if (weights.x>0.) next = mix(next,texture2D(finishes,origins[3]+local).rgb,weights.x);
      color=mix(color,next,weights.y);
    }
    #ifdef CHEST_PRINT
      // The printed-gold capture uses the source's solid ink color. Retain
      // the lettering texture's antialiased edge through its saturation.
      color = mix(vec3(dot(color,vec3(.21,.72,.07))), color, smoothstep(.018,.30,chroma));
    #endif
    gl_FragColor = vec4(color,partMask);
  }
`;

export function prefersSoftwareStudio(renderer, mode = 'auto') {
  if (mode === 'ggx' || mode === 'studio') return false;
  if (mode === 'software') return true;
  const gl = renderer.getContext();
  const debug = gl.getExtension('WEBGL_debug_renderer_info');
  const device = gl.getParameter(debug ? debug.UNMASKED_RENDERER_WEBGL : gl.RENDERER);
  return /swiftshader|llvmpipe|softpipe|software rasterizer|microsoft basic render|gdi generic/i.test(
    device || '',
  );
}

export function createSoftwareStudio(THREE, texture) {
  // Pixels already contain the same studio display curve as the hardware shader.
  texture.colorSpace = THREE.NoColorSpace;
  texture.flipY = false;
  texture.generateMipmaps = false;
  texture.minFilter = texture.magFilter = THREE.LinearFilter;
  const width = columns * tileSize,
    height = rows * tileSize;
  const scale = { value: new THREE.Vector2((tileSize - 4) / width, (tileSize - 4) / height) };
  const gutter = { value: new THREE.Vector2(2 / width, 2 / height) };
  const weights = { value: new THREE.Vector2() };
  const materials = new Map();
  const view = new THREE.Vector3();
  let previousKey = -1;

  function material(source, activePart, unselectedAlpha) {
    const name = source.name.toLowerCase().split(' · ').pop();
    const finish = finishNames.indexOf(name);
    // Future unknown finishes retain the full material shader.
    if (finish < 0) return null;
    let origins = materials.get(finish);
    if (!origins) {
      origins = Array.from({ length: 4 }, () => new THREE.Vector2());
      materials.set(finish, origins);
      previousKey = -1;
    }
    const uniforms = {
      activePart,
      unselectedAlpha,
      finishes: { value: texture },
      origins: { value: origins },
      weights,
      tileScale: scale,
      gutter,
    };
    if (source.map) {
      uniforms.printMap = { value: source.map };
      uniforms.printTransform = { value: source.map.matrix.clone() };
    }
    return new THREE.ShaderMaterial({
      name: source.name,
      uniforms,
      vertexShader,
      fragmentShader,
      defines: source.map ? { CHEST_PRINT: 1 } : {},
      side: THREE.DoubleSide,
      toneMapped: false,
      polygonOffset: !!source.map,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
  }

  function update(camera, target) {
    view.subVectors(camera.position, target).normalize();
    const yaw = ((Math.atan2(view.x, view.z) / (2 * Math.PI)) * yawCount + yawCount) % yawCount;
    const pitch = THREE.MathUtils.clamp(
      1 + THREE.MathUtils.radToDeg(Math.asin(THREE.MathUtils.clamp(view.y, -1, 1))) / 55,
      0,
      2,
    );
    const y0 = Math.floor(yaw),
      y1 = (y0 + 1) % yawCount;
    const p0 = Math.floor(pitch),
      p1 = Math.min(2, p0 + 1);
    weights.value.set(yaw - y0, pitch - p0);
    const key = y0 + p0 * yawCount;
    if (key === previousKey) return;
    previousKey = key;
    const tiles = [p0 * yawCount + y0, p0 * yawCount + y1, p1 * yawCount + y0, p1 * yawCount + y1];
    for (const [finish, origins] of materials) {
      tiles.forEach((tile, i) => {
        const index = finish * viewCount + tile;
        origins[i].set((index % columns) / columns, Math.floor(index / columns) / rows);
      });
    }
  }
  return { material, update, dispose: () => texture.dispose() };
}

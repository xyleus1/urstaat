// All opaque CAD surfaces use one shader program. The source glTF supplies
// their paint color, roughness, metalness, optical coating and chest print.
const vertexShader = /* glsl */ `
  uniform mat3 printTransform;
  varying vec2 printUv;
  varying vec3 surfacePosition;
  varying vec3 surfaceNormal;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.);
    surfacePosition = world.xyz;
    // normalMatrix is the inverse transpose of modelViewMatrix. Undo the
    // viewing rotation to express the normal in the studio's world space.
    surfaceNormal = (vec4(normalMatrix * normal, 0.) * viewMatrix).xyz;
    printUv = (printTransform * vec3(uv, 1.)).xy;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragmentShader = /* glsl */ `
  // The supplied CubeUV atlas contains 64px cube faces in a 336x256 image.
  #define ENVMAP_TYPE_CUBE_UV
  #define CUBEUV_MAX_MIP 6.0
  #define CUBEUV_TEXEL_WIDTH (1.0 / 336.0)
  #define CUBEUV_TEXEL_HEIGHT (1.0 / 256.0)
  #include <cube_uv_reflection_fragment>
  uniform sampler2D studioAtlas, printMap;
  uniform vec3 paint;
  uniform float hasAtlas, metalness, roughness, coat, coatRoughness, chestPrint;
  varying vec2 printUv;
  varying vec3 surfacePosition;
  varying vec3 surfaceNormal;

  vec3 schlick(vec3 f0, float cosine) {
    float q = 1. - clamp(cosine, 0., 1.);
    return f0 + (1. - f0) * (q*q*q*q*q);
  }
  float ggx(float ndh, float alpha2) {
    float d = ndh*ndh*(alpha2 - 1.) + 1.;
    return alpha2 / max(3.141593*d*d, .000015);
  }
  vec3 lamp(vec3 n, vec3 v, vec3 l, vec3 radiance, vec3 albedo, vec3 f0,
            float ndv, float alpha2, float coatAlpha2) {
    float ndl = max(dot(n, l), 0.);
    vec3 h = normalize(l + v);
    float ndh = max(dot(n, h), 0.);
    float vdh = max(dot(v, h), 0.);
    vec3 fresnel = schlick(f0, vdh);
    // Height-correlated Smith visibility with the GGX normal distribution.
    float vis = .5 / max(ndl*sqrt(ndv*ndv*(1.-alpha2)+alpha2) +
                           ndv*sqrt(ndl*ndl*(1.-alpha2)+alpha2), .004);
    float coatF = schlick(vec3(.04), vdh).r * coat;
    vec3 diffuse = albedo * (1.-metalness) * (1.-fresnel) * .31831;
    vec3 base = diffuse + fresnel * ggx(ndh, alpha2) * vis;
    float clear = coatF * ggx(ndh, coatAlpha2) * vis;
    return radiance * ndl * (base*(1.-coatF) + clear);
  }
  vec3 reflection(vec3 dir, float blur) {
    if (hasAtlas > .5) {
      // The atlas is an sRGB texture; sampling returns linear radiance / 6.
      return 6. * textureCubeUV(studioAtlas, dir, blur).rgb;
    }
    float sky = smoothstep(-.25, .95, dir.y);
    return mix(vec3(.045,.047,.048), vec3(.65,.72,.8), sky);
  }
  void main() {
    vec3 ink = texture2D(printMap, printUv).rgb;
    // Dyna's printed lettering is gold on a white duplicate of the chest skin.
    // Let the continuous moulding show through the unprinted portion.
    if (chestPrint > .5 && ink.r - ink.b < .018) discard;
    vec3 albedo = paint * ink;
    vec3 n = normalize(surfaceNormal) * (gl_FrontFacing ? 1. : -1.);
    vec3 v = normalize(cameraPosition - surfacePosition);
    float ndv = max(dot(n, v), .002);
    float r = clamp(roughness, .11, 1.);
    float a2 = max(r*r*r*r, .00015);
    float cr = clamp(coatRoughness, .12, 1.);
    float ca2 = max(cr*cr*cr*cr, .0002);
    vec3 f0 = mix(vec3(.04), albedo, metalness);
    vec3 color = lamp(n, v, normalize(vec3(2.3,4.5,-2.5)), vec3(2.16,2.04,1.88),
                      albedo, f0, ndv, a2, ca2);
    color += lamp(n, v, normalize(vec3(1.7,.45,2.1)), vec3(.32,.38,.45),
                  albedo, f0, ndv, a2, ca2);
    color += lamp(n, v, normalize(vec3(-2.1,1.8,1.4)), vec3(2.05,2.3,2.6),
                  albedo, f0, ndv, a2, ca2);
    vec3 bounced = mix(vec3(.055,.060,.062), vec3(.23,.26,.29), .5+.5*n.y);
    color += bounced * albedo * (1.-metalness);
    vec3 reflected = reflect(-v, n);
    vec3 envF = schlick(f0, ndv);
    float coatF = coat * schlick(vec3(.04), ndv).r;
    color += .78 * reflection(reflected, r) * envF * (1.-.42*r) * (1.-coatF);
    if (coat > .001) color += .78 * reflection(reflected, cr) * coatF;
    gl_FragColor = vec4(color, 1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function applyTakuMaterials(THREE, robot, atlas) {
  const white = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
  white.colorSpace = THREE.SRGBColorSpace;
  white.needsUpdate = true;
  const textures = new Set([white]);
  const materials = new Map();

  function adapt(source) {
    if (materials.has(source)) return materials.get(source);
    const map = source.map || white;
    if (map.matrixAutoUpdate) map.updateMatrix();
    textures.add(map);
    const replacement = new THREE.ShaderMaterial({
      name: source.name,
      vertexShader, fragmentShader,
      side: THREE.DoubleSide,
      polygonOffset: !!source.map, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
      uniforms: {
        studioAtlas: { value: atlas || white },
        hasAtlas: { value: atlas ? 1 : 0 },
        printMap: { value: map },
        chestPrint: { value: source.map ? 1 : 0 },
        printTransform: { value: map.matrix.clone() },
        paint: { value: source.color?.clone() || new THREE.Color(1, 1, 1) },
        roughness: { value: source.roughness ?? .45 },
        metalness: { value: source.metalness ?? 0 },
        coat: { value: source.clearcoat ?? 0 },
        coatRoughness: { value: source.clearcoatRoughness ?? .28 },
      },
    });
    materials.set(source, replacement);
    return replacement;
  }
  robot.traverse(node => {
    if (node.isMesh) {
      node.material = Array.isArray(node.material) ? node.material.map(adapt) : adapt(node.material);
    }
  });
  for (const source of materials.keys()) source.dispose();
  // releaseRobot owns the shader materials. The caller owns the studio atlas.
  return () => { for (const texture of textures) texture.dispose(); };
}

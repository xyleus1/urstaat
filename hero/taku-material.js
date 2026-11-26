import finishes from './taku-finishes.json';
// The studio uses the CAD paint and chest artwork, with finish overrides
// shared with the baked material captures used by the software renderer.
const vertexShader = /* glsl */ `
  uniform mat3 printTransform;
  attribute float partTag;
  uniform float activePart;
  varying float surfaceCode;
  varying float partMask;
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
    surfaceCode = partTag;
    partMask = 1. - step(.5, abs(partTag - activePart));
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragmentShader = /* glsl */ `
  layout(location=1) out highp vec4 partData;
  varying float surfaceCode;
  varying float partMask;
  uniform sampler2D printMap;
  uniform vec3 paint;
  uniform float metalness, roughness, coat, coatRoughness, chestPrint;
  varying vec2 printUv;
  varying vec3 surfacePosition;
  varying vec3 surfaceNormal;

  // The same rectangular softboxes and display curve as the exploded studies.
  float softbox(vec3 r, vec3 center, vec2 extents, float rough) {
    vec3 c=normalize(center), x=normalize(cross(c,vec3(0,0,1))), y=cross(x,c);
    float facing=dot(r,c);
    if(facing<=0.)return 0.;
    vec2 q=abs(vec2(dot(r,x),dot(r,y)))/facing-extents;
    return 1.-smoothstep(-.08-rough*.65,.08+rough*.8,max(q.x,q.y));
  }
  float strips(vec3 reflected,float rough){
    return .044+.09*(.5+.5*reflected.z)
      +2.05*softbox(reflected,vec3(-.28,-.70,.89),vec2(.73,.29),rough)
      +1.56*softbox(reflected,vec3(.87,.46,.41),vec2(.195,.81),rough)
      +1.12*softbox(reflected,vec3(-.90,.31,-.16),vec2(.16,.61),rough*.72);
  }
  void main() {
    vec3 ink = texture2D(printMap, printUv).rgb;
    // Dyna's printed lettering is gold on a white duplicate of the chest skin.
    // Let the continuous moulding show through the unprinted portion.
    if (chestPrint > .5 && ink.r - ink.b < .018) discard;
    vec3 albedo = paint * ink;
    vec3 n = normalize(surfaceNormal) * (gl_FrontFacing ? 1. : -1.);
    vec3 v = normalize(cameraPosition - surfacePosition);
    // The cutaway studio is Z-up. Map Taku's forward (+X) into its lit front quarter.
    n=vec3(n.z,-n.x,n.y); v=vec3(v.z,-v.x,v.y);
    if(dot(n,v)<0.)n=-n;
    vec3 r=reflect(-v,n);
    float key=max(0.,dot(n,normalize(vec3(-.62,-.5,.76))));
    float fill=max(0.,dot(n,normalize(vec3(.9,.2,.3))));
    float sky=.062+.16*(n.z*.5+.5)+.04*max(0.,-n.x);
    float rim=pow(1.-max(dot(n,v),0.),3.);
    vec3 diffuse=albedo*(sky+1.08*key*vec3(1.025,1.,.965)+.16*fill*vec3(.95,1.,1.07))*(1.-.78*metalness);
    vec3 spec=mix(vec3(.045),albedo,metalness);
    vec3 radiance=diffuse+spec*strips(r,roughness)*(.92-.35*roughness)+.046*rim;
    if(coat>.001)radiance+=coat*(.027+.12*rim)*strips(r,coatRoughness);
    // Retain the dark optical glass and graphite under the broad studio strips.
    radiance*=mix(vec3(.53),vec3(1.),smoothstep(vec3(0.),vec3(.13),radiance));
    gl_FragColor=vec4(pow(1.24*radiance/(radiance+.72),vec3(1./2.2)),1.);
    partData=vec4(surfaceCode*8./255.,mod(surfaceCode*47.,251.)/255.,step(.5,surfaceCode),partMask);
  }
`;

export function applyTakuMaterials(THREE, robot, activePart = { value: -1 }, softwareStudio) {
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
    const captured = softwareStudio?.material(source, activePart);
    if (captured) {
      materials.set(source, captured);
      return captured;
    }
    const name = source.name
      .toLowerCase()
      .split(/\s+\u00b7\s+/)
      .pop();
    const finish = finishes[name] || {};
    const replacement = new THREE.ShaderMaterial({
      name: source.name,
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
      toneMapped: false,
      polygonOffset: !!source.map,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
      uniforms: {
        activePart,
        printMap: { value: map },
        chestPrint: { value: source.map ? 1 : 0 },
        printTransform: { value: map.matrix.clone() },
        paint: {
          value: (source.color?.clone() || new THREE.Color(1, 1, 1)).multiplyScalar(finish.tint ?? 1),
        },
        roughness: { value: finish.roughness ?? source.roughness ?? 0.45 },
        metalness: { value: finish.metalness ?? source.metalness ?? 0 },
        coat: { value: source.clearcoat ?? 0 },
        coatRoughness: { value: source.clearcoatRoughness ?? 0.28 },
      },
    });
    materials.set(source, replacement);
    return replacement;
  }
  robot.traverse((node) => {
    if (node.isMesh) {
      node.material = Array.isArray(node.material) ? node.material.map(adapt) : adapt(node.material);
    }
  });
  for (const source of materials.keys()) source.dispose();
  // releaseRobot owns the shader materials.
  return () => {
    for (const texture of textures) texture.dispose();
  };
}

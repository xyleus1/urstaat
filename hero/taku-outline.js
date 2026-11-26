// The studio writes color and CAD identity in the same depth-tested draw.
// The composite traces visible part edges; the label readback anchors callouts.
export const parts = ['overview', 'side', 'face', 'shoulder', 'elbow', 'wrist', 'claw', 'waist', 'base'];
export function surfaceLabel(code) {
  return { id: parts[(code - 1) % parts.length], side: code > parts.length ? 'right' : 'left' };
}
export const bilateral = new Set(['shoulder', 'elbow', 'wrist', 'claw']);
export function partCode(id, side) {
  return parts.indexOf(id) + 1 + (bilateral.has(id) && side === 'right' ? 9 : 0);
}

export function identifySurface(node) {
  if (node.userData.takuPart) {
    const { id, side } = node.userData.takuPart;
    return { id, side, code: partCode(id, side), source: node.name };
  }
  let name = '';
  for (let parent = node; parent; parent = parent.parent) {
    const candidate = parent.name.toLowerCase();
    if (/link_surface|optical_cover|link_logo/.test(candidate)) {
      name = candidate;
      break;
    }
  }
  if (!name) return null;
  const side = name.includes('right') ? 'right' : 'left';
  let id, exact;
  if (name.startsWith('torso_body')) {
    id = 'overview';
    exact = /_surface_[34]$|_logo$/.test(name);
  } else if (name.startsWith('folding_lower')) {
    id = 'side';
    exact = true;
  } else if (/^folding_to_waist|^torso_waist/.test(name)) {
    id = 'waist';
    exact = /^folding_to_waist_link_surface_[23]$/.test(name);
  } else if (name.startsWith('head_')) {
    id = 'face';
    exact = /optical_cover|head_roll_link_surface_3/.test(name);
  } else if (name.startsWith('agv')) {
    id = 'base';
    exact = /^agv_left_front_(wheel|steering)_link_surface/.test(name);
  } else if (name.includes('gripper')) {
    id = 'claw';
    exact = true;
  } else if (name.includes('wrist')) {
    id = 'wrist';
    exact = name.includes('wrist_pitch_link_surface_1');
  } else if (name.includes('elbow')) {
    id = 'elbow';
    exact = /joint cap/i.test(node.material.name);
  } else if (name.includes('shoulder')) {
    id = 'shoulder';
    exact = /shoulder_pitch_link_surface_[23]/.test(name);
  }
  if (!id) return null;
  return { id, side, code: exact ? partCode(id, side) : 0, source: name };
}

const vertexShader = /* glsl */ `
  varying vec2 frameUv;
  void main() {
    frameUv = .5 + .5*position.xy;
    gl_Position = vec4(position.xy,0.,1.);
  }
`;
const fragmentShader = /* glsl */ `
  uniform sampler2D studioFrame;
  uniform vec2 pixel;
  uniform vec4 region, robotRegion;
  varying vec2 frameUv;
  uniform sampler2D surfaces;
  float maskAt(vec2 d) {
    return texture2D(surfaces,frameUv+pixel*d).a;
  }
  #ifdef SOFTWARE_AA
    uniform vec2 texel;

    const vec3 luma = vec3(.299,.587,.114);
    vec3 antialiasStudio(vec4 frame) {
      if (any(lessThan(frameUv,robotRegion.xy)) || any(greaterThan(frameUv,robotRegion.zw))) return frame.rgb;
      vec4 nw = texture2D(studioFrame,frameUv+texel*vec2(-1,-1));
      vec4 ne = texture2D(studioFrame,frameUv+texel*vec2(1,-1));
      vec4 sw = texture2D(studioFrame,frameUv+texel*vec2(-1,1));
      vec4 se = texture2D(studioFrame,frameUv+texel*vec2(1,1));
      if (max(frame.a,max(max(nw.a,ne.a),max(sw.a,se.a)))==0.) return frame.rgb;
      float n = dot(nw.rgb,luma), e = dot(ne.rgb,luma), s = dot(sw.rgb,luma), w = dot(se.rgb,luma);
      float center = dot(frame.rgb,luma);
      float lo = min(center,min(min(n,e),min(s,w)));
      float hi = max(center,max(max(n,e),max(s,w)));
      if (hi-lo < max(.045,.13*hi)) return frame.rgb;
      vec2 direction = vec2((s+w)-(n+e),(n+s)-(e+w));
      float bias = max((n+e+s+w)*.03125,.0078125);
      direction *= 1./(min(abs(direction.x),abs(direction.y))+bias);
      direction = clamp(direction,vec2(-4.),vec2(4.))*texel;
      vec3 middle = .5*(texture2D(studioFrame,frameUv-direction/6.).rgb+
                         texture2D(studioFrame,frameUv+direction/6.).rgb);
      vec3 wide = .5*middle+.25*(texture2D(studioFrame,frameUv-direction*.5).rgb+
                                 texture2D(studioFrame,frameUv+direction*.5).rgb);
      float result = dot(wide,luma);
      return result<lo || result>hi ? middle : wide;
    }
  #endif
  void main() {
    vec4 frame = texture2D(studioFrame,frameUv);
    float coverage = frame.a;
    #ifdef SOFTWARE_AA
      vec3 ink = antialiasStudio(frame);
    #else
      vec3 ink = frame.rgb;
    #endif
    if (all(greaterThanEqual(frameUv,region.xy)) && all(lessThanEqual(frameUv,region.zw))) {
      float c = maskAt(vec2(0));
      // The inner hairline stays on the visible solid. The second, separated
      // stroke follows its outside contour. No invisible mesh edges are traced.
      float interior = 0., outer = 0., gap = 0.;
      if (c > 0.) {
        float n = min(min(maskAt(vec2(-.95,0)),maskAt(vec2(.95,0))),
                      min(maskAt(vec2(0,-.95)),maskAt(vec2(0,.95))));
        interior = clamp(c-n,0.,1.);
      }
      if (c < 1.) {
        float m = max(max(maskAt(vec2(-1.15,0)),maskAt(vec2(1.15,0))),
                      max(maskAt(vec2(0,-1.15)),maskAt(vec2(0,1.15))));
        gap = clamp(m-c,0.,1.);
        if (m < 1.) {
          float w = max(max(maskAt(vec2(-2.84,0)),maskAt(vec2(2.84,0))),
                        max(maskAt(vec2(0,-2.84)),maskAt(vec2(0,2.84))));
          w = max(w,max(max(maskAt(vec2(-2.02,2.02)),maskAt(vec2(2.02,-2.02))),
                        max(maskAt(vec2(2.02,2.02)),maskAt(vec2(-2.02,-2.02)))));
          outer = clamp(w-m,0.,1.)*(1.-c);
        }
      }
      float light = dot(ink,vec3(.21,.72,.07));
      vec3 innerInk = mix(vec3(1.,.77,.49),vec3(.49,.20,.085),smoothstep(.48,.80,light));
      ink = mix(ink,vec3(.105,.115,.12),gap*.48);
      ink = mix(ink,mix(vec3(.89,.53,.31),vec3(.62,.30,.15),light),outer*.90);
      ink = mix(ink,innerInk,interior);
      coverage=max(coverage,max(gap*.48,outer*.90));
    }
    vec4 label = texture2D(surfaces, frameUv);
    if (all(greaterThanEqual(frameUv,robotRegion.xy)) && all(lessThanEqual(frameUv,robotRegion.zw)) &&
        label.b > .45 && label.a < .5) {
      // The ID changes across adjacent inspectable components, even when their surfaces touch.
      float edge = 0.;
      for (int i=0; i<4; i++) {
        vec2 d = i == 0 ? vec2(1.,0.) : i == 1 ? vec2(-1.,0.) : i == 2 ? vec2(0.,1.) : vec2(0.,-1.);
        vec4 other = texture2D(surfaces, frameUv + pixel*d);
        edge = max(edge, max(abs(label.b-other.b), min(1., 32.*abs(label.r-other.r))));
      }
      float light = dot(ink,vec3(.21,.72,.07));
      ink = mix(ink, mix(vec3(.88,.74,.59),vec3(.33,.26,.20),smoothstep(.38,.77,light)),edge*.72);
    }
    gl_FragColor = vec4(ink,coverage);
  }
`;

export function createTakuOutline(THREE, renderer, softwareAA = false) {
  const target = new THREE.WebGLRenderTarget(1, 1, {
    count: 2,
    samples: softwareAA ? 0 : Math.min(4, renderer.capabilities.maxSamples),
    // Geometry needs depth testing; the composite only reads resolved RGBA.
    resolveDepthBuffer: false,
    depthBuffer: true,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    generateMipmaps: false,
  });
  target.texture.name = 'Taku studio color';
  const surfaces = target.textures[1];
  surfaces.name = 'Visible CAD surface IDs and selected coverage';
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    defines: softwareAA ? { SOFTWARE_AA: 1 } : {},
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
    blending: THREE.NoBlending,
    uniforms: {
      studioFrame: { value: target.texture },
      surfaces: { value: surfaces },
      pixel: { value: new THREE.Vector2() },
      region: { value: new THREE.Vector4() },
      texel: { value: new THREE.Vector2() },
      robotRegion: { value: new THREE.Vector4() },
    },
  });
  const screen = new THREE.Scene(),
    screenCamera = new THREE.Camera();
  const triangle = new THREE.Mesh(geometry, material);
  triangle.frustumCulled = false;
  screen.add(triangle);
  const size = new THREE.Vector2(),
    v = new THREE.Vector3();
  // Downsample the already depth-tested labels. One asynchronous read serves every
  // annotation, without raycasting the complete CAD once per marker per frame.
  const sampleTarget = new THREE.WebGLRenderTarget(1, 1, { depthBuffer: false });
  const sampleMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader: `
      uniform sampler2D labels;
      varying vec2 frameUv;
      void main() {
        ivec2 size = textureSize(labels, 0);
        gl_FragColor = texelFetch(labels, clamp(ivec2(frameUv*vec2(size)),ivec2(0),size-1),0);
      }`,
    uniforms: { labels: { value: surfaces } },
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
    blending: THREE.NoBlending,
  });
  let pendingRead,
    freshRequest,
    closed = false;
  let lastAnchors = [],
    lastStudy;
  function readAnchors(centers, notify) {
    freshRequest = { centers, notify };
    if (pendingRead) return pendingRead;
    pendingRead = (async () => {
      while (freshRequest && !closed) {
        const request = freshRequest;
        freshRequest = null;
        const scale = Math.min(1, 220 / Math.max(target.width, target.height));
        const w = Math.max(1, Math.round(target.width * scale));
        const h = Math.max(1, Math.round(target.height * scale));
        sampleTarget.setSize(w, h);
        renderer.setRenderTarget(sampleTarget);
        triangle.material = sampleMaterial;
        renderer.render(screen, screenCamera);
        triangle.material = material;
        renderer.setRenderTarget(null);
        const pixels = new Uint8Array(w * h * 4);
        await renderer.readRenderTargetPixelsAsync(sampleTarget, 0, 0, w, h, pixels);
        if (closed) return [];
        lastStudy = { pixels, w, h };
        const nearest = new Map();
        for (let k = 0; k < pixels.length; k += 4) {
          if (pixels[k + 2] < 250) continue;
          const code = Math.round(pixels[k] / 8),
            center = request.centers.get(code);
          // Reject mixed samples along MSAA boundaries. The second channel checks identity.
          if (!center || pixels[k] !== 8 * code || pixels[k + 1] !== (code * 47) % 251) continue;
          const x = (((k / 4) % w) + 0.5) / w,
            y = 1 - (Math.floor(k / 4 / w) + 0.5) / h;
          const distance = ((x - center.x) * w) ** 2 + ((y - center.y) * h) ** 2;
          const previous = nearest.get(code);
          if (!previous || distance < previous.distance) nearest.set(code, { x, y, distance });
        }
        lastAnchors = Array.from(nearest, ([code, { x, y }]) => ({ ...surfaceLabel(code), x, y }));
        request.notify(lastAnchors);
      }
      return lastAnchors;
    })().finally(() => {
      pendingRead = null;
    });
    return pendingRead;
  }
  function projectBox(box, camera, region, p) {
    region.set(1, 1, 0, 0);
    if (box && !box.isEmpty()) {
      for (let i = 0; i < 8; i++) {
        v.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z);
        v.project(camera).multiplyScalar(0.5).addScalar(0.5);
        if (v.z < 0 || v.z > 1) {
          region.set(0, 0, 1, 1);
          break;
        }
        region.x = Math.min(region.x, v.x);
        region.y = Math.min(region.y, v.y);
        region.z = Math.max(region.z, v.x);
        region.w = Math.max(region.w, v.y);
      }
      region.x -= 4 * p.x;
      region.y -= 4 * p.y;
      region.z += 4 * p.x;
      region.w += 4 * p.y;
    }
  }
  function render(scene, camera, box, robotBox) {
    renderer.getDrawingBufferSize(size);
    if (target.width !== size.x || target.height !== size.y) target.setSize(size.x, size.y);
    const { pixel, region, texel, robotRegion } = material.uniforms;
    pixel.value.set(renderer.getPixelRatio() / size.x, renderer.getPixelRatio() / size.y);
    projectBox(box, camera, region.value, pixel.value);
    texel.value.set(1 / size.x, 1 / size.y);
    projectBox(robotBox, camera, robotRegion.value, texel.value);
    renderer.setRenderTarget(target);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(screen, screenCamera);
  }
  return {
    render,
    readAnchors,
    anchorsReady: () => pendingRead || Promise.resolve(lastAnchors),
    async readStudyMask() {
      await pendingRead;
      if (!lastStudy) return { width: 0, height: 0, labels: new Uint8Array() };
      const { pixels, w, h } = lastStudy,
        labels = new Uint8Array(w * h);
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          const k = ((h - y - 1) * w + x) * 4,
            code = Math.round(pixels[k] / 8);
          if (pixels[k + 2] >= 250 && pixels[k] === code * 8 && pixels[k + 1] === (code * 47) % 251)
            labels[y * w + x] = code;
        }
      return { width: w, height: h, labels };
    },
    dispose() {
      closed = true;
      freshRequest = null;
      if (pendingRead) pendingRead.finally(() => sampleTarget.dispose()).catch(() => {});
      else sampleTarget.dispose();
      sampleMaterial.dispose();
      target.dispose();
      geometry.dispose();
      material.dispose();
    },
  };
}

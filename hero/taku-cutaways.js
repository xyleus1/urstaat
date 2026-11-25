// WebGL and Canvas 2D share the same camera, assemblies and interactive controls.
const assetBase = new URL('../research/part-2/cutaways/', import.meta.url);
const cad = 'https://github.com/SakethGG/Mini-Cheetah-Actuator/tree/b328c3cb0a57462f9913feda79b7f9047c63cd43';
const studies = {
  actuator: {
    title: 'Rotary actuator',
    closed: [-14, -4, -4, 7, 7, 15],
    opened: [-111, -68, -19, 34, 75, 116],
    summary: 'The electric motor turns the sun gear. Three planets transfer torque to the output carrier.',
    radii: [
      [47, 47, 8],
      [41, 41, 6],
      [44, 44, 10],
      [26, 26, 10],
      [35, 35, 4],
      [22, 22, 12],
    ],
    parts: [
      ['Rear housing', 'The casting supports the motor and provides a mounting face for the joint.'],
      [
        'Stator & windings',
        'Copper windings surround the stationary teeth. Current in the windings creates a rotating magnetic field.',
      ],
      [
        'Motor rotor',
        'Magnet segments line the outer rotor. It turns around the stator and drives the central sun gear.',
      ],
      ['Sun & planet gears', 'The central sun drives three planet gears spaced around it.'],
      ['Internal ring gear', 'In this example the planets mesh with a fixed, internally toothed ring.'],
      [
        'Output carrier',
        'Two plates and three pins support the planet gears and carry their reduced-speed motion to the output.',
      ],
    ],
    caption:
      'Dyna documents low-ratio planetary arm actuators. This example uses Mini-Cheetah replica CAD by Saketh vegesna, with illustrative windings and magnets.',
    links: [
      ['Dyna’s hardware', 'https://www.dyna.co/dyna-2.1'],
      ['Replica CAD', cad],
      ['MIT license', new URL('./assets/LICENSE-MiniCheetah.txt', import.meta.url).href],
    ],
  },
  wrist: {
    title: 'Wrist bearing cartridge',
    closed: [-6, 0, 0, 0, 6, 9],
    opened: [-62, -37, -11, 14, 39, 64],
    summary: 'Alternating roller axes allow one compact bearing to carry radial, axial and moment loads.',
    radii: [
      [37, 37, 7],
      [24, 24, 4],
      [27, 27, 4],
      [33, 33, 5],
      [32, 32, 5],
      [28, 28, 9],
    ],
    parts: [
      ['Mounting body', 'The base locates the bearing and connects its fixed side to the wrist housing.'],
      ['Inner race', 'A ground V-shaped track guides one side of each cylindrical roller.'],
      [
        'Crossed rollers',
        'Adjacent rollers alternate their axes by 90°. Small separators maintain their spacing.',
      ],
      [
        'Outer race & seal',
        'A second V-shaped track closes around the rollers. A seal protects the running surfaces.',
      ],
      [
        'Tool flange',
        'The output face centers a tool on a raised pilot. Its six through-holes form the mounting pattern.',
      ],
      [
        'Socket screws',
        'Six threaded screws secure the mating tool plate. Their recessed hex sockets accept a driver.',
      ],
    ],
    caption:
      'Illustrative wrist assembly. The crossed-roller arrangement follows a published bearing principle. Dyna has not identified Taku’s wrist-bearing design.',
    links: [
      ['Crossed-roller principle', 'https://www.thk.com/us/en/products/cross_roller_ring/cross_roller_ring/'],
    ],
  },
  panel: {
    title: 'Formed enclosure panel',
    closed: [-4, -3, 0, 3, 5],
    opened: [-52, -29, -7, 19, 48],
    summary: 'The cover, gasket and inserts meet on the same four-hole pattern.',
    radii: [
      [42, 28, 2],
      [38, 26, 3],
      [41, 27, 1],
      [44, 30, 7],
      [38, 24, 7],
    ],
    parts: [
      [
        'Mounting frame',
        'The open frame supports the cover and locates four fasteners around its perimeter.',
      ],
      [
        'Threaded inserts',
        'Four flanged inserts provide reusable threads in the frame. Their knurling resists rotation.',
      ],
      [
        'Perimeter gasket',
        'A thin, continuous gasket follows the cover perimeter; holes register it on the screw pattern.',
      ],
      [
        'Formed cover',
        'The constant-thickness aluminum sheet turns through four radiused bends. Three pressed louvers rise above pierced openings.',
      ],
      [
        'Cover screws',
        'The four socket screws pass through the formed cover and gasket into the captive inserts.',
      ],
    ],
    caption:
      'An original sheet-metal example shows how a service cover can be formed, sealed and fastened. Taku’s enclosure material and forming process are unconfirmed.',
    links: [],
  },
};
// Linear reflectance, metalness and roughness. The key and broad strip reflections are shared by all studies.
const finishes = [
  [0.49, 0.515, 0.52, 0.25, 0.36],
  [0.185, 0.216, 0.23, 0.92, 0.27],
  [0.52, 0.57, 0.59, 0.92, 0.22],
  [0.032, 0.039, 0.041, 0.48, 0.35],
  [0.69, 0.205, 0.057, 0.87, 0.25],
  [0.32, 0.35, 0.36, 0.94, 0.17],
  [0.018, 0.026, 0.026, 0.04, 0.66],
  [0.55, 0.32, 0.1, 0.79, 0.3],
];
const vertex = `#version 300 es
precision highp float;
layout(location=0) in vec3 aPosition;
layout(location=1) in vec2 aOct;
uniform vec3 uRight,uUp,uEye;
uniform vec2 uScale,uCenter;
uniform float uOffset;
out vec3 vN,vP;
void main(){
 vec3 n=vec3(aOct,1.-abs(aOct.x)-abs(aOct.y));
 if(n.z<0.) n.xy=(1.-abs(n.yx))*mix(vec2(-1.),vec2(1.),step(vec2(0.),n.xy));
 vN=normalize(n);
 vec3 p=aPosition/160.+vec3(0,0,uOffset);
 vP=p;
 gl_Position=vec4((vec2(dot(p,uRight),dot(p,uUp))-uCenter)*uScale,-dot(p,uEye)/250.,1.);
}`;
const fragment = `#version 300 es
precision highp float;
in vec3 vN,vP; out vec4 outColor;
uniform vec3 uEye,uColor;
uniform vec2 uFinish;
uniform float uPick,uEmphasis;
uniform sampler2D uShadow;
uniform vec3 uLight,uLightRight,uLightUp;
float boxlight(vec3 R, vec3 center,float high,float low,float rough){
 vec3 C=normalize(center), X=normalize(cross(C,vec3(0,0,1))),Y=cross(X,C);
 float f=dot(R,C); if(f<0.) return 0.;
 vec2 q=abs(vec2(dot(R,X),dot(R,Y)))/max(f,.001);
 vec2 edge=vec2(high,low);
 return (1.-smoothstep(-.08-rough*.65,.08+rough*.8,max(q.x-edge.x,q.y-edge.y)));
}
void main(){
 if(uPick>0.) {outColor=vec4(uPick/255.,0.,0.,1.);return;}
 vec3 N=normalize(vN); if(dot(N,uEye)<0.) N=-N;
 vec3 R=reflect(-uEye,N); float metal=uFinish.x, rough=uFinish.y;
 vec3 L=uLight; float key=max(0.,dot(N,L));
 vec2 uv=.5+vec2(dot(vP,uLightRight),dot(vP,uLightUp))/320.;
 float depth=.5-dot(vP,L)/500.-.00055;
 vec2 plane=vec2(dot(N,uLightRight),dot(N,uLightUp))*.64/max(.15,dot(N,L));
 float shadow=0.;
 for(int i=0;i<12;i++) {
  float angle=float(i)*2.39996; vec2 d=vec2(cos(angle),sin(angle))*sqrt(float(i)+.5)*.00085;
  shadow+=step(depth+clamp(dot(plane,d),-.004,.004),texture(uShadow,uv+d).r)/12.;
 }
 float env=.046+.13*(N.z*.5+.5)+.04*max(0.,-N.x);
 float rim=pow(1.-max(dot(N,uEye),0.),3.);
 vec3 diffuse=uColor*(env+.95*key*shadow*vec3(1.025,1.0,.965)+.16*max(0.,dot(N,normalize(vec3(.9,.2,.3))))*vec3(.95,1.,1.07))*(1.-.78*metal);
 vec3 spec=mix(vec3(.055),uColor,metal);
 float reflected=.044+.09*(R.z*.5+.5)+2.05*boxlight(R,vec3(-.28,-.7,.89),.73,.29,rough)
  +1.56*boxlight(R,vec3(.87,.46,.41),.195,.81,rough)+.59*boxlight(R,vec3(-.9,.31,-.16),.55,.24,rough);
 float grain=metal*metal*.023*sin(length(vP.xy)*14.)*(1.-smoothstep(.06,.6,fwidth(length(vP.xy))));
 vec3 linear=(diffuse+spec*reflected*(.92-.35*rough)*mix(.42,1.,shadow)+.054*rim)*(1.+grain)*uEmphasis;
 linear=linear/(linear+.72)*1.24;
 outColor=vec4(pow(linear,vec3(1./2.2)),1.);
}`;
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const mix = (a, b, f) => a + (b - a) * f;
const normalize = (v) => {
  const l = Math.hypot(...v);
  return v.map((x) => x / l);
};
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const light = normalize([-0.62, -0.5, 0.76]),
  lightRight = normalize(cross([0, 0, 1], light)),
  lightUp = cross(light, lightRight);
function makeProgram(gl, depthOnly = false) {
  const p = gl.createProgram(),
    stages = [];
  const fs = depthOnly ? '#version 300 es\nprecision highp float;void main(){}' : fragment;
  for (const [type, source] of [
    [gl.VERTEX_SHADER, vertex],
    [gl.FRAGMENT_SHADER, fs],
  ]) {
    const shader = gl.createShader(type);
    stages.push(shader);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(shader));
    gl.attachShader(p, shader);
  }
  gl.linkProgram(p);
  for (const s of stages) gl.deleteShader(s);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(p));
  const names = [
    'Right',
    'Up',
    'Eye',
    'Center',
    'Scale',
    'Offset',
    'Pick',
    'Emphasis',
    'Color',
    'Finish',
    'Light',
    'LightRight',
    'LightUp',
    'Shadow',
  ];
  return {
    program: p,
    uniform: Object.fromEntries(names.map((k) => [k, gl.getUniformLocation(p, 'u' + k)])),
  };
}
async function unpack(id, signal) {
  const response = await fetch(new URL(id + '.bin.gz', assetBase), { signal });
  if (!response.ok) throw Error('Mesh unavailable');
  let raw = await response.arrayBuffer();
  if (new Uint8Array(raw)[0] === 31)
    raw = await new Response(
      new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip')),
    ).arrayBuffer();
  const len = new DataView(raw).getUint32(0, true),
    info = JSON.parse(new TextDecoder().decode(new Uint8Array(raw, 4, len)));
  const at = Math.ceil((4 + len) / 4) * 4;
  const indices = new Uint32Array(raw, at + info.vertices * 8, info.indices),
    positions = new Int16Array(raw, at, info.vertices * 4),
    anchors = [];
  for (const [group, , first, count] of info.draws) {
    anchors[group] ??= [];
    for (let k = first; k < first + count; k += Math.max(1, Math.floor(count / 120))) {
      const p = indices[k] * 4;
      anchors[group].push([positions[p] / 160, positions[p + 1] / 160, positions[p + 2] / 160]);
    }
  }
  return { draws: info.draws, anchors, vertices: new Uint8Array(raw, at, info.vertices * 8), indices };
}
function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text) node.textContent = text;
  return node;
}
function button(label, cls) {
  const b = el('button', cls, label);
  b.type = 'button';
  return b;
}

const supplySteps = {
  actuator: {
    0: ['motor', 'Trace the motor assembly'],
    1: ['wire', 'Trace winding wire'],
    2: ['magnet', 'Trace rotor magnets'],
    3: ['planetary', 'Trace planetary gearing'],
    4: ['planetary', 'Trace planetary gearing'],
    5: ['planetary', 'Trace the planetary assembly'],
  },
  wrist: {
    0: ['bearing', 'Trace the bearing cartridge'],
    1: ['race', 'Trace bearing races'],
    2: ['rollers', 'Trace bearing rollers'],
    3: ['race', 'Trace the outer race'],
    4: ['sealed-joint', 'Trace the assembled joint'],
    5: ['sealed-joint', 'Trace the assembled joint'],
  },
  panel: {
    0: ['panel', 'Trace the enclosure assembly'],
    1: ['panel', 'Trace the enclosure assembly'],
    2: ['panel', 'Trace the enclosure assembly'],
    3: ['al-sheet', 'Trace rolled aluminium sheet'],
    4: ['panel', 'Trace the enclosure assembly'],
  },
};

export function mountTakuCutaway(host, { part = 'actuator', allow3D = true, onTrace } = {}) {
  const events = new AbortController(),
    listen = (target, key, fn, opts = {}) =>
      target.addEventListener(key, fn, { ...opts, signal: events.signal });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const wrapper = el('div', 'cutaway-study'),
    stage = el('div', 'cutaway-scene'),
    poster = el('img', 'cutaway-poster');
  let canvas = el('canvas', 'cutaway-canvas');
  const controls = el('div', 'cutaway-controls'),
    reset = button('Reset view', 'cutaway-reset');
  const spin = button('Pause spin', 'cutaway-spin'),
    explode = button('Assemble', 'cutaway-explode');
  spin.setAttribute('aria-label', 'Auto-spin');
  const sliderLabel = el('label', 'cutaway-slider-label'),
    slider = el('input', 'cutaway-slider'),
    percent = el('output', 'cutaway-value');
  const zoomIn = button('+', 'cutaway-zoom'),
    zoomOut = button('−', 'cutaway-zoom'),
    cameraTools = el('div', 'cutaway-camera-tools');
  zoomIn.setAttribute('aria-label', 'Zoom in');
  zoomOut.setAttribute('aria-label', 'Zoom out');
  slider.type = 'range';
  slider.min = '0';
  slider.max = '100';
  slider.step = '1';
  slider.setAttribute('aria-label', 'Exploded spacing');
  sliderLabel.append(el('span', '', 'Spacing'), slider, percent);
  const switches = el('div', 'cutaway-switches');
  switches.append(explode, spin, reset);
  controls.append(sliderLabel, switches);
  const body = el('div', 'cutaway-key'),
    items = el('div', 'cutaway-parts'),
    desc = el('p', 'cutaway-detail'),
    caption = el('p', 'cutaway-caption');
  const hint = el('span', 'cutaway-hint', 'Drag to rotate · Select a part');
  const tag = el('span', 'cutaway-tag'),
    wire = el('span', 'cutaway-wire');
  tag.hidden = wire.hidden = true;
  tag.setAttribute('aria-hidden', 'true');
  wire.setAttribute('aria-hidden', 'true');
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'img');
  desc.setAttribute('aria-live', 'polite');
  items.setAttribute('role', 'group');
  items.setAttribute('aria-label', 'Assembly parts');
  cameraTools.append(zoomOut, zoomIn);
  stage.append(poster, canvas, wire, tag, hint, cameraTools);
  const traceStep = button('', 'cutaway-trace');
  traceStep.hidden = true;
  listen(traceStep, 'click', () => {
    const target = supplySteps[id]?.[selected];
    if (target) onTrace?.(target[0]);
  });
  body.append(items, desc, traceStep, caption);
  wrapper.append(stage, controls, body);
  host.replaceChildren(wrapper);
  let gl,
    prog,
    loc,
    shadowProgram,
    shadowMap,
    shadowBuffer,
    shadowKey,
    vao,
    vbo,
    ibo,
    mesh,
    request = 0,
    loader,
    dead = false,
    selected = -1,
    id,
    study,
    amount = 0.86,
    raster,
    spinEnabled = !reduced.matches,
    lastTime = 0,
    tween = null,
    onscreen = true;
  let yaw = -0.98,
    pitch = 0.56,
    zoom = 1,
    roll = 1.14,
    buttons = [],
    moved = false,
    start = null,
    pinch = null;
  const pointers = new Map();
  function mode(m) {
    host.dataset.cutawayMode = m;
    wrapper.dataset.mode = m;
    const live = m === 'live';
    canvas.tabIndex = live ? 0 : -1;
    canvas.hidden = !live;
    poster.hidden = live;
    slider.disabled = spin.disabled = explode.disabled = !live;
    reset.disabled = !live;
    zoomIn.disabled = zoomOut.disabled = !live;
    hint.hidden = !live;
    cameraTools.hidden = !live;
    if (!live) tag.hidden = wire.hidden = true;
  }
  function resize() {
    const width = stage.clientWidth,
      height = stage.clientHeight;
    if (!width || !height) return;
    const dpr = gl
      ? Math.min(window.devicePixelRatio || 1, 1.65)
      : Math.min(window.devicePixelRatio || 1, 720 / width, 440 / height);
    const w = Math.round(width * dpr),
      h = Math.round(height * dpr);
    if (!raster && (canvas.width !== w || canvas.height !== h)) {
      canvas.width = w;
      canvas.height = h;
    }
    invalidate();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(stage);
  const visibility = new IntersectionObserver(([entry]) => {
    onscreen = entry.isIntersecting;
    lastTime = 0;
    if (onscreen) invalidate();
  });
  visibility.observe(stage);
  listen(document, 'visibilitychange', () => {
    lastTime = 0;
    if (!document.hidden) invalidate();
  });
  listen(reduced, 'change', () => {
    if (reduced.matches) setSpin(false);
  });
  function setSpin(value) {
    spinEnabled = Boolean(value);
    lastTime = 0;
    spin.setAttribute('aria-pressed', String(spinEnabled));
    spin.textContent = spinEnabled ? 'Pause spin' : 'Spin';
    wrapper.dataset.spinning = String(spinEnabled);
    invalidate();
  }
  function invalidate() {
    if (!dead && !request && !document.hidden && onscreen)
      request = requestAnimationFrame((time) => {
        request = 0;
        if (!mesh) return;
        if (spinEnabled && lastTime) yaw -= (Math.min(64, time - lastTime) / 1000) * 0.28;
        lastTime = time;
        if (tween) {
          const f = Math.min(1, (time - tween.start) / 450);
          setExplode(mix(tween.from, tween.to, f * f * (3 - 2 * f)), false);
          if (f >= 1) tween = null;
        }
        draw(false);
        if (spinEnabled || tween) invalidate();
      });
  }
  function draw(picking) {
    if (!mesh || (!gl && !raster) || !stage.clientWidth) return;
    const pixelScale = Math.min(
      window.devicePixelRatio || 1,
      720 / stage.clientWidth,
      440 / stage.clientHeight,
    );
    const w = gl ? canvas.width : Math.max(1, Math.round(stage.clientWidth * pixelScale)),
      h = gl ? canvas.height : Math.max(1, Math.round(stage.clientHeight * pixelScale));
    const sy = Math.sin(yaw),
      cy = Math.cos(yaw),
      sp = Math.sin(pitch),
      cp = Math.cos(pitch),
      sr = Math.sin(roll),
      cr = Math.cos(roll);
    const eye = [cp * cy, cp * sy, sp],
      right = [-sy * cr - cy * sp * sr, cy * cr - sy * sp * sr, cp * sr];
    const up = [sy * sr - cy * sp * cr, -cy * sr - sy * sp * cr, cp * cr];
    const offsets = study.closed.map((v, i) => mix(v, study.opened[i], amount));
    if (gl) {
      gl.bindVertexArray(vao);
      const sk = id + '/' + amount;
      if (sk !== shadowKey) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, shadowBuffer);
        gl.viewport(0, 0, 1024, 1024);
        gl.clear(gl.DEPTH_BUFFER_BIT);
        gl.useProgram(shadowProgram.program);
        const u = shadowProgram.uniform;
        gl.uniform3fv(u.Right, lightRight);
        gl.uniform3fv(u.Up, lightUp);
        gl.uniform3fv(u.Eye, light);
        gl.uniform2f(u.Center, 0, 0);
        gl.uniform2f(u.Scale, 1 / 160, 1 / 160);
        for (const [group, , first, count] of mesh.draws) {
          gl.uniform1f(u.Offset, offsets[group]);
          gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_INT, first * 4);
        }
        shadowKey = sk;
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(prog);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, shadowMap);
      gl.uniform1i(loc.Shadow, 0);
      gl.uniform3fv(loc.Light, light);
      gl.uniform3fv(loc.LightRight, lightRight);
      gl.uniform3fv(loc.LightUp, lightUp);
    }
    let x0 = Infinity,
      x1 = -Infinity,
      y0 = Infinity,
      y1 = -Infinity;
    for (let i = 0; i < offsets.length; i++) {
      const [rx, ry, rz] = study.radii[i],
        z = offsets[i];
      const support = (d) =>
        (id === 'panel' ? Math.abs(rx * d[0]) + Math.abs(ry * d[1]) : Math.hypot(rx * d[0], ry * d[1])) +
        Math.abs(rz * d[2]);
      const dx = support(right),
        dy = support(up);
      x0 = Math.min(x0, z * right[2] - dx);
      x1 = Math.max(x1, z * right[2] + dx);
      y0 = Math.min(y0, z * up[2] - dy);
      y1 = Math.max(y1, z * up[2] + dy);
    }
    const units = (Math.max((x1 - x0) / (w / h), y1 - y0) * 0.56) / zoom;
    if (gl) {
      gl.uniform3fv(loc.Right, right);
      gl.uniform3fv(loc.Up, up);
      gl.uniform3fv(loc.Eye, eye);
      gl.uniform2f(loc.Center, (x1 + x0) / 2, (y1 + y0) / 2);
      gl.uniform2f(loc.Scale, h / (w * units), 1 / units);
    }
    if (!picking && selected >= 0) {
      // A leader lands on a sampled surface vertex, including when the assembly is rotated.
      let score = -Infinity,
        point;
      const toward = eye.map((n, i) => n + 0.21 * up[i] - 0.3 * right[i]);
      const project = (p, b) => p[0] * b[0] + p[1] * b[1] + p[2] * b[2];
      for (const p of mesh.anchors[selected]) {
        const s = project(p, toward);
        if (s > score) {
          point = p;
          score = s;
        }
      }
      const p = [point[0], point[1], point[2] + offsets[selected]],
        cw = stage.clientWidth,
        ch = stage.clientHeight;
      const px = cw / 2 + ((project(p, right) - (x1 + x0) / 2) * ch) / (2 * units),
        py = ch / 2 - ((project(p, up) - (y1 + y0) / 2) * ch) / (2 * units);
      tag.hidden = wire.hidden = px < 0 || px > cw || py < 0 || py > ch;
      if (!tag.hidden) {
        const tx = clamp(px + 24, 6, Math.max(6, cw - tag.offsetWidth - 6)),
          ty = clamp(py - 37, 5, ch - tag.offsetHeight - 5);
        tag.style.left = tx + 'px';
        tag.style.top = ty + 'px';
        const dx = clamp(px, tx, tx + tag.offsetWidth) - px,
          dy = ty + tag.offsetHeight - py;
        wire.style.left = px + 'px';
        wire.style.top = py + 'px';
        wire.style.width = Math.hypot(dx, dy) + 'px';
        wire.style.transform = 'rotate(' + Math.atan2(dy, dx) + 'rad)';
      }
    } else if (!picking) {
      tag.hidden = wire.hidden = true;
    }
    if (raster) {
      raster.render({
        right,
        up,
        eye,
        offsets,
        centerX: (x0 + x1) / 2,
        centerY: (y0 + y1) / 2,
        units,
        width: w,
        height: h,
        selected,
      });
      return;
    }
    for (const [group, mat, first, count] of mesh.draws) {
      const f = finishes[mat];
      gl.uniform1f(loc.Offset, offsets[group]);
      gl.uniform1f(loc.Pick, picking ? group + 1 : 0);
      gl.uniform3f(loc.Color, f[0], f[1], f[2]);
      gl.uniform2f(loc.Finish, f[3], f[4]);
      gl.uniform1f(loc.Emphasis, selected < 0 || selected === group ? 1 : 0.3);
      gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_INT, first * 4);
    }
  }
  function choose(n) {
    selected = n;
    if (n >= 0) setSpin(false);
    wrapper.dataset.selected = String(n);
    buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === n)));
    desc.textContent = n < 0 ? study.summary : study.parts[n][1];
    const target = supplySteps[id]?.[n];
    traceStep.hidden = !target || !onTrace;
    if (target) traceStep.textContent = target[1] + ' →';
    if (n >= 0) tag.textContent = String(n + 1).padStart(2, '0') + '  ' + study.parts[n][0];
    else tag.hidden = wire.hidden = true;
    invalidate();
  }
  function setExplode(fraction, manual = true) {
    if (manual) tween = null;
    amount = clamp(Number(fraction) || 0, 0, 1);
    slider.value = String(Math.round(amount * 100));
    percent.textContent = slider.value + '%';
    explode.textContent = amount > 0.5 ? 'Assemble' : 'Explode';
    wrapper.dataset.explode = slider.value;
    invalidate();
  }
  function resetView() {
    yaw = -0.98;
    pitch = 0.56;
    roll = 1.14;
    zoom = 1;
    choose(-1);
    setExplode(0.86);
  }
  async function setPart(next) {
    if (!Object.hasOwn(studies, next)) throw Error('Unknown cutaway ' + next);
    loader?.abort();
    loader = new AbortController();
    const token = loader;
    mesh = null;
    shadowKey = null;
    id = next;
    study = studies[next];
    raster?.destroy();
    raster = null;
    mode('loading');
    poster.src = new URL(next + '.webp', assetBase);
    poster.alt =
      'Exploded ' + study.title.toLowerCase() + ' with its components arranged along the assembly axis.';
    canvas.setAttribute(
      'aria-label',
      study.title + '. Drag or use arrow keys to rotate. Use plus and minus to zoom. Home resets the view.',
    );
    items.replaceChildren();
    buttons = study.parts.map(([name], i) => {
      const b = button('', 'cutaway-part');
      b.append(el('span', 'cutaway-index', String(i + 1).padStart(2, '0')), el('span', '', name));
      b.addEventListener('click', () => choose(i === selected ? -1 : i));
      items.append(b);
      return b;
    });
    caption.textContent = study.caption + ' ';
    for (const [name, url] of study.links) {
      const a = el('a', '', name);
      a.href = url;
      caption.append(a);
    }
    resetView();
    setSpin(!reduced.matches);
    try {
      const packed = await unpack(next, token.signal);
      if (dead || token !== loader) return false;
      mesh = packed;
      if (!gl) return await startRaster(packed, token);
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, packed.vertices, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, packed.indices, gl.STATIC_DRAW);
      host.dataset.cutawayRenderer = 'webgl';
      mode('live');
      resize();
      draw(false);
      return true;
    } catch (e) {
      if (!dead && token === loader) {
        mode('poster');
        if (e.name !== 'AbortError') console.warn('Cutaway uses its local still.', e.message);
      }
      return false;
    }
  }
  function choosePicked(n) {
    choose(n >= 0 && n < study.parts.length && n !== selected ? n : -1);
  }
  async function startRaster(packed, token) {
    const { createCutawayRaster } = await import('./taku-cutaway-raster.js');
    if (dead || token !== loader) return false;
    raster = createCutawayRaster(canvas, packed, finishes, choosePicked, () => {
      if (!dead && token === loader) mode('poster');
    });
    host.dataset.cutawayRenderer = 'canvas2d';
    draw(false);
    const ok = await raster.ready;
    if (dead || token !== loader) return false;
    mode(ok ? 'live' : 'poster');
    resize();
    return ok;
  }
  function replaceCanvas() {
    const next = canvas.cloneNode(false);
    canvas.replaceWith(next);
    canvas = next;
  }
  try {
    gl =
      allow3D &&
      canvas.getContext('webgl2', {
        antialias: true,
        alpha: true,
        depth: true,
        powerPreference: 'low-power',
        premultipliedAlpha: true,
      });
    if (gl) {
      const p = makeProgram(gl);
      prog = p.program;
      loc = p.uniform;
      shadowProgram = makeProgram(gl, true);
      shadowMap = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, shadowMap);
      gl.texStorage2D(gl.TEXTURE_2D, 1, gl.DEPTH_COMPONENT24, 1024, 1024);
      for (const pname of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER])
        gl.texParameteri(gl.TEXTURE_2D, pname, gl.NEAREST);
      for (const pname of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T])
        gl.texParameteri(gl.TEXTURE_2D, pname, gl.CLAMP_TO_EDGE);
      shadowBuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, shadowBuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, shadowMap, 0);
      gl.drawBuffers([gl.NONE]);
      gl.readBuffer(gl.NONE);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
        throw Error('Depth target unavailable');
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      vbo = gl.createBuffer();
      ibo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 3, gl.SHORT, false, 8, 0);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1, 2, gl.BYTE, true, 8, 6);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
      gl.enable(gl.DEPTH_TEST);
      gl.disable(gl.DITHER);
    }
  } catch (e) {
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    gl = null;
    replaceCanvas();
  }
  listen(canvas, 'webglcontextlost', (e) => {
    e.preventDefault();
    gl = null;
    replaceCanvas();
    if (mesh) {
      mode('loading');
      startRaster(mesh, loader).catch(() => mode('poster'));
    }
  });
  listen(slider, 'input', () => {
    setExplode(Number(slider.value) / 100);
  });
  listen(reset, 'click', resetView);
  listen(spin, 'click', () => setSpin(!spinEnabled));
  listen(explode, 'click', () => {
    const target = amount > 0.5 ? 0 : 1;
    if (reduced.matches) setExplode(target);
    else {
      tween = { start: performance.now(), from: amount, to: target };
      invalidate();
    }
  });
  function changeZoom(factor) {
    zoom = clamp(zoom * factor, 0.67, 2.7);
    invalidate();
  }
  listen(zoomIn, 'click', () => changeZoom(1.2));
  listen(zoomOut, 'click', () => changeZoom(1 / 1.2));
  listen(stage, 'keydown', (e) => {
    if (e.target !== canvas) return;
    switch (e.key) {
      case 'ArrowLeft':
        yaw -= 0.12;
        break;
      case 'ArrowRight':
        yaw += 0.12;
        break;
      case 'ArrowUp':
        pitch = clamp(pitch + 0.1, -1.48, 1.48);
        break;
      case 'ArrowDown':
        pitch = clamp(pitch - 0.1, -1.48, 1.48);
        break;
      case '+':
      case '=':
        changeZoom(1.15);
        break;
      case '-':
        changeZoom(1 / 1.15);
        break;
      case 'Home':
        resetView();
        break;
      case ' ':
        setSpin(!spinEnabled);
        e.preventDefault();
        return;
      default:
        return;
    }
    e.preventDefault();
    setSpin(false);
    invalidate();
  });
  listen(stage, 'pointerdown', (e) => {
    if (e.button !== 0 || e.target !== canvas) return;
    setSpin(false);
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, [e.clientX, e.clientY]);
    if (pointers.size === 1) {
      start = [e.clientX, e.clientY];
      moved = false;
    }
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = Math.hypot(a[0] - b[0], a[1] - b[1]);
      moved = true;
    }
  });
  listen(stage, 'pointermove', (e) => {
    const before = pointers.get(e.pointerId);
    if (!before) return;
    pointers.set(e.pointerId, [e.clientX, e.clientY]);
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.max(1, Math.hypot(a[0] - b[0], a[1] - b[1]));
      if (pinch) changeZoom(d / pinch);
      pinch = d;
      return;
    }
    const dx = e.clientX - before[0],
      dy = e.clientY - before[1];
    if (start && Math.hypot(e.clientX - start[0], e.clientY - start[1]) > 3) moved = true;
    if (moved) {
      yaw -= dx * 0.012;
      pitch = clamp(pitch + dy * 0.012, -1.48, 1.48);
      invalidate();
    }
  });
  function pointerEnd(e) {
    if (!pointers.has(e.pointerId)) return;
    if (!moved && e.type === 'pointerup' && raster) {
      const r = canvas.getBoundingClientRect();
      raster.pick((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
    } else if (!moved && e.type === 'pointerup' && gl && mesh) {
      const r = canvas.getBoundingClientRect(),
        x = clamp(Math.floor(((e.clientX - r.left) * canvas.width) / r.width), 0, canvas.width - 1);
      const y = clamp(
        canvas.height - 1 - Math.floor(((e.clientY - r.top) * canvas.height) / r.height),
        0,
        canvas.height - 1,
      );
      draw(true);
      const pixel = new Uint8Array(4);
      gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
      const n = pixel[0] - 1;
      choosePicked(n);
      draw(false);
    }
    pointers.delete(e.pointerId);
    pinch = null;
    if (!pointers.size) start = null;
  }
  listen(stage, 'pointerup', pointerEnd);
  listen(stage, 'pointercancel', pointerEnd);
  const ready = setPart(part);
  return {
    ready,
    setPart,
    setExplode,
    destroy() {
      dead = true;
      loader?.abort();
      events.abort();
      observer.disconnect();
      visibility.disconnect();
      raster?.destroy();
      cancelAnimationFrame(request);
      if (gl) {
        gl.deleteBuffer(vbo);
        gl.deleteBuffer(ibo);
        gl.deleteVertexArray(vao);
        gl.deleteProgram(prog);
        gl.deleteProgram(shadowProgram.program);
        gl.deleteTexture(shadowMap);
        gl.deleteFramebuffer(shadowBuffer);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      }
      wrapper.remove();
      delete host.dataset.cutawayMode;
      delete host.dataset.cutawayRenderer;
    },
  };
}

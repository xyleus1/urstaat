// The two perforated bands share a fixed frame with the bearing races. Only
// their circulating balls and a few travelling points need per-frame drawing.
const TAU = 2 * Math.PI;
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const bearingLayout = [
  { x: .195, y: .39, radius: .115, tilt: -.23, depth: .54, period: 42 },
  { x: .825, y: .63, radius: .099, tilt: -.39, depth: .61, period: -57 },
  { x: .915, y: .34, radius: .032, tilt: -.39, depth: .61, period: 39 },
];

function bandPoint(band, t, v, width, height) {
  const phase = band ? 1.3 : -.48;
  const twist = Math.PI * (t * (band ? 1.55 : 1.85) + (band ? .35 : -.12));
  const x = width * (-.08 + 1.16 * t) + height * v * .074 * Math.cos(twist);
  const center = band
    ? .64 - .16 * Math.sin(TAU * t + .6) + .075 * Math.sin(2 * TAU * t + .86)
    : .44 + .17 * Math.sin(TAU * t + 1.1) - .088 * Math.sin(TAU * 1.8 * t - .55);
  const y = height * (center + v * (.11 + .044 * Math.sin(TAU * t + phase)) * Math.sin(twist)
    + .022 * (1 - v * v) * Math.cos(twist + .3));
  return [x, y];
}

function withBearing(ctx, spec, w, h, draw) {
  ctx.save();
  ctx.translate(w * spec.x, h * spec.y);
  ctx.rotate(spec.tilt);
  ctx.scale(1, spec.depth);
  draw(Math.min(h, w * .92) * spec.radius);
  ctx.restore();
}

function drawBed(ctx, w, h) {
  ctx.clearRect(0, 0, w, h);
  const rows = w < 650 ? 14 : 20;
  const columns = Math.round(clamp(w / 5.5, 70, 300));
  for (let band = 0; band < 2; band++) {
    for (let row = 0; row <= rows; row++) {
      const v = row / rows * 2 - 1;
      for (let col = 0; col < columns; col++) {
        const t = (col + (row % 2) * .45) / columns;
        const [x, y] = bandPoint(band, t, v, w, h);
        const flank = Math.min(1, .22 + 1.55 * Math.abs(2 * x / w - 1));
        const rib = row === 0 || row === rows;
        const strength = flank * (rib ? .80 : .50) * (.66 + .34 * Math.cos(v * 2.2 - t * 6.1));
        ctx.fillStyle = `rgba(179,188,187,${strength.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, y, rib ? .95 : .68, 0, TAU);
        ctx.fill();
      }
    }
  }
  for (const spec of bearingLayout) {
    withBearing(ctx, spec, w, h, r => {
      ctx.lineWidth = .9;
      for (const [scale, ink] of [[1.15, .16], [1, .56], [.76, .52], [.61, .24]]) {
        ctx.beginPath();
        ctx.setLineDash(scale === 1.15 ? [1.5, 4.5] : []);
        ctx.strokeStyle = `rgba(164,174,174,${ink})`;
        ctx.ellipse(0, 0, r * scale, r * scale, 0, 0, TAU);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    });
  }
}

function drawRace(ctx, w, h, seconds) {
  ctx.clearRect(0, 0, w, h);
  for (const spec of bearingLayout) {
    withBearing(ctx, spec, w, h, r => {
      const balls = r < 23 ? 8 : 13;
      for (let i = 0; i < balls; i++) {
        const theta = TAU * (i / balls + seconds / spec.period);
        const x = .88 * r * Math.cos(theta), y = .88 * r * Math.sin(theta);
        ctx.fillStyle = `rgba(176,184,182,${.54 + .17 * Math.sin(theta)})`;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(1.5, r * .053), 0, TAU);
        ctx.fill();
        ctx.fillStyle = 'rgba(226,232,230,.76)';
        ctx.fillRect(x - .8, y - .8, 1, 1);
      }
    });
  }
  for (let i = 0; i < 6; i++) {
    const t = (i * .193 + seconds / (i % 2 ? 49 : 64)) % 1;
    const v = Math.sin(i * 4.1);
    for (let j = 0; j < 4; j++) {
      const [x, y] = bandPoint(i % 2, t - j * .0045, v, w, h);
      ctx.fillStyle = `rgba(194,202,201,${(.60 - j * .13) * (.5 + .5 * Math.abs(2 * x / w - 1))})`;
      ctx.beginPath();
      ctx.arc(x, y, j ? .9 : 1.45, 0, TAU);
      ctx.fill();
    }
  }
}

export function mountTakuAtmosphere(stage) {
  const host = stage.querySelector('.taku-surface') || stage;
  const layer = document.createElement('div');
  layer.className = 'taku-atmosphere';
  layer.setAttribute('aria-hidden', 'true');
  const bed = document.createElement('canvas'), race = document.createElement('canvas');
  const base = bed.getContext('2d'), moving = race.getContext('2d');
  if (!base || !moving) return { setPose() {}, dispose() {} };
  layer.append(bed, race);
  host.prepend(layer);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, ratio = 1, visible = false, timer = 0, last = 0, elapsed = 0;
  let origin, current, lastOrbit = -Infinity, transform;
  function parallax() {
    let x = 0, y = 0;
    if (origin && current && !reduced.matches) {
      x = Math.sin(current.yaw - origin.yaw) * Math.min(12, width * .015);
      y = Math.sin(current.pitch - origin.pitch) * Math.min(8, height * .018);
    }
    const next = `translate3d(${Math.round(x)}px,${Math.round(y)}px,0)`;
    if (transform !== next) {
      layer.style.transform = next;
      transform = next;
    }
  }
  function animate() {
    timer = 0;
    if (!width || !height || !visible || document.hidden || reduced.matches || stage.dataset.mode !== 'live') {
      last = 0;
      return;
    }
    const now = performance.now();
    // The stationary field still moves with the camera. Give software-rendered orbit frames
    // priority over repainting the tiny bearing balls, then resume them as the camera settles.
    if (stage.dataset.tier === 'cpu' && now - lastOrbit < 140) {
      last = now;
      timer = setTimeout(animate, 145);
      return;
    }
    if (last) elapsed += Math.min(.2, (now - last) / 1000);
    last = now;
    drawRace(moving, width, height, elapsed);
    timer = setTimeout(animate, 1000 / 15);
  }
  function refresh() {
    clearTimeout(timer);
    last = 0;
    parallax();
    if (reduced.matches && width && height) drawRace(moving, width, height, 0);
    animate();
  }
  function resize() {
    const nextWidth = layer.offsetWidth, nextHeight = layer.offsetHeight;
    const nextRatio = Math.min(devicePixelRatio || 1, 1.5);
    if (!nextWidth || !nextHeight || (nextWidth === width && nextHeight === height && nextRatio === ratio)) return;
    width = nextWidth; height = nextHeight; ratio = nextRatio;
    for (const [canvas, ctx] of [[bed, base], [race, moving]]) {
      canvas.width = Math.ceil(width * ratio);
      canvas.height = Math.ceil(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    drawBed(base, width, height);
    drawRace(moving, width, height, reduced.matches ? 0 : elapsed);
  }
  const resizeObserver = new ResizeObserver(resize), modeObserver = new MutationObserver(refresh);
  resizeObserver.observe(host);
  modeObserver.observe(stage, { attributes: true, attributeFilter: ['data-mode'] });
  const intersection = new IntersectionObserver(entries => { visible = entries.at(-1).isIntersecting; refresh(); });
  intersection.observe(host);
  reduced.addEventListener('change', refresh);
  document.addEventListener('visibilitychange', refresh);
  resize();
  return {
    setPose(pose) {
      if (!Number.isFinite(pose?.yaw) || !Number.isFinite(pose?.pitch)) return;
      if (current && (Math.abs(pose.yaw - current.yaw) > .001 || Math.abs(pose.pitch - current.pitch) > .001))
        lastOrbit = performance.now();
      origin ||= pose;
      current = pose;
      parallax();
    },
    dispose() {
      clearTimeout(timer);
      intersection.disconnect();
      modeObserver.disconnect();
      resizeObserver.disconnect();
      reduced.removeEventListener('change', refresh);
      document.removeEventListener('visibilitychange', refresh);
      layer.remove();
    },
  };
}

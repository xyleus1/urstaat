import { init, animate } from './vendor/graph-vendor.js?v=finish-1';
import { graphDomain, graphSeries, graphViews, sampleSeries, readingAt, formatIndex, formatRaw, snapYear, stepYear, placeEndpointLabels, displayValue, inverseDisplayValue, indexPresentation, compressIndex, uncompressIndex } from './graph-data.js?v=rough-display-20261118-1';
import { getStory } from './graph-stories.js?v=rough-display-20261118-1';

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const make = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
};
const absolute = source => new URL(source, import.meta.url).href;
const safeSource = source => {
  try { const url = new URL(source); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; } catch { return null; }
};
const displayIndex = formatIndex;
const positive = value => Number.isFinite(value) && value > 0;
const axisIndex = formatIndex;
let youtubeReady;
let mediaSequence = 0;

function loadYouTube() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeReady) return youtubeReady;
  youtubeReady = new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    const timer = setTimeout(() => reject(new Error('YouTube player did not load.')), 15000);
    window.onYouTubeIframeAPIReady = () => {
      clearTimeout(timer); previous?.(); resolve(window.YT);
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api'; script.async = true;
      script.onerror = () => { clearTimeout(timer); reject(new Error('YouTube player did not load.')); };
      document.head.append(script);
    }
  });
  return youtubeReady;
}

// Each host owns its provider player and teardown. No extracted video streams,
// CORS proxies, or generated stand-ins for unavailable publisher footage.
function mountMedia(host, story, { preview = false, reducedMotion = false, expand } = {}) {
  let alive = true, player, interval;
  const cleanups = [], media = story.media || {};
  const on = (target, type, handler) => {
    target.addEventListener(type, handler);
    cleanups.push(() => target.removeEventListener(type, handler));
  };
  const fail = () => {
    if (!alive) return;
    host.replaceChildren(); host.classList.add('is-unavailable');
    const message = media.provider === 'image'
      ? 'This sketch is temporarily unavailable.'
      : 'The publisher’s video could not load here.';
    host.append(make('p', 'graph-media-message', message));
    const source = safeSource(story.sourceUrl);
    if (source && story.kind !== 'scenario') {
      const link = make('a', 'graph-source', 'Open the original source ↗');
      link.href = source; link.target = '_blank'; link.rel = 'noopener noreferrer'; host.append(link);
    }
  };
  host.classList.remove('is-unavailable');
  host.dataset.provider = media.state === 'placeholder' ? 'placeholder' : media.provider || 'unavailable'; host.replaceChildren();
  if (media.provider === 'image' && media.state === 'placeholder') {
    const placeholder = make('div', 'graph-sketch-placeholder');
    placeholder.append(make('span', 'graph-placeholder-label', 'Sketch forthcoming'));
    if (preview && expand) {
      const button = make('button', 'graph-media-open');
      button.type = 'button'; button.setAttribute('aria-label', `Expand ${story.title}`);
      button.append(placeholder); on(button, 'click', expand); host.append(button);
    } else host.append(placeholder);
  } else if (media.provider === 'image' && media.src) {
    const image = make('img', 'graph-story-image');
    image.alt = media.alt || story.title; image.decoding = 'async'; on(image, 'error', fail);
    if (preview && expand) {
      const button = make('button', 'graph-media-open');
      button.type = 'button'; button.setAttribute('aria-label', `Expand ${story.title}`);
      button.append(image); on(button, 'click', expand); host.append(button);
    } else host.append(image);
    image.src = absolute(media.src) + (media.revision ? `?v=${encodeURIComponent(media.revision)}` : '');
  } else if (media.provider === 'native' && media.src) {
    const video = make('video', 'graph-story-video');
    video.controls = !preview || reducedMotion; video.muted = preview;
    video.playsInline = true; video.preload = 'metadata';
    video.setAttribute('aria-label', story.title);
    if (media.poster) video.poster = absolute(media.poster);
    on(video, 'error', fail);
    const start = Number(media.startSeconds) || 0;
    on(video, 'loadedmetadata', () => {
      if (!alive) return;
      if (start) video.currentTime = Math.min(start, Math.max(0, video.duration - .1));
      if (preview && !reducedMotion) video.play().catch(() => { if (alive) video.controls = true; });
    });
    const restart = () => { if (alive && preview && !reducedMotion) { video.currentTime = start; video.play().catch(() => {}); } };
    on(video, 'ended', restart);
    on(video, 'timeupdate', () => { if (preview && !reducedMotion && media.endSeconds && video.currentTime >= media.endSeconds) restart(); });
    if (preview && !reducedMotion && expand) on(video, 'click', expand);
    host.append(video); video.src = absolute(media.src);
    cleanups.push(() => { video.pause(); video.removeAttribute('src'); video.load(); });
  } else if (['youtube', 'slideslive', 'wistia'].includes(media.provider)) {
    const frame = make('iframe', 'graph-story-frame');
    frame.title = story.title;
    frame.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
    frame.allowFullscreen = true; frame.referrerPolicy = 'strict-origin-when-cross-origin';
    if (media.provider === 'youtube') {
      if (!/^[\w-]{11}$/.test(media.id || '')) { fail(); return { destroy() { alive = false; } }; }
      const params = new URLSearchParams({ enablejsapi: '1', origin: location.origin, playsinline: '1', rel: '0', controls: '1', start: String(media.startSeconds || 0) });
      frame.src = `https://www.youtube.com/embed/${media.id}?${params}`;
      frame.id = `graph-youtube-${++mediaSequence}`; host.append(frame);
      loadYouTube().then(YT => {
        if (!alive || !frame.isConnected) return;
        player = new YT.Player(frame, {
          events: {
            onReady(event) {
              if (!alive) { event.target.destroy(); return; }
              if (preview && !reducedMotion) { event.target.mute(); event.target.playVideo(); }
            },
            onStateChange(event) {
              if (alive && preview && !reducedMotion && event.data === YT.PlayerState.ENDED) {
                event.target.seekTo(media.startSeconds || 0, true); event.target.playVideo();
              }
            },
            onError: fail,
          },
        });
        if (preview && !reducedMotion && media.endSeconds) interval = setInterval(() => {
          if (alive && player?.getCurrentTime?.() >= media.endSeconds) player.seekTo(media.startSeconds || 0, true);
        }, 250);
      }).catch(() => { /* A normal iframe remains usable when the optional API is blocked. */ });
    } else if (media.provider === 'slideslive') {
      const url = new URL(media.src ? absolute(media.src) : `https://slideslive.com/embed/presentation/${encodeURIComponent(media.id)}`);
      if (media.startSeconds) url.searchParams.set('start_time', String(media.startSeconds));
      frame.src = url.href;
      host.append(frame);
    } else {
      const params = new URLSearchParams({ autoPlay: 'false', playsinline: 'true' });
      frame.src = media.src ? absolute(media.src) : `https://fast.wistia.net/embed/iframe/${encodeURIComponent(media.id)}?${params}`;
      host.append(frame);
    }
    on(frame, 'error', fail);
    cleanups.push(() => { frame.src = 'about:blank'; frame.remove(); });
  } else fail();
  return { destroy() {
    if (!alive) return;
    alive = false; clearInterval(interval);
    try { player?.destroy(); } catch {}
    cleanups.forEach(cleanup => cleanup()); host.replaceChildren();
  } };
}

export function mountGraph(element) {
  if (!element) throw new Error('A graph container is required.');
  if (element.__graphController) return element.__graphController;
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  let reducedMotion = motionPreference.matches;
  const samples = graphSeries.map((_, index) => sampleSeries(index));
  const endpoints = graphSeries.map((_, index) => readingAt(index, graphDomain.lastYear));
  const xDomain = { minimum: graphDomain.firstYear - .2, maximum: graphDomain.lastYear + .2 };
  const yearTicks = Array.from({ length: 1 + (graphDomain.lastYear - graphDomain.firstYear) / 5 }, (_, index) => graphDomain.firstYear + index * 5);
  let year = graphDomain.dividerYear, selectedView = 'all', activeSeries = new Set(graphSeries.map(series => series.id));
  let layout, disposed = false, resizeFrame = 0, hoverTimer, hideTimer, previewMedia, panelMedia, panelAnimation, popupAnimation;
  let previewKey = '', pendingPreviewKey = '', previewState = null, opened = null, lastOpener = null, panelRevision = 0;
  let tooltipAnchor = [0, 0], pointerStart = null, wheelDelta = 0, wheelTime = 0, wheelEventTime = 0, popupDistance = Infinity;
  let openingPointer = null;
  const disposers = [];
  const listen = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    disposers.push(() => target.removeEventListener(type, handler, options));
  };
  element.classList.add('robotics-graph');
  element.innerHTML = `
    <div class="graph-heading"><h2 id="trajectories-title">From intelligence to work.</h2></div>
    <div class="graph-toolbar" role="group" aria-label="Highlight trajectories">
      ${graphViews.map(view => `<button type="button" data-graph-view="${view.id}" aria-pressed="${view.id === 'all'}">${view.label}</button>`).join('')}
      <span class="graph-status">Compressed index · 2025 = 100</span>
    </div>
    <div class="graph-stage">
      <div class="graph-plot" tabindex="0" role="group" aria-label="Six robotics indices from 2015 to 2040, with historical trajectories and projected scenarios. All lines use the same compressed index scale and their measured 2025 baseline of 100. Use arrow keys to inspect annual history through 2026, then 2030, 2035 and 2040. Press Enter to open the year menu."></div>
      <div class="graph-labels" role="group" aria-label="2040 endpoints. Choose a trajectory to highlight it.">
        ${graphSeries.map((series, index) => `<button type="button" class="graph-label" data-graph-series="${series.id}" style="--series-color:${series.color}" aria-pressed="false"><span class="graph-label-name">${series.name}</span><span class="graph-label-definition">2040 projection · 2025 = 100</span><span class="graph-label-value">${displayIndex(endpoints[index]?.value)}</span><span class="graph-label-metric">${series.definition}</span></button>`).join('')}
      </div>
    </div>
    <div class="graph-scrubber"><label for="trajectory-year">Explore a year</label><input id="trajectory-year" type="range" min="2015" max="2040" step="1" value="2026" aria-label="Year to inspect: annual through 2026, then 2030, 2035 and 2040"><output for="trajectory-year">2026</output><button type="button" class="graph-open-year">Open year <span aria-hidden="true">↗</span></button></div>
    <section class="graph-panel" aria-labelledby="graph-panel-title" hidden></section>
    <p class="graph-live" aria-live="polite" aria-atomic="true"></p>`;
  const stage = element.querySelector('.graph-stage'), plot = element.querySelector('.graph-plot');
  const labels = [...element.querySelectorAll('.graph-label')], buttons = [...element.querySelectorAll('[data-graph-view]')];
  const slider = element.querySelector('input[type="range"]'), output = element.querySelector('output');
  const panel = element.querySelector('.graph-panel'), live = element.querySelector('.graph-live');
  const popup = make('div', 'graph-popup');
  popup.setAttribute('role', 'dialog'); popup.setAttribute('aria-label', 'Event preview');
  const chart = init(plot, null, { renderer: 'svg' });
  const x = value => chart.convertToPixel({ xAxisIndex: 0 }, value);
  const y = value => positive(value) ? chart.convertToPixel({ yAxisIndex: 0 }, displayValue(value)) : NaN;

  function axisTickValues(height = 480) {
    const low = displayValue(graphDomain.minimum), high = displayValue(graphDomain.maximum);
    const minimum = compressIndex(graphDomain.minimum), maximum = indexPresentation.maximum;
    const decades = [], niceValues = [];
    for (let exponent = Math.floor(Math.log10(minimum)); exponent <= Math.ceil(Math.log10(maximum)); exponent++) {
      decades.push(10 ** exponent);
      for (const multiple of [1, 2, 5]) {
        const value = multiple * 10 ** exponent;
        if (value >= minimum && value <= maximum) niceValues.push(value);
      }
    }
    decades.sort((a, b) => Math.abs(Math.log(a / 100)) - Math.abs(Math.log(b / 100)));
    const chosen = [];
    // Tick labels use presentation units; inverse-map them onto the unchanged
    // plot coordinates. Keep the baseline and 10,000 ceiling explicit.
    for (const value of [100, maximum, niceValues[0], ...decades, 50, 200, 500, 2000, 5000]) {
      if (value < minimum || value > maximum) continue;
      const position = displayValue(uncompressIndex(value));
      if (chosen.every(tick => Math.abs(tick - position) / (high - low) * height >= 28)) chosen.push(position);
    }
    return chosen.sort((a, b) => a - b);
  }

  function measurement(seriesIndex, selectedYear, expanded = false) {
    const series = graphSeries[seriesIndex], reading = readingAt(seriesIndex, selectedYear);
    const block = make('div', 'graph-measurement');
    block.dataset.kind = reading?.kind || 'unreported';
    block.append(make('p', 'graph-measurement-name', series.definition));
    if (!reading || !positive(reading.value)) {
      block.append(make('p', 'graph-measurement-status', `No comparable observation reported for ${selectedYear}.`));
    } else {
      block.append(make('p', 'graph-measurement-value', `≈ ${formatRaw(series, reading.raw)} · compressed index ${formatIndex(reading.value)}`));
      const date = reading.date || String(selectedYear);
      const period = reading.coverage === 'year-to-date' ? `YTD through ${date}` : date;
      block.append(make('p', 'graph-measurement-status', `Historical · ${period} · 2025 = 100`));
      if (expanded && reading.detail && reading.kind !== 'reconstructed') block.append(make('p', 'graph-measurement-detail', reading.detail));
      if (expanded && Number.isFinite(reading.ciLowRaw) && Number.isFinite(reading.ciHighRaw)) {
        block.append(make('p', 'graph-measurement-detail', `Reported interval: ${formatRaw(series, reading.ciLowRaw)}–${formatRaw(series, reading.ciHighRaw)}.`));
      }
    }
    const modeled = reading?.kind === 'reconstructed';
    const source = modeled ? absolute('../sources/#trajectories') : safeSource(reading?.sourceUrl || series.sourceUrl);
    if (source) {
      const link = make('a', 'graph-measurement-source', modeled ? 'Methodology ↗' : 'Metric source ↗');
      link.href = source; link.target = '_blank'; link.rel = 'noopener noreferrer'; block.append(link);
    }
    return block;
  }

  function buildSeries() {
    return graphSeries.flatMap((series, index) => {
      const active = activeSeries.has(series.id), focused = activeSeries.size < 6;
      const common = { type: 'line', smooth: false, showSymbol: false, symbol: 'none', connectNulls: false, animation: false, clip: true, emphasis: { disabled: true }, select: { disabled: true } };
      const points = samples[index], firstScenario = points.findIndex(point => point.kind === 'scenario');
      const history = points.map(point => [point.year, point.kind !== 'scenario' && positive(point.value) ? displayValue(point.value) : null]);
      // Include the last measured anchor in the dashed projection, without
      // changing that observation's own status.
      const futureStart = firstScenario > 0 && positive(points[firstScenario - 1].value) ? firstScenario - 1 : firstScenario;
      const future = firstScenario < 0 ? [] : points.slice(futureStart).map(point => [point.year, positive(point.value) ? displayValue(point.value) : null]);
      return [
        { ...common, id: `${series.id}-history`, name: series.name, data: history, triggerEvent: true, lineStyle: { color: series.color, width: active && focused ? 2.4 : 1.7, opacity: active ? 1 : .13 }, z: active ? 3 : 2 },
        { ...common, id: `${series.id}-future`, name: series.name, data: future, triggerEvent: true, lineStyle: { color: series.color, width: active && focused ? 2.4 : 1.7, type: [5, 4], opacity: active ? 1 : .13 }, z: active ? 3 : 2 },
      ];
    });
  }
  chart.setOption({
    animation: !reducedMotion, animationDuration: 0, animationDurationUpdate: 160, backgroundColor: 'transparent',
    textStyle: { fontFamily: getComputedStyle(element).fontFamily },
    grid: { left: 44, right: 270, top: 57, bottom: 60 },
    xAxis: { type: 'value', min: xDomain.minimum, max: xDomain.maximum, interval: 5, axisLine: { show: false }, axisTick: { show: false, customValues: yearTicks }, axisLabel: { customValues: yearTicks, color: '#929A9F', fontSize: 11, margin: 16, formatter: value => String(value) }, splitLine: { lineStyle: { color: '#343B40', width: .7 } }, minorTick: { splitNumber: 5 }, minorSplitLine: { show: true, lineStyle: { color: '#20272C', width: .5 } } },
    yAxis: { type: 'value', min: displayValue(graphDomain.minimum), max: displayValue(graphDomain.maximum), axisLine: { show: false }, axisTick: { show: false, customValues: axisTickValues() }, axisLabel: { customValues: axisTickValues(), color: '#929A9F', fontSize: 11, margin: 12, formatter: value => axisIndex(inverseDisplayValue(value)) }, splitLine: { lineStyle: { color: '#343B40', width: .7 } }, minorSplitLine: { show: false } },
    tooltip: {
      trigger: 'item', triggerOn: 'none', renderMode: 'html', enterable: true, confine: true,
      // This menu owns its hide lifecycle; ECharts must not dismiss focused
      // content when switching between the differently sized menu and preview.
      alwaysShowContent: true,
      transitionDuration: 0, hideDelay: 320, padding: 0, borderWidth: 0, backgroundColor: 'transparent',
      extraCssText: 'box-shadow:none;white-space:normal;z-index:30;', formatter: () => popup,
      position(_point, _params, _dom, _rect, size) {
        const [width, height] = size.contentSize;
        let left = tooltipAnchor[0] + 18;
        if (left + width > layout.width - 6) left = tooltipAnchor[0] - width - 18;
        let top = tooltipAnchor[1] - height - 16;
        if (top < 6) top = tooltipAnchor[1] + 16;
        return [clamp(left, 6, Math.max(6, layout.width - width - 6)), clamp(top, 6, Math.max(6, layout.height - height - 6))];
      },
    },
    series: buildSeries(),
  });

  function renderGraphics() {
    if (!layout || disposed) return;
    const font = getComputedStyle(element).fontFamily, currentX = x(year);
    const elements = [
      { id: 'future-field', type: 'rect', silent: true, z: -1, shape: { x: x(2026), y: layout.gy, width: x(2040) - x(2026), height: layout.gh }, style: { fill: 'rgba(199,205,208,.022)' } },
      { id: 'divider', type: 'line', silent: true, z: 4, shape: { x1: x(2026), x2: x(2026), y1: layout.gy, y2: layout.gy + layout.gh }, style: { stroke: '#C7CDD0', opacity: .4, lineWidth: 1 } },
      { id: 'divider-text', type: 'text', silent: true, z: 5, x: x(2026) + 5, y: layout.gy + 12, style: { text: '2026', fill: '#929A9F', font: `11px ${font}`, opacity: Math.abs(currentX - x(2026)) < 50 ? 0 : 1 } },
      { id: 'axis-title', type: 'text', silent: true, x: layout.gx, y: 13, style: { text: 'Compressed index · 2025 = 100', fill: '#929A9F', font: `10px ${font}` } },
      { id: 'future-title', type: 'text', silent: true, x: x(2040), y: 13, style: { text: layout.width < 500 ? 'Scenarios' : 'Projected scenarios', fill: '#929A9F', align: 'right', font: `10px ${font}` } },
      { id: 'crosshair', type: 'line', silent: true, z: 6, shape: { x1: currentX, x2: currentX, y1: layout.gy, y2: layout.gy + layout.gh }, style: { stroke: '#C7CDD0', opacity: .6, lineWidth: 1, lineDash: [2, 4] } },
      { id: 'year-pill', type: 'rect', silent: true, z: 7, shape: { x: clamp(currentX - 25, layout.gx, x(2040) - 50), y: layout.gy - 28, width: 50, height: 21 }, style: { fill: '#C7CDD0' } },
      { id: 'year-text', type: 'text', silent: true, z: 8, x: clamp(currentX, layout.gx + 25, x(2040) - 25), y: layout.gy - 17, style: { text: String(year), fill: '#080A0B', align: 'center', verticalAlign: 'middle', font: `11px ${font}` } },
    ];
    const endpointPositions = placeEndpointLabels(graphSeries.map((series, index) => ({ id: series.id, index, y: y(endpoints[index]?.value) })), layout.gy - 5, layout.gy + layout.gh - 84, 80);
    graphSeries.forEach((series, index) => {
      const active = activeSeries.has(series.id), reading = readingAt(index, year), hasReading = positive(reading?.value);
      const pointY = hasReading ? y(reading.value) : layout.gy;
      elements.push(
        { id: `halo-${series.id}`, type: 'circle', silent: true, ignore: !hasReading, z: 7, shape: { cx: currentX, cy: pointY, r: 8 }, style: { fill: series.color, opacity: active ? .12 : 0 } },
        { id: `dot-${series.id}`, type: 'circle', silent: true, ignore: !hasReading, z: 8, shape: { cx: currentX, cy: pointY, r: active && activeSeries.size < 6 ? 4.6 : 3.8 }, style: { fill: series.color, stroke: '#080A0B', lineWidth: 2, opacity: active ? 1 : .13 } },
      );
      // Whiskers are only the intervals reported with measured observations.
      // They do not imply a confidence band for the author-defined scenarios.
      for (const observation of series.observations || []) {
        if (positive(observation.value)) elements.push({ id: `observation-${series.id}-${observation.year}`, type: 'circle', silent: true, z: 4, shape: { cx: x(observation.year), cy: y(observation.value), r: 1.6 }, style: { fill: series.color, opacity: active ? .8 : .1 } });
        if (!positive(observation.ciLow) || !positive(observation.ciHigh)) continue;
        const intervalX = x(observation.year), lowY = y(observation.ciLow), highY = y(observation.ciHigh);
        const intervalId = `interval-${series.id}-${observation.year}`;
        elements.push(
          { id: intervalId, type: 'line', silent: true, z: 1, shape: { x1: intervalX, x2: intervalX, y1: lowY, y2: highY }, style: { stroke: series.color, opacity: active ? .27 : .035, lineWidth: .8 } },
          ...[[lowY, 'low'], [highY, 'high']].map(([intervalY, edge]) => ({ id: `${intervalId}-${edge}`, type: 'line', silent: true, z: 1, shape: { x1: intervalX - 3, x2: intervalX + 3, y1: intervalY, y2: intervalY }, style: { stroke: series.color, opacity: active ? .27 : .035, lineWidth: .8 } })),
        );
      }
      const endpoint = endpointPositions.find(item => item.id === series.id), labelX = x(2040) + 46;
      labels[index].style.left = `${labelX}px`; labels[index].style.top = `${endpoint.labelY}px`;
      labels[index].style.width = `${Math.max(0, layout.width - labelX)}px`;
      labels[index].setAttribute('aria-label', `Highlight ${series.name}. ${series.definition}. 2040 projected compressed index about ${formatIndex(endpoints[index]?.value)}. 2025 = 100.`);
      elements.push({ id: `leader-${series.id}`, type: 'polyline', silent: true, ignore: layout.compact, z: 2, shape: { points: [[x(2040), endpoint.y], [x(2040) + 14, endpoint.y], [labelX - 14, endpoint.labelY + 8], [labelX - 5, endpoint.labelY + 8]] }, style: { stroke: series.color, lineWidth: .8, fill: null, opacity: active ? .85 : .13 } });
    });
    chart.setOption({ graphic: { elements } });
  }

  function resize() {
    if (disposed) return;
    const width = Math.max(250, Math.round(stage.getBoundingClientRect().width)), compact = width < 980;
    const plotHeight = width < 500 ? 360 : compact ? 420 : 480;
    const next = { width, compact, gx: width < 500 ? 42 : 48, gy: 57, gh: plotHeight, gw: width - (compact ? 62 : 308), height: plotHeight + 118 };
    if (layout && layout.width === next.width && layout.height === next.height) return;
    layout = next; element.classList.toggle('is-compact', compact);
    plot.style.height = `${layout.height}px`; popup.style.width = `${Math.min(350, width - 12)}px`;
    popup.style.maxHeight = `${Math.min(520, layout.height - 12, innerHeight - 24)}px`;
    chart.resize({ width, height: layout.height, silent: true });
    const ticks = axisTickValues(layout.gh);
    chart.setOption({ grid: { left: layout.gx, right: layout.width - layout.gx - layout.gw, top: layout.gy, bottom: layout.height - layout.gy - layout.gh }, yAxis: { axisTick: { customValues: ticks }, axisLabel: { customValues: ticks } } });
    renderGraphics(); hidePreview();
  }

  function updateYear(next) {
    const snapped = snapYear(next);
    // Native range input can move inside the current stop's snap interval.
    // Reset its coordinate even when the graph itself needs no rerender.
    slider.value = String(snapped);
    if (snapped === year && element.dataset.inspectedYear === String(year)) return;
    if (snapped !== year) hidePreview();
    year = snapped;
    slider.setAttribute('aria-valuetext', `${year}${year > 2026 ? ', possible future' : ', historical event'}`);
    output.value = String(year); output.textContent = String(year); element.dataset.inspectedYear = String(year);
    renderGraphics();
  }

  function selectView(id) {
    const view = graphViews.find(candidate => candidate.id === id), solo = graphSeries.find(series => id === `series:${series.id}`);
    if (!view && !solo) throw new Error(`Unknown graph view: ${id}`);
    selectedView = id; activeSeries = new Set(view ? view.series : [solo.id]); hidePreview();
    chart.setOption({ series: buildSeries() });
    labels.forEach(label => {
      const active = activeSeries.has(label.dataset.graphSeries);
      label.classList.toggle('is-muted', !active); label.setAttribute('aria-pressed', String(activeSeries.size === 1 && active));
    });
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.graphView === selectedView)));
    renderGraphics();
  }

  function hidePreview() {
    clearTimeout(hoverTimer); clearTimeout(hideTimer); previewMedia?.destroy(); previewMedia = null;
    previewState = null; previewKey = ''; pendingPreviewKey = ''; popupDistance = Infinity; popupAnimation?.cancel(); popup.hidden = true;
    if (!disposed) chart.dispatchAction({ type: 'hideTip' });
  }
  function scheduleHide() {
    clearTimeout(hoverTimer); pendingPreviewKey = '';
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => { if (!popup.matches(':hover') && !popup.contains(document.activeElement)) hidePreview(); }, 320);
  }
  const yearChoices = () => graphSeries.map((series, seriesIndex) => ({ id: series.id, seriesIndex })).filter(hit => activeSeries.has(hit.id));
  const showYearMenu = (anchor, options) => showPreview(yearChoices(), anchor, { ...options, menu: true });
  function showPreview(hits, anchor, { immediate = false, focus = false, opener = plot, menu = false } = {}) {
    if (!hits.length || disposed) return;
    clearTimeout(hideTimer);
    const key = `${year}:${menu ? 'menu' : 'event'}:${hits.map(hit => hit.id).sort().join(',')}`;
    if (key === previewKey) {
      if (focus) popup.querySelector('button')?.focus({ preventScroll: true });
      return;
    }
    if (!immediate && key === pendingPreviewKey) return;
    clearTimeout(hoverTimer);
    pendingPreviewKey = key;
    const previewYear = year;
    const render = () => {
      if (disposed || year !== previewYear || pendingPreviewKey !== key) return;
      pendingPreviewKey = '';
      previewMedia?.destroy(); previewMedia = null;
      previewKey = key; previewState = { year: previewYear, series: hits.map(hit => hit.id), mode: menu ? 'menu' : 'event' }; tooltipAnchor = anchor;
      popup.dataset.mode = previewState.mode;
      popup.hidden = false; popup.replaceChildren();
      if (menu) {
        popup.setAttribute('aria-label', `Choose a trajectory for ${previewYear}`);
        popup.append(make('p', 'graph-popup-eyebrow', `${previewYear} · Choose a trajectory`));
        const choices = make('div', 'graph-popup-choices');
        hits.forEach(hit => {
          const series = graphSeries[hit.seriesIndex], button = make('button', 'graph-popup-choice'); button.type = 'button';
          const reading = readingAt(hit.seriesIndex, previewYear);
          button.dataset.series = series.id;
          button.style.setProperty('--series-color', series.color);
          const value = make('span', 'graph-popup-choice-value', displayIndex(reading?.value));
          value.append(make('small', '', reading ? reading.kind === 'scenario' ? 'projected' : 'historical' : 'not reported'));
          button.append(make('span', '', series.name), value);
          button.addEventListener('click', () => showPreview([hit], anchor, { immediate: true, focus: true, opener })); choices.append(button);
        });
        popup.append(choices);
      } else {
        const hit = hits[0], series = graphSeries[hit.seriesIndex], story = getStory(series.id, previewYear);
        if (!story) { hidePreview(); return; }
        popup.setAttribute('aria-label', `${previewYear}: ${story.title}`);
        const back = make('button', 'graph-expand graph-preview-back', `← Back to ${previewYear} menu`); back.type = 'button';
        back.addEventListener('click', () => showYearMenu(anchor, { immediate: true, focus: true, opener })); popup.append(back);
        const header = make('div', 'graph-popup-header');
        header.append(make('p', 'graph-popup-eyebrow', `${previewYear} · ${series.name}`), make('span', 'graph-popup-index', displayIndex(readingAt(hit.seriesIndex, previewYear)?.value)));
        const mediaHost = make('div', 'graph-preview-media');
        popup.append(header);
        if (story.kind !== 'scenario') popup.append(measurement(hit.seriesIndex, previewYear));
        popup.append(mediaHost, make('h3', 'graph-popup-title', story.title));
        const expand = make('button', 'graph-expand', 'Expand event ↗'); expand.type = 'button';
        expand.addEventListener('click', () => openStory(series.id, previewYear, opener)); popup.append(expand);
        requestAnimationFrame(() => {
          if (disposed || previewKey !== key || !mediaHost.isConnected) return;
          previewMedia = mountMedia(mediaHost, story, { preview: true, reducedMotion, expand: () => openStory(series.id, previewYear, opener) });
        });
      }
      // Hidden point symbols have no per-item display element. Use ECharts'
      // supported manual-content action, anchored to the inspection cursor.
      chart.dispatchAction({ type: 'showTip', x: anchor[0], y: anchor[1], tooltip: { formatter: () => popup } });
      const plotRect = plot.getBoundingClientRect();
      popupDistance = distanceToPopup(plotRect.left + anchor[0], plotRect.top + anchor[1]);
      popupAnimation?.cancel();
      if (!reducedMotion) popupAnimation = animate(popup, { opacity: [0, 1] }, { duration: .16 });
      if (focus) popup.querySelector('button')?.focus({ preventScroll: true });
    };
    if (immediate) render(); else hoverTimer = setTimeout(render, 180);
  }

  function openStory(seriesId, selectedYear = year, opener = document.activeElement) {
    const story = getStory(seriesId, snapYear(selectedYear));
    if (!story || disposed) return;
    const revision = ++panelRevision, oldHeight = panel.hidden ? 0 : panel.getBoundingClientRect().height;
    hidePreview(); panelMedia?.destroy(); panelMedia = null; panelAnimation?.cancel();
    lastOpener = opener instanceof HTMLElement && opener.isConnected && !popup.contains(opener) ? opener : plot;
    opened = { id: story.id, seriesId, year: story.year, kind: story.kind };
    panel.dataset.storyId = story.id || `${seriesId}-${story.year}`; panel.dataset.year = String(story.year); panel.dataset.series = seriesId;
    panel.replaceChildren();
    const top = make('div', 'graph-panel-top'), series = graphSeries.find(item => item.id === seriesId);
    top.append(make('p', 'graph-panel-eyebrow', `${story.year} · ${series.name}${story.kind === 'scenario' ? ' · Possible future' : ''}`));
    const close = make('button', 'graph-panel-close', 'Close ×'); close.type = 'button'; close.setAttribute('aria-label', 'Close event');
    close.addEventListener('click', () => closePanel()); top.append(close);
    const inner = make('div', 'graph-panel-inner'), mediaHost = make('div', 'graph-panel-media'), copy = make('div', 'graph-panel-copy');
    if (story.kind === 'scenario') {
      const context = make('div', 'graph-panel-context'), identity = make('p', 'graph-panel-identity');
      identity.id = 'graph-panel-identity';
      context.style.setProperty('--series-color', series.color);
      identity.append(make('span', 'graph-panel-year', String(story.year)), make('span', 'graph-panel-series', series.name));
      context.append(identity, close); copy.append(context);
    }
    const heading = make('h3', '', story.title); heading.id = 'graph-panel-title'; heading.tabIndex = -1;
    if (story.kind === 'scenario') heading.setAttribute('aria-describedby', 'graph-panel-identity');
    copy.append(heading);
    if (story.kind !== 'scenario') copy.append(measurement(graphSeries.indexOf(series), story.year, true));
    copy.append(make('p', 'graph-panel-blurb', story.blurb));
    const evidenceLabels = { 'lab-demo': 'Research demonstration', launch: 'Product launch', 'operational-report': 'Operational report', pilot: 'Deployment pilot' };
    if (story.evidenceType && story.kind !== 'scenario') copy.append(make('p', 'graph-evidence', evidenceLabels[story.evidenceType] || story.evidenceType));
    const source = safeSource(story.sourceUrl);
    if (source && story.kind !== 'scenario') {
      const link = make('a', 'graph-source', 'Event source ↗');
      link.href = source; link.target = '_blank'; link.rel = 'noopener noreferrer'; copy.append(link);
    }
    inner.append(mediaHost, copy);
    if (story.kind !== 'scenario') panel.append(top);
    panel.append(inner);
    panel.hidden = false; panel.style.height = 'auto'; panel.style.opacity = '1';
    panelMedia = mountMedia(mediaHost, story, { reducedMotion });
    const finalHeight = panel.getBoundingClientRect().height;
    if (!reducedMotion) {
      panelAnimation = animate(panel, { height: [`${oldHeight}px`, `${finalHeight}px`], opacity: [oldHeight ? 1 : 0, 1] }, { duration: .24, ease: [0.22, 1, .36, 1] });
      panelAnimation.then(() => { if (!disposed && revision === panelRevision) panel.style.height = 'auto'; }).catch(() => {});
    }
    live.textContent = `${story.year}. ${story.title}. Event opened below the graph.`;
    heading.focus({ preventScroll: true });
  }
  function closePanel({ restoreFocus = true, immediate = false } = {}) {
    if (!opened) return;
    const revision = ++panelRevision; opened = null; delete panel.dataset.storyId;
    panelMedia?.destroy(); panelMedia = null; panelAnimation?.cancel();
    const finish = () => {
      if (disposed || revision !== panelRevision) return;
      panel.hidden = true; panel.replaceChildren(); panel.style.height = ''; panel.style.opacity = '';
    };
    if (immediate || reducedMotion) finish();
    else {
      panelAnimation = animate(panel, { height: [`${panel.getBoundingClientRect().height}px`, '0px'], opacity: [1, 0] }, { duration: .16 });
      panelAnimation.then(finish).catch(() => {});
    }
    if (restoreFocus) (lastOpener?.isConnected ? lastOpener : plot).focus({ preventScroll: true });
    live.textContent = 'Event closed.';
  }

  function pointerPosition(event) {
    const rect = plot.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * layout.width / rect.width, y: (event.clientY - rect.top) * layout.height / rect.height };
  }
  function distanceToPopup(clientX, clientY) {
    const rect = popup.getBoundingClientRect();
    return Math.hypot(Math.max(rect.left - clientX, 0, clientX - rect.right), Math.max(rect.top - clientY, 0, clientY - rect.bottom));
  }
  const inGrid = point => chart.containPixel({ gridIndex: 0 }, [point.x, point.y]);
  const inspectPoint = point => {
    // Every plot position opens the year menu. No per-line hit test competes
    // with that menu, and ECharts handles the shared display coordinates.
    const inspected = chart.convertFromPixel({ xAxisIndex: 0 }, point.x);
    if (Number.isFinite(inspected)) updateYear(inspected);
  };
  // A touch/pen release opens and focuses the menu before its click arrives.
  // Consume only that gesture's retargeted click; a new press or keyboard
  // activation can immediately choose an item, without a timing lockout.
  listen(plot, 'pointerdown', () => { openingPointer = null; }, { capture: true });
  listen(popup, 'click', event => {
    const pointer = openingPointer; openingPointer = null;
    if (pointer === null || event.detail === 0 || ('pointerId' in event && event.pointerId !== pointer)) return;
    event.preventDefault(); event.stopImmediatePropagation();
  }, { capture: true });
  listen(plot, 'pointermove', event => {
    if (popup.contains(event.target) || (event.pointerType !== 'mouse' && !pointerStart)) return;
    if (previewState && !pointerStart) {
      const distance = distanceToPopup(event.clientX, event.clientY);
      const entering = distance < popupDistance && distance < 48;
      popupDistance = distance;
      if (entering) { clearTimeout(hideTimer); return; }
    }
    const point = pointerPosition(event);
    if (!inGrid(point) && !pointerStart) { scheduleHide(); return; }
    inspectPoint(point, event.pointerType === 'mouse' ? 8 : 18);
    if (pointerStart && Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 5) pointerStart.dragged = true;
    if (!pointerStart?.dragged) showYearMenu([x(year), clamp(point.y, layout.gy, layout.gy + layout.gh)]);
    else scheduleHide();
  });
  listen(plot, 'pointerdown', event => {
    if (popup.contains(event.target) || event.button !== 0) return;
    const point = pointerPosition(event); if (!inGrid(point)) return;
    // Suppress compatibility mouse focus after a touch tap opens the menu.
    // Native vertical panning remains governed by touch-action: pan-y.
    if (event.pointerType !== 'mouse') event.preventDefault();
    pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId, dragged: false }; plot.focus({ preventScroll: true });
    if (event.pointerType === 'mouse') plot.setPointerCapture(event.pointerId);
    inspectPoint(point, event.pointerType === 'mouse' ? 8 : 18);
  });
  listen(plot, 'pointerup', event => {
    if (!pointerStart || pointerStart.id !== event.pointerId) return;
    const wasDragged = pointerStart.dragged; pointerStart = null;
    if (plot.hasPointerCapture(event.pointerId)) plot.releasePointerCapture(event.pointerId);
    if (wasDragged) return;
    const point = pointerPosition(event); if (!inGrid(point)) return;
    inspectPoint(point, event.pointerType === 'mouse' ? 8 : 18);
    showYearMenu([x(year), point.y], { immediate: true, focus: true });
    if (event.pointerType !== 'mouse') openingPointer = event.pointerId;
  });
  listen(plot, 'pointercancel', () => { pointerStart = null; hidePreview(); });
  listen(plot, 'pointerleave', scheduleHide);
  listen(popup, 'pointerenter', () => { clearTimeout(hideTimer); clearTimeout(hoverTimer); pendingPreviewKey = ''; });
  listen(popup, 'pointerleave', scheduleHide); listen(popup, 'focusin', () => clearTimeout(hideTimer)); listen(popup, 'focusout', scheduleHide);
  const openYear = opener => {
    showYearMenu([x(year), y(100)], { immediate: true, focus: true, opener });
  };
  listen(element.querySelector('.graph-open-year'), 'click', event => openYear(event.currentTarget));
  const navigateYear = event => {
    const steps = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, PageDown: -1, PageUp: 1 };
    if (event.key in steps) { event.preventDefault(); updateYear(stepYear(year, steps[event.key])); return true; }
    if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); updateYear(event.key === 'Home' ? graphDomain.firstYear : graphDomain.lastYear); return true; }
    return false;
  };
  listen(plot, 'keydown', event => {
    if (popup.contains(event.target)) return;
    if (navigateYear(event)) return;
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openYear(plot); }
  });
  listen(slider, 'input', () => updateYear(slider.value));
  listen(slider, 'keydown', event => {
    if (navigateYear(event)) return;
    if (event.key === 'Enter') { event.preventDefault(); openYear(slider); }
  });
  const wheel = event => {
    if (event.ctrlKey || popup.contains(event.target) || ![plot, slider].includes(document.activeElement)) return;
    const delta = event.deltaY || event.deltaX; if (!delta) return;
    if ((year === graphDomain.lastYear && delta > 0) || (year === graphDomain.firstYear && delta < 0)) return;
    event.preventDefault(); const now = performance.now();
    if (now - wheelEventTime > 180 || Math.sign(delta) !== Math.sign(wheelDelta)) wheelDelta = 0;
    wheelEventTime = now;
    wheelDelta += delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? layout.height : 1);
    if (Math.abs(wheelDelta) >= 40 && now - wheelTime > 110) { updateYear(stepYear(year, wheelDelta)); wheelDelta = 0; wheelTime = now; }
  };
  listen(plot, 'wheel', wheel, { passive: false }); listen(slider, 'wheel', wheel, { passive: false });
  buttons.forEach(button => listen(button, 'click', () => selectView(button.dataset.graphView)));
  labels.forEach(label => listen(label, 'click', () => selectView(`series:${label.dataset.graphSeries}`)));
  listen(window, 'keydown', event => {
    if (event.key !== 'Escape' || (!previewState && !opened)) return;
    event.preventDefault();
    if (previewState) { hidePreview(); plot.focus({ preventScroll: true }); } else closePanel();
  }, { capture: true });
  listen(motionPreference, 'change', () => {
    reducedMotion = motionPreference.matches; chart.setOption({ animation: !reducedMotion }); hidePreview();
    if (reducedMotion) { panelAnimation?.complete(); popupAnimation?.complete(); }
  });
  const observer = new ResizeObserver(() => { cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(resize); });
  observer.observe(plot); resize(); updateYear(year);
  const controller = {
    selectView, setYear: updateYear, openStory, closePanel,
    pointFor(seriesId, selectedYear = year) {
      const index = graphSeries.findIndex(series => series.id === seriesId);
      if (index < 0) return null;
      const chosenYear = snapYear(selectedYear), reading = readingAt(index, chosenYear);
      return positive(reading?.value) ? { x: x(chosenYear), y: y(reading.value) } : null;
    },
    get status() {
      const readings = Object.fromEntries(graphSeries.map((series, index) => [series.id, readingAt(index, year)]));
      return { year, view: selectedView, activeSeries: [...activeSeries], values: Object.fromEntries(graphSeries.map(series => [series.id, readings[series.id]?.value ?? null])), readings, endpoints: Object.fromEntries(graphSeries.map((series, index) => [series.id, endpoints[index]?.value ?? null])), layout: { ...layout }, preview: previewState, opened: opened ? { ...opened } : null, synthetic: false, sourcedHistory: true, reconstructedHistory: true, baselineYear: graphDomain.baselineYear, scale: 'compressed-index', transform: { reference: 100, constant: 1, logBase: Math.E }, domain: { ...graphDomain }, xDomain: { ...xDomain }, renderer: 'echarts-svg' };
    },
    destroy() {
      if (disposed) return;
      hidePreview(); closePanel({ restoreFocus: false, immediate: true }); disposed = true; ++panelRevision;
      observer.disconnect(); cancelAnimationFrame(resizeFrame); panelAnimation?.cancel(); popupAnimation?.cancel();
      disposers.forEach(dispose => dispose()); chart.dispose(); element.replaceChildren();
      element.classList.remove('robotics-graph', 'is-compact'); delete element.__graphController;
      for (const name of ['__researchGraph', '__roboticsGraph']) if (window[name] === controller) delete window[name];
    },
  };
  element.__graphController = controller;
  window.__researchGraph = window.__roboticsGraph = controller;
  return controller;
}

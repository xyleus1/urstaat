import { graphDomain, graphSeries, graphViews, sampleSeries, interpolateSample } from './graph-data.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const formatYear = year => Math.abs(year - Math.round(year)) < .05 ? String(Math.round(year)) : year.toFixed(1);

export function mountGraph(element) {
  if (!element) throw new Error('A graph container is required.');
  if (element.__graphController) return element.__graphController;
  element.classList.add('robotics-graph');
  element.innerHTML = `
    <div class="graph-heading"><h2 id="trajectories-title">From intelligence to work.</h2></div>
    <div class="graph-toolbar" role="group" aria-label="Highlight trajectories">
      ${graphViews.map(view => `<button type="button" data-graph-view="${view.id}" aria-pressed="${view.id === 'all'}">${view.label}</button>`).join('')}
      <span class="graph-status">Illustrative / not a forecast</span>
    </div>
    <div class="graph-stage"><svg class="graph-svg" role="img" aria-labelledby="trajectory-plot-title trajectory-plot-description"><title id="trajectory-plot-title">Six illustrative robotics trajectories, 2015 to 2040</title><desc id="trajectory-plot-description">Move across the plot or use the year slider to follow a dot along each trajectory. Select a view to emphasize one or two lines. These curves are synthetic design-study values, not empirical measurements or forecasts.</desc></svg><div class="graph-labels" role="group" aria-label="Individual trajectories">${graphSeries.map(series => `<button type="button" class="graph-label" data-graph-series="${series.id}" style="--series-color:${series.color}" aria-pressed="false"><span class="graph-label-name">${series.name}</span><span class="graph-label-definition">${series.definition}</span><span class="graph-label-value"></span></button>`).join('')}</div></div>
    <div class="graph-scrubber"><label for="trajectory-year">Explore a year</label><input id="trajectory-year" type="range" min="2015" max="2040" step="0.1" value="2026" aria-label="Year to inspect in the illustrative trajectories"><output for="trajectory-year">2026</output></div>
    <div class="graph-detail"><p class="graph-key"><span><span class="graph-key-line"></span>Context</span><span><span class="graph-key-line dashed"></span>Scenarios</span></p></div>`;
  const svg = element.querySelector('.graph-svg');
  const labels = [...element.querySelectorAll('.graph-label')];
  const buttons = [...element.querySelectorAll('[data-graph-view]')];
  const slider = element.querySelector('input[type="range"]');
  const output = element.querySelector('output');
  const samples = graphSeries.map((_, i) => sampleSeries(i));
  const envelopes = graphSeries.map((_, i) => [sampleSeries(i, -1.2), sampleSeries(i, 1.2)]);
  let year = 2026, selectedView = 'all', activeSeries = new Set(graphSeries.map(s => s.id));
  let layout, crosshair, yearGroup, yearText, dividerText, surface, groups = [], dots = [], halos = [];
  let pointerId = null, resizeFrame = 0, disposed = false;
  const disposers = [];
  const listen = (target, name, fn, options) => { target.addEventListener(name, fn, options); disposers.push(() => target.removeEventListener(name, fn, options)); };
  function svgElement(tag, attributes = {}, text) {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
    if (text != null) node.textContent = text;
    return node;
  }
  const append = (parent, tag, attributes, text) => { const node = svgElement(tag, attributes, text); parent.append(node); return node; };
  const x = value => layout.gx + (value - 2015) / 25 * layout.gw;
  const y = value => layout.gy + layout.gh - value / 100 * layout.gh;
  const path = points => points.map((point, i) => `${i ? 'L' : 'M'}${x(point.year).toFixed(3)} ${y(point.value).toFixed(3)}`).join(' ');

  function renderLayout() {
    const width = Math.max(250, Math.round(element.getBoundingClientRect().width));
    const compact = width < 980;
    const plotHeight = width < 500 ? 290 : compact ? 370 : 400;
    layout = { width, compact, gx: width < 500 ? 33 : 42, gy: 57, gh: plotHeight, gw: width - (compact ? 54 : 312), height: plotHeight + 118 };
    element.classList.toggle('is-compact', compact);
    svg.setAttribute('viewBox', `0 0 ${width} ${layout.height}`);
    svg.setAttribute('height', layout.height);
    svg.querySelectorAll(':scope > g, :scope > rect, :scope > path').forEach(node => node.remove());
    groups = []; dots = []; halos = [];
    const grid = append(svg, 'g', { 'aria-hidden': 'true' });
    append(grid, 'rect', { x: x(2026), y: layout.gy, width: x(2040) - x(2026), height: layout.gh, class: 'graph-future-field' });
    for (let i = 0; i <= 50; i++) append(grid, 'path', { d: `M${layout.gx + i / 50 * layout.gw} ${layout.gy}v${layout.gh}`, class: `graph-grid-line${i % 10 === 0 ? ' major' : ''}` });
    for (let i = 0; i <= 20; i++) append(grid, 'path', { d: `M${layout.gx} ${layout.gy + i / 20 * layout.gh}h${layout.gw}`, class: `graph-grid-line${i % 2 === 0 ? ' major' : ''}` });
    append(grid, 'text', { x: layout.gx, y: 14, class: 'graph-axis-caption' }, width < 500 ? 'Synthetic index' : 'Relative trajectory / synthetic index');
    append(grid, 'text', { x: layout.gx + layout.gw, y: 14, class: 'graph-axis-caption', 'text-anchor': 'end' }, 'Possible paths');
    for (let value = 0; value <= 100; value += 10) append(grid, 'text', { x: layout.gx - 12, y: y(value) + 3.5, class: 'graph-axis-text', 'text-anchor': 'end' }, value);
    const years = width < 420 ? [2015, 2020, 2025, 2030, 2035, 2040] : [2015, 2020, 2025, 2030, 2035, 2040];
    years.forEach(value => append(grid, 'text', { x: x(value), y: layout.gy + layout.gh + 25, class: 'graph-axis-text', 'text-anchor': 'middle' }, value));
    if (width >= 720) {
      append(grid, 'text', { x: x(2015), y: layout.height - 7, class: 'graph-era-label' }, 'Early systems');
      append(grid, 'text', { x: x(2023), y: layout.height - 7, class: 'graph-era-label', 'text-anchor': 'middle' }, 'General-purpose learning');
      append(grid, 'text', { x: x(2036), y: layout.height - 7, class: 'graph-era-label', 'text-anchor': 'middle' }, 'Deployment at scale?');
    }
    append(grid, 'path', { d: `M${x(2026)} ${layout.gy}v${layout.gh}`, class: 'graph-divider' });
    dividerText = append(grid, 'text', { x: x(2026) + 5, y: layout.gy + 14, class: 'graph-divider-label' }, '2026');

    graphSeries.forEach((series, index) => {
      const group = append(svg, 'g', { class: 'graph-series', 'data-series': series.id, 'aria-hidden': 'true' });
      envelopes[index].forEach(points => append(group, 'path', { d: path(points.slice(110)), stroke: series.color, class: 'graph-scenario-line', 'stroke-dasharray': '2 4' }));
      append(group, 'path', { d: path(samples[index].slice(0, 111)), stroke: series.color, class: 'graph-main-line graph-context-line' });
      append(group, 'path', { d: path(samples[index].slice(110)), stroke: series.color, class: 'graph-main-line graph-future-line', 'stroke-dasharray': '5 4' });
      [50, 100, 150, 200, 250].forEach(indexPoint => append(group, 'circle', { cx: x(samples[index][indexPoint].year), cy: y(samples[index][indexPoint].value), r: 1.65, fill: series.color }));
      const label = labels[index];
      if (!compact) {
        const labelY = layout.gy - 40 + series.rail / 400 * layout.gh;
        const labelX = layout.gx + layout.gw + 49;
        label.style.left = `${labelX}px`; label.style.top = `${labelY}px`; label.style.width = `${width - labelX}px`;
        const endpoint = samples[index][250];
        append(group, 'path', { d: `M${x(2040)} ${y(endpoint.value)}h14L${labelX - 15} ${labelY + 8}h10`, stroke: series.color, 'stroke-width': .8 });
      }
      groups.push(group);
    });
    const interaction = append(svg, 'g', { 'aria-hidden': 'true' });
    crosshair = append(interaction, 'path', { class: 'graph-crosshair' });
    graphSeries.forEach(series => {
      halos.push(append(interaction, 'circle', { r: 8, fill: series.color, class: 'graph-dot-halo', 'data-dot-halo': series.id }));
      dots.push(append(interaction, 'circle', { r: 4, fill: series.color, class: 'graph-dot', 'data-dot': series.id }));
    });
    yearGroup = append(interaction, 'g', { class: 'graph-cursor-year' });
    append(yearGroup, 'rect', { x: -28, y: 0, width: 56, height: 21 });
    yearText = append(yearGroup, 'text', { x: 0, y: 14, 'text-anchor': 'middle' });
    surface = append(svg, 'rect', { x: layout.gx, y: layout.gy, width: layout.gw, height: layout.gh, class: 'graph-pointer-surface', 'aria-hidden': 'true' });
    updateView(); updateYear(year);
  }

  function updateYear(next) {
    year = clamp(Number(next) || 2015, 2015, 2040);
    if (!layout || !crosshair) return;
    const currentX = x(year), formatted = formatYear(year);
    crosshair.setAttribute('d', `M${currentX} ${layout.gy}v${layout.gh}`);
    yearGroup.setAttribute('transform', `translate(${clamp(currentX, layout.gx + 28, layout.gx + layout.gw - 28)},${layout.gy - 28})`);
    yearText.textContent = formatted;
    dividerText.style.opacity = Math.abs(currentX - x(2026)) < 55 ? '0' : '1';
    graphSeries.forEach((series, index) => {
      const value = interpolateSample(samples[index], year);
      for (const node of [dots[index], halos[index]]) { node.setAttribute('cx', currentX); node.setAttribute('cy', y(value)); }
      labels[index].querySelector('.graph-label-value').textContent = `${formatted} / ${value.toFixed(1)}`;
      labels[index].setAttribute('aria-label', `Highlight ${series.name}. Synthetic index ${value.toFixed(1)} at ${formatted}.`);
    });
    slider.value = year.toFixed(1); slider.setAttribute('aria-valuetext', `${formatted}, synthetic trajectory indices`); output.value = formatted; output.textContent = formatted;
  }

  function updateView() {
    const focused = activeSeries.size < graphSeries.length;
    graphSeries.forEach((series, index) => {
      const active = activeSeries.has(series.id);
      groups[index]?.classList.toggle('is-muted', !active);
      groups[index]?.classList.toggle('is-selected', focused && active);
      dots[index]?.classList.toggle('is-muted', !active);
      halos[index]?.classList.toggle('is-muted', !active);
      dots[index]?.setAttribute('r', focused && active ? 4.6 : 3.8);
      labels[index].classList.toggle('is-muted', !active);
      labels[index].setAttribute('aria-pressed', String(activeSeries.size === 1 && active));
    });
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.graphView === selectedView)));
  }
  function selectView(id) {
    const view = graphViews.find(view => view.id === id);
    const solo = graphSeries.find(series => id === `series:${series.id}`);
    if (!view && !solo) throw new Error(`Unknown graph view: ${id}`);
    selectedView = id; activeSeries = new Set(view ? view.series : [solo.id]); updateView();
  }
  function pointerYear(event) {
    const rect = svg.getBoundingClientRect();
    const px = (event.clientX - rect.left) * layout.width / rect.width;
    return 2015 + (px - layout.gx) / layout.gw * 25;
  }
  listen(svg, 'pointerdown', event => {
    if (!event.target.classList.contains('graph-pointer-surface')) return;
    pointerId = event.pointerId;
    svg.setPointerCapture(event.pointerId);
    updateYear(pointerYear(event));
  });
  listen(svg, 'pointermove', event => {
    if (event.pointerType === 'mouse' && event.target.classList.contains('graph-pointer-surface') || pointerId === event.pointerId) updateYear(pointerYear(event));
  });
  const releasePointer = event => { if (pointerId === event.pointerId) { if (svg.hasPointerCapture(pointerId)) svg.releasePointerCapture(pointerId); pointerId = null; } };
  listen(svg, 'pointerup', releasePointer); listen(svg, 'pointercancel', releasePointer);
  buttons.forEach(button => listen(button, 'click', () => selectView(button.dataset.graphView)));
  labels.forEach(label => listen(label, 'click', () => selectView(`series:${label.dataset.graphSeries}`)));
  listen(slider, 'input', () => updateYear(slider.value));
  const observer = new ResizeObserver(() => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => { if (!disposed) renderLayout(); });
  });
  observer.observe(element);
  renderLayout();
  const controller = {
    selectView,
    setYear: updateYear,
    get status() { return { year, view: selectedView, activeSeries: [...activeSeries], values: Object.fromEntries(graphSeries.map((series, index) => [series.id, interpolateSample(samples[index], year)])), layout: { ...layout }, synthetic: true }; },
    destroy() { disposed = true; observer.disconnect(); cancelAnimationFrame(resizeFrame); disposers.forEach(dispose => dispose()); element.innerHTML = ''; element.classList.remove('robotics-graph', 'is-compact'); delete element.__graphController; },
  };
  element.__graphController = controller;
  window.__roboticsGraph = controller;
  return controller;
}

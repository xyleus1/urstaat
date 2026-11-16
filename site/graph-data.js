import { observedSeries } from './graph-observations.js?v=observed-1';

// Every numeric point comes from a source observation. Narrative events and
// future storyboards are deliberately not numerical inputs to this chart.
export const graphDomain = Object.freeze({ firstYear: 2015, lastYear: 2040, dividerYear: 2026, baselineYear: 2020, minimum: 0, maximum: 225, interval: 25 });
export const graphSeries = Object.freeze([
  { id: 'llm', name: 'LLM performance', color: '#8EAAF0' },
  { id: 'humanoid', name: 'Humanoid development', color: '#D98B6A' },
  { id: 'specialist', name: 'Specialist robots', color: '#A4BB8E' },
  { id: 'deployment', name: 'Robot deployment', color: '#F07855' },
  { id: 'data', name: 'Interaction data', color: '#C8B57A' },
  { id: 'hardware', name: 'Robot hardware prices', color: '#B6A3CE' },
].map(series => Object.freeze({ ...series, ...observedSeries[series.id] })));
export const graphViews = Object.freeze([
  { id: 'all', label: 'All systems', series: graphSeries.map(series => series.id) },
  { id: 'intelligence', label: 'Intelligence → action', series: ['llm', 'humanoid'] },
  { id: 'data', label: 'The data bottleneck', series: ['data', 'llm'] },
  { id: 'deployment', label: 'Deployment', series: ['deployment', 'hardware'] },
  { id: 'specialist', label: 'Specialist robots', series: ['specialist'] },
]);

export function sampleSeries(seriesIndex) {
  const series = graphSeries[seriesIndex];
  if (!series.observations.length) return [];
  const baseline = series.observations.find(point => point.year === series.baselineYear);
  if (!baseline || baseline.value <= 0 || baseline.value !== series.baselineValue) throw new Error(`Invalid observed baseline: ${series.id}`);
  return series.observations.map(point => ({ ...point, raw: point.value, value: point.value / baseline.value * 100 }));
}

export function snapYear(value) {
  const year = Number(value);
  return Math.round(Math.max(graphDomain.firstYear, Math.min(graphDomain.lastYear, Number.isFinite(year) ? year : graphDomain.dividerYear)));
}

// Interpolation is only the straight visual connector between adjacent annual
// observations. It never fills a missing year or extends a measured series.
export function interpolateSample(points, year) {
  const exact = points.find(point => point.year === year);
  if (exact) return exact.value;
  const right = points.findIndex(point => point.year > year);
  if (right <= 0) return null;
  const before = points[right - 1], after = points[right];
  if (after.year - before.year !== 1) return null;
  return before.value + (after.value - before.value) * (year - before.year);
}

export const formatIndex = value => Number.isFinite(value) ? value.toFixed(1) : '—';
export function formatRaw(series, value) {
  if (!Number.isFinite(value)) return '';
  if (series.unit === 'percent') return `${value.toFixed(1)}%`;
  if (series.unit === 'index') return `${value.toFixed(2)} source index`;
  return `${new Intl.NumberFormat('en-US').format(value)} ${series.unit}`;
}

export function findLineHits(samples, activeIds, point, layout, tolerance = 8) {
  const px = year => layout.gx + (year - graphDomain.firstYear) / (graphDomain.lastYear - graphDomain.firstYear) * layout.gw;
  const py = value => layout.gy + layout.gh * (1 - value / graphDomain.maximum);
  const hits = [];
  graphSeries.forEach((series, seriesIndex) => {
    if (!activeIds.has(series.id)) return;
    let distance = Infinity;
    const points = samples[seriesIndex];
    points.forEach(sample => { distance = Math.min(distance, Math.hypot(point.x - px(sample.year), point.y - py(sample.value))); });
    for (let i = 1; i < points.length; i++) {
      if (points[i].year - points[i - 1].year !== 1) continue;
      const ax = px(points[i - 1].year), bx = px(points[i].year);
      if (point.x < ax - tolerance || point.x > bx + tolerance) continue;
      const ay = py(points[i - 1].value), by = py(points[i].value);
      const dx = bx - ax, dy = by - ay;
      const t = Math.max(0, Math.min(1, ((point.x - ax) * dx + (point.y - ay) * dy) / (dx * dx + dy * dy)));
      distance = Math.min(distance, Math.hypot(point.x - ax - t * dx, point.y - ay - t * dy));
    }
    if (distance <= tolerance) hits.push({ id: series.id, seriesIndex, distance });
  });
  return hits.sort((a, b) => a.distance - b.distance);
}

export function placeEndpointLabels(endpoints, top, bottom, gap = 90) {
  const sorted = endpoints.map(endpoint => ({ ...endpoint })).sort((a, b) => a.y - b.y);
  sorted.forEach((endpoint, i) => { endpoint.labelY = Math.max(endpoint.y - 8, i ? sorted[i - 1].labelY + gap : top); });
  if (sorted.length && sorted.at(-1).labelY > bottom) {
    sorted.at(-1).labelY = bottom;
    for (let i = sorted.length - 2; i >= 0; i--) sorted[i].labelY = Math.min(sorted[i].labelY, sorted[i + 1].labelY - gap);
  }
  return sorted;
}

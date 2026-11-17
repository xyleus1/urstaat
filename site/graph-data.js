import { observedGraph } from './graph-observations.js?v=continuous-indices-1';
import { scaleSymlog } from './vendor/scale-vendor.js?v=continuous-indices-1';

// Numeric observations and scenario samples are generated offline from the
// audited source snapshot. The browser selects, formats and projects them.
export const graphDomain = Object.freeze(observedGraph.domain);
export const scenarioParameters = Object.freeze(observedGraph.scenarioParameters);
// The same compression is used for every line. It changes display coordinates,
// never the fixed 2025 normalization or the values shown to a reader.
const commonDisplayScale = scaleSymlog().constant(1)
  .domain([-1, 1]).range([-Math.LN2, Math.LN2]);
export function displayValue(index) {
  return index > 0 && Number.isFinite(index) ? commonDisplayScale(Math.log(index / 100)) : NaN;
}
export function inverseDisplayValue(value) {
  return Number.isFinite(value) ? 100 * Math.exp(commonDisplayScale.invert(value)) : NaN;
}
export const graphSeries = Object.freeze([
  { id: 'llm', name: 'LLM performance', color: '#8EAAF0' },
  { id: 'humanoid', name: 'Humanoid development', color: '#D98B6A' },
  { id: 'specialist', name: 'Specialist robots', color: '#A4BB8E' },
  { id: 'deployment', name: 'Robot deployment', color: '#F07855' },
  { id: 'data', name: 'Interaction data', color: '#C8B57A' },
  { id: 'hardware', name: 'Hardware cost', color: '#B6A3CE' },
].map(item => Object.freeze({ ...item, ...observedGraph.series[item.id] })));

export const graphViews = Object.freeze([
  { id: 'all', label: 'All systems', series: graphSeries.map(series => series.id) },
  { id: 'intelligence', label: 'Intelligence → action', series: ['llm', 'humanoid'] },
  { id: 'data', label: 'The data bottleneck', series: ['data', 'llm'] },
  { id: 'deployment', label: 'Deployment', series: ['deployment', 'hardware'] },
  { id: 'specialist', label: 'Specialist robots', series: ['specialist'] },
]);

const observations = graphSeries.map(series => new Map(series.observations.map(point => [point.year, Object.freeze(point)])));
const reconstructions = graphSeries.map(series => new Map(series.reconstructed.map(point => [point.year, Object.freeze(point)])));
const projections = graphSeries.map(series => new Map(series.projections.map(point => [point.year, Object.freeze({
  ...point, ...series.scenario, kind: 'scenario', date: String(point.year), approximate: true,
  precision: 'Modeled value; no observation is implied',
})])));

const samples = graphSeries.map((series, index) => {
  return Object.freeze(series.samples.map(point => {
    if (Number.isInteger(point.year)) return readingAt(index, point.year);
    const future = point.year > series.scenario.startYear;
    return Object.freeze({
      ...point, kind: future ? 'scenario' : 'reconstructed',
      visualInterpolation: true, approximate: true, coverage: 'visual-interpolation',
      reconstructionMethod: 'pchip-visual-interpolation',
      sourceName: future ? series.scenario.sourceName : 'Historical reconstruction',
      sourceUrl: future ? series.scenario.sourceUrl : 'sources/#trajectories',
      detail: series.interpolation.detail,
    });
  }));
});

export function sampleSeries(index) { return samples[index] || []; }

export function readingAt(index, year) {
  const target = Number(year);
  if (!Number.isInteger(target) || target < graphDomain.firstYear || target > graphDomain.lastYear) return null;
  return observations[index]?.get(target) || reconstructions[index]?.get(target) || projections[index]?.get(target) || null;
}

export function snapYear(value) {
  const year = Number(value);
  return Math.round(Math.max(graphDomain.firstYear, Math.min(graphDomain.lastYear, Number.isFinite(year) ? year : graphDomain.dividerYear)));
}

export function interpolateSample(points, year) {
  if (!Number.isFinite(year) || !points.length) return null;
  const exact = points.find(point => Math.abs(point.year - year) < 1e-8);
  if (exact) return Number.isFinite(exact.value) ? exact.value : null;
  const right = points.findIndex(point => point.year > year);
  if (right <= 0) return null;
  const before = points[right - 1], after = points[right];
  if (!(before.value > 0) || !(after.value > 0)) return null;
  const fraction = (year - before.year) / (after.year - before.year);
  // Dense PCHIP samples are interpolated in the same common display coordinate.
  // This helper supplies visual positions; annual readouts use readingAt().
  return inverseDisplayValue(displayValue(before.value) + (displayValue(after.value) - displayValue(before.value)) * fraction);
}

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumSignificantDigits: 3 });
const integer = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const significant = (value, digits = 3) => Number(value.toPrecision(digits)).toString();

export function formatIndex(value) {
  if (!Number.isFinite(value)) return '—';
  if (Math.abs(value) >= 1000) return compact.format(value);
  if (Math.abs(value) >= 10) return value.toFixed(1);
  return significant(value, 3);
}

export function formatRaw(series, value) {
  if (!Number.isFinite(value)) return '—';
  if (series.unit === 'minutes') {
    if (value < 1) return `${significant(value * 60)} human-seconds`;
    if (value < 60) return `${significant(value)} human-minutes`;
    if (value < 120000) return `${significant(value / 60)} human-hours`;
    return `${significant(value / 120000)} work-years (2,000 h/year)`;
  }
  if (series.unit === 'success-normalized return') return `${value.toFixed(3)} success-normalized return`;
  if (series.unit === 'source index') return `${value.toFixed(2)} BOJ source index`;
  return `${integer.format(value)} ${series.unit}`;
}

// Optional projector permits ECharts convertToPixel. The fallback follows the
// same common compressed domain as the chart.
export function findLineHits(allSamples, activeIds, point, layout, tolerance = 8, project) {
  const map = project || ((year, value) => [
    layout.gx + (year - graphDomain.firstYear) / (graphDomain.lastYear - graphDomain.firstYear) * layout.gw,
    layout.gy + layout.gh * (1 - (displayValue(value) - graphDomain.displayMinimum) / (graphDomain.displayMaximum - graphDomain.displayMinimum)),
  ]);
  const distanceToSegment = (ax, ay, bx, by) => {
    const dx = bx - ax, dy = by - ay;
    const fraction = Math.max(0, Math.min(1, ((point.x - ax) * dx + (point.y - ay) * dy) / (dx * dx + dy * dy || 1)));
    return Math.hypot(point.x - ax - fraction * dx, point.y - ay - fraction * dy);
  };
  const hits = [];
  graphSeries.forEach((series, seriesIndex) => {
    if (!activeIds.has(series.id)) return;
    let distance = Infinity;
    const points = allSamples[seriesIndex];
    for (let index = 0; index < points.length; index++) {
      const current = points[index], previous = points[index - 1];
      if (!(current.value > 0)) continue;
      const [bx, by] = map(current.year, current.value);
      distance = Math.min(distance, Math.hypot(point.x - bx, point.y - by));
      if (!(previous?.value > 0)) continue;
      const [ax, ay] = map(previous.year, previous.value);
      distance = Math.min(distance, distanceToSegment(ax, ay, bx, by));
    }
    if (distance <= tolerance) hits.push({ id: series.id, seriesIndex, distance });
  });
  return hits.sort((a, b) => a.distance - b.distance);
}

export function placeEndpointLabels(endpoints, top, bottom, gap = 57) {
  const sorted = endpoints.map(endpoint => ({ ...endpoint })).sort((a, b) => a.y - b.y);
  sorted.forEach((endpoint, index) => { endpoint.labelY = Math.max(endpoint.y - 8, index ? sorted[index - 1].labelY + gap : top); });
  if (sorted.length && sorted.at(-1).labelY > bottom) {
    sorted.at(-1).labelY = bottom;
    for (let index = sorted.length - 2; index >= 0; index--) sorted[index].labelY = Math.min(sorted[index].labelY, sorted[index + 1].labelY - gap);
  }
  return sorted;
}

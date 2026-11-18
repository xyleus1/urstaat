import { graphModel } from './graph-model.js?v=editorial-cleanup-1';
import { scaleSymlog } from './vendor/scale-vendor.js?v=continuous-indices-1';

// Numeric observations and scenario samples are generated offline from the
// audited source snapshot. The browser selects, formats and projects them.
export const graphDomain = Object.freeze(graphModel.domain);
export const scenarioParameters = Object.freeze(graphModel.scenarioParameters);
// Preserve the established plot coordinates and native 2025-normalized data.
const commonDisplayScale = scaleSymlog().constant(1)
  .domain([-1, 1]).range([-Math.LN2, Math.LN2]);
export function displayValue(index) {
  return index > 0 && Number.isFinite(index) ? commonDisplayScale(Math.log(index / 100)) : NaN;
}
export function inverseDisplayValue(value) {
  return Number.isFinite(value) ? 100 * Math.exp(commonDisplayScale.invert(value)) : NaN;
}
// One shared presentation scale keeps 2025 at 100 and the chart ceiling at
// 10,000. This is display compression, not a change to source or scenario data.
export const indexPresentation = Object.freeze({
  baseline: 100,
  maximum: 10000,
  power: Math.log(10000 / 100) / Math.log(graphDomain.maximum / 100),
});
export function compressIndex(value) {
  return Number.isFinite(value) && value > 0
    ? indexPresentation.baseline * (value / indexPresentation.baseline) ** indexPresentation.power : NaN;
}
export function uncompressIndex(value) {
  return Number.isFinite(value) && value > 0
    ? indexPresentation.baseline * (value / indexPresentation.baseline) ** (1 / indexPresentation.power) : NaN;
}
export const graphSeries = Object.freeze([
  { id: 'llm', name: 'LLM performance', color: '#8EAAF0' },
  { id: 'humanoid', name: 'Humanoid deployment', color: '#D98B6A' },
  { id: 'specialist', name: 'Specialist robots', color: '#A4BB8E' },
  { id: 'deployment', name: 'Robot deployment', color: '#F07855' },
  { id: 'data', name: 'Interaction data', color: '#C8B57A' },
  { id: 'hardware', name: 'Hardware cost', color: '#B6A3CE' },
].map(item => Object.freeze({ ...item, ...graphModel.series[item.id] })));

export const graphViews = Object.freeze([
  { id: 'all', label: 'All systems', series: graphSeries.map(series => series.id) },
  { id: 'intelligence', label: 'Intelligence → action', series: ['llm', 'humanoid'] },
  { id: 'data', label: 'The data bottleneck', series: ['data', 'llm'] },
  { id: 'deployment', label: 'Deployment', series: ['deployment', 'humanoid', 'hardware'] },
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

// Inspection stops are independent of the continuous drawing samples and the
// annual model readings. Keep the historical boundary before future milestones.
export const inspectionYears = Object.freeze([
  ...Array.from({ length: graphDomain.dividerYear - graphDomain.firstYear + 1 }, (_, index) => graphDomain.firstYear + index),
  ...Array.from({ length: Math.floor(graphDomain.lastYear / 5) - Math.floor(graphDomain.dividerYear / 5) }, (_, index) => (Math.floor(graphDomain.dividerYear / 5) + index + 1) * 5),
]);

export function snapYear(value) {
  const numeric = Number(value);
  const year = Math.max(graphDomain.firstYear, Math.min(graphDomain.lastYear, Number.isFinite(numeric) ? numeric : graphDomain.dividerYear));
  // A midpoint advances to the later stop, matching historical year rounding.
  return inspectionYears.reduce((nearest, candidate) => Math.abs(candidate - year) <= Math.abs(nearest - year) ? candidate : nearest);
}

export function stepYear(value, direction) {
  const index = inspectionYears.indexOf(snapYear(value));
  const step = direction > 0 ? 1 : direction < 0 ? -1 : 0;
  return inspectionYears[Math.max(0, Math.min(inspectionYears.length - 1, index + step))];
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

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumSignificantDigits: 1 });
const roughIndex = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 1 });

export function formatIndex(value) {
  const compressed = compressIndex(value);
  return Number.isFinite(compressed) ? roughIndex.format(compressed) : '—';
}

export function formatRaw(series, value) {
  if (!Number.isFinite(value)) return '—';
  if (series.unit === 'minutes') {
    if (value < 1) return `${compact.format(value * 60)} human-seconds`;
    if (value < 60) return `${compact.format(value)} human-minutes`;
    if (value < 120000) return `${compact.format(value / 60)} human-hours`;
    return `${compact.format(value / 120000)} work-years (2,000 h/year)`;
  }
  if (series.unit === 'success-normalized return') return `${compact.format(value)} success-normalized return`;
  if (series.unit === 'source index') return `${compact.format(value)} BOJ source index`;
  return `${compact.format(value)} ${series.unit}`;
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

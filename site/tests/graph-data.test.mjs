import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  graphSeries, graphViews, graphDomain, sampleSeries, readingAt, scenarioParameters,
  snapYear, inspectionYears, interpolateSample, formatIndex, formatRaw, placeEndpointLabels,
} from '../graph-data.js';

const byId = id => graphSeries.findIndex(series => series.id === id);
const at = (id, year) => readingAt(byId(id), year);
const close = (actual, expected, tolerance = 1e-8) => {
  assert.ok(Number.isFinite(actual), `Expected finite value, received ${actual}`);
  assert.ok(Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)), `${actual} ≈ ${expected}`);
};
const baselines = {
  llm: 66.002649, humanoid: 16000, specialist: 603307,
  deployment: 603307, data: 1258322, hardware: 105.70833333333334,
};
const audited = JSON.parse(readFileSync(new URL('./observed-baseline.json', import.meta.url), 'utf8'));
const displayCoordinate = value => {
  const logRatio = Math.log(value / 100);
  return Math.sign(logRatio) * Math.log1p(Math.abs(logRatio));
};

test('all six indices use sourced 2025 denominators and retain raw units', () => {
  assert.equal(graphDomain.baselineYear, 2025);
  assert.equal(graphSeries.length, 6);
  for (const series of graphSeries) {
    const point = at(series.id, 2025);
    assert.equal(point.kind, 'observed');
    close(series.baselineValue, baselines[series.id]);
    close(point.raw, baselines[series.id]);
    close(point.value, 100);
    assert.match(point.sourceUrl, /^https:\/\//);
    assert.ok(series.metric && series.unit && series.definition);
    for (const year of [2020, 2024, 2026, 2031, 2040]) {
      const reading = at(series.id, year);
      if (reading) close(reading.value / 100 * series.baselineValue, reading.raw);
    }
  }
  assert.equal(graphSeries[byId('hardware')].name, 'Hardware cost');
});

test('all active audited observations survive without changing values, dates, or intervals', () => {
  for (const baseline of audited.series) {
    const series = graphSeries[byId(baseline.id)];
    assert.equal(series.observations.length, baseline.points.length, `${baseline.id} has no invented observations`);
    for (const expected of baseline.points) {
      const point = at(baseline.id, expected.year);
      assert.equal(point.kind, 'observed');
      close(point.raw, expected.raw);
      close(point.value, expected.value);
      assert.equal(point.date, expected.date);
      for (const key of ['ciLowRaw', 'ciHighRaw']) assert.equal(point[key], expected[key]);
      assert.match(point.sourceUrl, /^https:\/\//);
      assert.ok(point.coverage && point.detail, `${baseline.id}/${expected.year} retains provenance`);
    }
  }
});

test('unreported humanoid counts stay absent while other historical curves remain continuous', () => {
  for (const series of graphSeries) for (let year = 2015; year <= 2025; year++) {
    const point = at(series.id, year);
    if (series.id === 'humanoid' && year < 2025) {
      assert.equal(point, null, 'Benchmark returns must not become invented deployment counts');
      continue;
    }
    assert.ok(point && point.raw > 0 && point.value > 0, `${series.id}/${year} is represented`);
    const observed = audited.series.find(item => item.id === series.id).points.some(item => item.year === year);
    assert.equal(point.kind, observed ? 'observed' : 'reconstructed');
    if (!observed) {
      assert.equal(point.approximate, true);
      assert.ok(point.reconstructionMethod && point.anchorYears?.length, `${series.id}/${year} explains its estimate`);
      assert.equal(point.ciLowRaw, undefined);
      assert.equal(point.ciHighRaw, undefined);
    }
  }
  assert.ok(interpolateSample(sampleSeries(byId('llm')), 2021) > 0);
  for (const id of ['specialist', 'deployment']) assert.equal(at(id, 2015).kind, 'observed');
  for (const id of ['llm', 'data', 'hardware']) assert.equal(at(id, 2015).kind, 'reconstructed');
  assert.equal(at('humanoid', 2025).kind, 'observed');
  assert.equal(at('humanoid', 2025).approximate, true);
});

test('dense continuous curves preserve annual knots and never overshoot adjacent readings', () => {
  for (const series of graphSeries) {
    const samples = sampleSeries(byId(series.id));
    const firstYear = series.id === 'humanoid' ? 2025 : 2015;
    assert.equal(samples.length, (2040 - firstYear) * 20 + 1, `${series.id} has twenty samples per available year`);
    assert.equal(samples[0].year, firstYear);
    assert.equal(samples.at(-1).year, 2040);
    samples.forEach((point, index) => {
      close(point.year, firstYear + index * .05);
      assert.ok(Number.isFinite(point.value) && point.value > 0);
      if (Number.isInteger(point.year)) {
        const annual = at(series.id, point.year);
        close(point.value, annual.value);
        assert.equal(point.kind, annual.kind);
      } else {
        assert.equal(point.visualInterpolation, true);
        assert.notEqual(point.kind, 'observed', 'Drawing between samples cannot invent an observation');
        const before = at(series.id, Math.floor(point.year)).value;
        const after = at(series.id, Math.ceil(point.year)).value;
        const slack = 1e-8 * Math.max(before, after);
        assert.ok(point.value >= Math.min(before, after) - slack && point.value <= Math.max(before, after) + slack, `${series.id}/${point.year} stays inside its annual bracket`);
      }
    });
    // In the shared display transform, finite differences on either side of
    // each knot converge. This catches visible corners and release-inventory
    // jumps without requiring a particular interpolation implementation.
    for (let index = 20; index < samples.length - 20; index += 20) {
      const left = displayCoordinate(samples[index - 1].value);
      const knot = displayCoordinate(samples[index].value);
      const right = displayCoordinate(samples[index + 1].value);
      const localRange = Math.abs(displayCoordinate(samples[index + 20].value) - knot) + Math.abs(knot - displayCoordinate(samples[index - 20].value));
      assert.ok(Math.abs(right - 2 * knot + left) <= .025 * localRange + 1e-10, `${series.id}/${samples[index].year} has no visible derivative break`);
    }
  }
});

test('episode inventory counts Alpha/Beta once and preserves release accounting', () => {
  close(at('data', 2019).raw, 162417);
  for (let year = 2020; year <= 2023; year++) close(at('data', year).raw, 162417);
  close(at('data', 2024).raw, 162417 + 92233 + 92214);
  close(at('data', 2025).raw, 162417 + 92233 + 1003672);
  close(at('data', 2025).raw - at('data', 2024).raw, 1003672 - 92214);
  for (let year = 2019; year <= 2026; year++) {
    assert.equal(at('data', year).coverage, 'release-inventory');
    assert.ok(at('data', year).lastReleaseDate);
  }
});

test('published confidence bounds use the central baseline, without fake forecast bands', () => {
  close(at('llm', 2026).ciLowRaw, 97.302920);
  close(at('llm', 2026).ciHighRaw, 398.514614);
  for (const id of ['llm']) {
    const series = graphSeries[byId(id)];
    for (const year of [2025, 2026]) {
      const point = at(id, year);
      assert.ok(point.ciLowRaw <= point.raw && point.ciHighRaw >= point.raw);
      close(point.ciLow, 100 * point.ciLowRaw / series.baselineValue);
      close(point.ciHigh, 100 * point.ciHighRaw / series.baselineValue);
    }
    assert.equal(at(id, 2035).ciLow, undefined);
    assert.equal(at(id, 2035).ciHigh, undefined);
  }
  for (const year of [2025, 2026, 2035, 2040]) {
    assert.equal(at('humanoid', year).ciLowRaw, undefined);
    assert.equal(at('humanoid', year).ciHighRaw, undefined);
  }
});

test('2026 prices are explicit YTD observations and IFR entries remain forecasts', () => {
  const hardware = at('hardware', 2026);
  assert.equal(hardware.kind, 'observed');
  assert.equal(hardware.coverage, 'year-to-date');
  assert.match(hardware.detail, /2026|month|October|Oct|10/i);
  assert.ok(hardware.raw > 0);
  assert.equal(at('specialist', 2026).kind, 'scenario');
  close(at('specialist', 2026).raw, 655000);
  assert.equal(at('deployment', 2026).kind, 'scenario');
  close(at('deployment', 2026).raw, 655000);
  assert.equal(at('humanoid', 2026).kind, 'scenario');
  close(at('humanoid', 2026).raw, 50000);
  assert.match(scenarioParameters.humanoid.forecastQualifier, /more than 50,000/);
  for (const id of ['humanoid', 'deployment']) assert.equal(graphSeries[byId(id)].unit, 'robots/year');
});

test('every projected year is finite and fits the common positive index domain', () => {
  assert.ok(graphDomain.minimum > 0 && graphDomain.maximum > graphDomain.minimum);
  for (const series of graphSeries) {
    for (let year = 2027; year <= 2040; year++) {
      const point = at(series.id, year);
      assert.equal(point.kind, 'scenario');
      assert.ok(Number.isFinite(point.raw) && point.raw > 0);
      assert.ok(point.value >= graphDomain.minimum && point.value <= graphDomain.maximum, `${series.id}/${year} fits`);
    }
    for (const point of sampleSeries(byId(series.id))) {
      if (point.value === null) continue;
      assert.ok(Number.isFinite(point.value) && point.value > 0);
      assert.ok(point.value >= graphDomain.minimum && point.value <= graphDomain.maximum);
    }
  }
});

test('LLM scenario rises toward its declared ceiling and pauses during 2035–2040', () => {
  const p = scenarioParameters.llm;
  close(p.ceilingMinutes, 10 * 2000 * 60);
  assert.ok(p.growthRate > 0);
  for (let year = 2027; year <= 2035; year++) {
    assert.ok(at('llm', year).raw > at('llm', year - 1).raw);
    assert.ok(at('llm', year).raw < p.ceilingMinutes);
  }
  assert.ok(at('llm', 2035).raw > .99 * p.ceilingMinutes);
  for (let year = 2036; year <= 2040; year++) close(at('llm', year).raw, at('llm', 2035).raw);
});

test('interaction data reaches 95% of its pronounced plateau in 2031', () => {
  const p = scenarioParameters.data;
  close(p.ceilingFactor, 30);
  close(at('data', 2031).raw, .95 * p.ceilingEpisodes);
  for (let year = 2027; year <= 2040; year++) {
    assert.ok(at('data', year).raw > at('data', year - 1).raw);
    assert.ok(at('data', year).raw < p.ceilingEpisodes);
  }
});

test('specialist installation decline and hardware cost decline retain their existing anchors', () => {
  for (let year = 2027; year <= 2040; year++) {
    assert.ok(at('hardware', year).raw < at('hardware', year - 1).raw);
  }
  close(scenarioParameters.hardware.floorFraction, .03);
  close(scenarioParameters.hardware.halfLifeYears, 1.1);
  assert.ok(at('hardware', 2031).raw < .1 * at('hardware', 2026).raw);
  assert.ok(at('hardware', 2040).raw > .03 * at('hardware', 2026).raw);
  assert.ok(at('hardware', 2040).raw < .031 * at('hardware', 2026).raw);
  close(at('specialist', 2031).raw, 4 * 603307);
  close(at('specialist', 2040).raw, .25 * 603307);
  for (let year = 2027; year <= 2031; year++) assert.ok(at('specialist', year).raw > at('specialist', year - 1).raw);
  for (let year = 2032; year <= 2040; year++) assert.ok(at('specialist', year).raw < at('specialist', year - 1).raw);
});

test('robot deployments follow the LLM growth, slowdown and pause rather than specialist decline', () => {
  for (let year = 2026; year <= 2040; year++) {
    close(at('deployment', year).raw / at('deployment', 2026).raw,
      at('llm', year).raw / at('llm', 2026).raw);
    if (year > 2026) assert.ok(at('deployment', year).raw >= at('deployment', year - 1).raw);
  }
  assert.ok(at('deployment', 2026).raw > at('deployment', 2025).raw);
  assert.ok(at('deployment', 2040).raw > 1000 * at('deployment', 2026).raw);
  for (let year = 2036; year <= 2040; year++) close(at('deployment', year).raw, at('deployment', 2035).raw);
});

test('humanoids initially grow with robot deployments, then form a smaller modeled fraction', () => {
  assert.deepEqual(graphViews.find(view => view.id === 'deployment').series, ['deployment', 'humanoid', 'hardware']);
  const startShare = at('humanoid', 2026).raw / at('deployment', 2026).raw;
  const firstHumanoidGrowth = at('humanoid', 2027).raw / at('humanoid', 2026).raw;
  const firstRobotGrowth = at('deployment', 2027).raw / at('deployment', 2026).raw;
  assert.ok(firstHumanoidGrowth / firstRobotGrowth > .9, 'Early growth tracks the total closely');
  let previousShare = startShare;
  for (let year = 2026; year <= 2040; year++) {
    const humanoid = at('humanoid', year), robots = at('deployment', year);
    const share = humanoid.raw / robots.raw;
    assert.ok(share > 0 && share < 1);
    assert.ok(share <= previousShare + 1e-12);
    close(humanoid.modeledShare, share);
    close(humanoid.modeledRobotDeployments, robots.raw);
    if (year > 2026) assert.ok(humanoid.raw >= at('humanoid', year - 1).raw);
    previousShare = share;
  }
  assert.ok(previousShare < .02 && previousShare < startShare / 5);
  assert.ok(at('humanoid', 2040).value < at('deployment', 2040).value, 'Total deployments end above humanoids on the normalized graph too');
});

test('natural forecast pacing retains all existing direction changes and inspection milestones', () => {
  const { timing } = scenarioParameters;
  assert.deepEqual(timing.fixedYears, [2026, 2030, 2031, 2035, 2040]);
  for (const offsets of Object.values(timing.offsetYears)) {
    for (const fixed of timing.fixedYears) close(offsets[timing.years.indexOf(fixed)], 0);
    assert.ok(offsets.some(offset => Math.abs(offset) > .1));
    for (let i = 1; i < offsets.length; i++) assert.ok(timing.years[i] + offsets[i] > timing.years[i - 1] + offsets[i - 1]);
  }
});

test('annual input and formatting retain very small estimates and large projections', () => {
  for (let year = 2014; year <= 2041; year += .17) assert.ok(inspectionYears.includes(snapYear(year)));
  assert.equal(snapYear(2015.49), 2015);
  assert.equal(snapYear(2015.5), 2016);
  assert.equal(snapYear(1000), 2015);
  assert.equal(snapYear(3000), 2040);
  assert.equal(snapYear(NaN), 2026);
  for (const value of [null, NaN, 100, 1.8e6]) assert.doesNotMatch(formatIndex(value), /NaN|Infinity|null/);
  const earliest = at('llm', 2019);
  close(earliest.raw, .0128);
  assert.ok(Number(formatIndex(earliest.value).replaceAll(',', '')) > 0, 'A small but measured index must not display as zero');
  assert.ok(parseFloat(formatRaw(graphSeries[byId('llm')], earliest.raw)) > 0, 'Sub-minute task horizons retain significant figures');
  assert.ok(Number(formatIndex(graphDomain.minimum).replaceAll(',', '')) > 0, 'The lowest positive logarithmic tick stays positive');
  for (const series of graphSeries) assert.doesNotMatch(formatRaw(series, at(series.id, 2040).raw), /NaN|Infinity|null/);
});

test('endpoint labels separate the very different projected magnitudes', () => {
  const displayMin = displayCoordinate(graphDomain.minimum), displayMax = displayCoordinate(graphDomain.maximum);
  const endpoints = graphSeries.map(series => ({ id: series.id, y: 57 + 440 * (1 - (displayCoordinate(at(series.id, 2040).value) - displayMin) / (displayMax - displayMin)) }));
  const placed = placeEndpointLabels(endpoints, 52, 452, 57);
  assert.equal(placed[0].id, 'llm');
  assert.ok(placed[0].labelY >= 52 && placed.at(-1).labelY <= 452);
  placed.slice(1).forEach((point, i) => assert.ok(point.labelY - placed[i].labelY >= 57));
});

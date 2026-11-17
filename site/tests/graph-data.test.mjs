import test from 'node:test';
import assert from 'node:assert/strict';
import {
  graphSeries, graphDomain, sampleSeries, readingAt, scenarioParameters,
  snapYear, interpolateSample, formatIndex, formatRaw, placeEndpointLabels,
} from '../graph-data.js';

const byId = id => graphSeries.findIndex(series => series.id === id);
const at = (id, year) => readingAt(byId(id), year);
const close = (actual, expected, tolerance = 1e-8) => {
  assert.ok(Number.isFinite(actual), `Expected finite value, received ${actual}`);
  assert.ok(Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)), `${actual} ≈ ${expected}`);
};
const baselines = {
  llm: 66.002649, humanoid: .776, specialist: 603307,
  deployment: 5079078, data: 1258322, hardware: 105.70833333333334,
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

test('unavailable historical years cannot acquire manufactured values', () => {
  for (const year of [2015, 2018, 2021]) assert.equal(at('llm', year), null);
  for (let year = 2015; year < 2025; year++) assert.equal(at('humanoid', year), null);
  assert.equal(at('data', 2018), null);
  assert.equal(at('hardware', 2019), null);
  close(at('humanoid', 2026).raw, .825);
  close(at('llm', 2026).raw, 185.911829);
  close(at('specialist', 2015).raw, 254000);
  close(at('deployment', 2015).raw, 1632000);
  for (const series of graphSeries) for (let year = 2015; year <= 2025; year++) {
    const point = at(series.id, year);
    if (!point) continue;
    assert.equal(point.kind, 'observed', `${series.id}/${year} is not a backfilled scenario`);
    assert.match(point.sourceUrl, /^https:\/\//);
    assert.ok(point.date && point.coverage && point.detail, `${series.id}/${year} retains provenance`);
  }
  assert.equal(interpolateSample(sampleSeries(byId('llm')), 2021), null);
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
  close(at('humanoid', 2025).ciLowRaw, .705);
  close(at('humanoid', 2025).ciHighRaw, .849);
  close(at('llm', 2026).ciLowRaw, 97.302920);
  close(at('llm', 2026).ciHighRaw, 398.514614);
  for (const id of ['humanoid', 'llm']) {
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
});

test('every projected year is finite and fits one positive logarithmic domain', () => {
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

test('interaction data reaches 95% of its declared plateau in 2031', () => {
  const p = scenarioParameters.data;
  close(p.ceilingFactor, 5.507657446377103);
  close(at('data', 2031).raw, .95 * p.ceilingEpisodes);
  for (let year = 2027; year <= 2040; year++) {
    assert.ok(at('data', year).raw > at('data', year - 1).raw);
    assert.ok(at('data', year).raw < p.ceilingEpisodes);
  }
});

test('humanoid returns, installation decline, and cost decline meet their explicit anchors', () => {
  close(at('humanoid', 2040).raw, 1);
  for (let year = 2027; year <= 2040; year++) {
    assert.ok(at('humanoid', year).raw > at('humanoid', year - 1).raw);
    assert.ok(at('hardware', year).raw < at('hardware', year - 1).raw);
  }
  close(at('hardware', 2031).raw / at('hardware', 2026).raw, .4);
  assert.ok(at('hardware', 2040).raw > .2 * at('hardware', 2026).raw);
  close(at('specialist', 2031).raw, 2 * 603307);
  close(at('specialist', 2040).raw, .5 * 603307);
  for (let year = 2027; year <= 2031; year++) assert.ok(at('specialist', year).raw > at('specialist', year - 1).raw);
  for (let year = 2032; year <= 2040; year++) assert.ok(at('specialist', year).raw < at('specialist', year - 1).raw);
});

test('deployment stock reconciles installations and historically implied attrition', () => {
  const installations = [541302, 542076, 603307];
  const stocks = [3904000, 4282000, 4663698, 5079078];
  const attrition = (installations.reduce((a, b) => a + b, 0) - (stocks.at(-1) - stocks[0]))
    / stocks.slice(0, -1).reduce((a, b) => a + b, 0);
  close(scenarioParameters.deployment.attritionRate, attrition);
  for (let year = 2026; year <= 2040; year++) {
    const prior = at('deployment', year - 1).raw;
    close(at('deployment', year).raw - prior, at('specialist', year).raw - prior * attrition);
  }
  assert.ok(at('deployment', 2026).raw > at('deployment', 2025).raw);
});

test('annual input and formatting handle missing observations and large projections', () => {
  for (let year = 2014; year <= 2041; year += .17) assert.ok(Number.isInteger(snapYear(year)));
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
  const logMin = Math.log10(graphDomain.minimum), logMax = Math.log10(graphDomain.maximum);
  const endpoints = graphSeries.map(series => ({ id: series.id, y: 57 + 440 * (1 - (Math.log10(at(series.id, 2040).value) - logMin) / (logMax - logMin)) }));
  const placed = placeEndpointLabels(endpoints, 52, 452, 57);
  assert.equal(placed[0].id, 'llm');
  assert.ok(placed[0].labelY >= 52 && placed.at(-1).labelY <= 452);
  placed.slice(1).forEach((point, i) => assert.ok(point.labelY - placed[i].labelY >= 57));
});

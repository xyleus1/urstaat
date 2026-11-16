import test from 'node:test';
import assert from 'node:assert/strict';
import { graphSeries, graphDomain, sampleSeries, snapYear, interpolateSample, findLineHits, placeEndpointLabels } from '../graph-data.js';

const samples = graphSeries.map((_, index) => sampleSeries(index));
const seriesIndex = id => graphSeries.findIndex(series => series.id === id);
const pointsFor = id => samples[seriesIndex(id)];
const closeTo = (actual, expected, message) => assert.ok(Math.abs(actual - expected) < 1e-9, message || `${actual} differs from ${expected}`);
const layout = { gx: 44, gy: 57, gw: 800, gh: 440 };
const pointAt = (year, value) => ({
  x: layout.gx + (year - graphDomain.firstYear) / (graphDomain.lastYear - graphDomain.firstYear) * layout.gw,
  y: layout.gy + layout.gh * (1 - value / graphDomain.maximum),
});

test('four sourced measures share an exact observed 2020 baseline', () => {
  assert.equal(graphDomain.baselineYear, 2020);
  const observed = graphSeries.filter(series => series.observations.length);
  assert.deepEqual(observed.map(series => series.id), ['llm', 'specialist', 'deployment', 'hardware']);
  observed.forEach(series => {
    assert.equal(series.baselineYear, 2020);
    assert.equal(pointsFor(series.id).find(point => point.year === 2020).value, 100, `${series.id} baseline`);
  });

  // Independent published-value checks protect against a synthetic curve,
  // a changed denominator, or an accidental inverse-price transformation.
  closeTo(pointsFor('llm').find(point => point.year === 2024).value, 88.7 / 43.9 * 100);
  closeTo(pointsFor('deployment').find(point => point.year === 2025).value, 5079000 / 3027000 * 100);
  closeTo(pointsFor('specialist').find(point => point.year === 2025).value, 11106 / 5989 * 100);
  closeTo(pointsFor('hardware').find(point => point.year === 2025).value, 105.70833333333334 / 100.00833333333334 * 100);
  assert.ok(pointsFor('hardware').find(point => point.year === 2025).value > 100, 'Higher robot prices remain higher, not inverted affordability');
});

test('plotted observations preserve raw values and provenance without filling unavailable years', () => {
  graphSeries.forEach((series, index) => {
    assert.equal(samples[index].length, series.observations.length, `${series.id}: exactly one point per observation`);
    let previousYear = -Infinity;
    samples[index].forEach((point, pointIndex) => {
      assert.ok(Number.isInteger(point.year) && point.year > previousYear, `${series.id}: unique chronological years`);
      assert.ok(point.year >= graphDomain.firstYear && point.year <= 2025, `${series.id}: no future or incomplete-year observations`);
      assert.ok(Number.isFinite(point.raw) && point.raw > 0, `${series.id}: finite positive source value`);
      assert.equal(point.raw, series.observations[pointIndex].value, `${series.id}: raw value survives normalization`);
      assert.equal(new URL(point.sourceUrl).protocol, 'https:', `${series.id}: linked source for every observation`);
      assert.ok(Number.isFinite(point.value) && point.value > 0 && point.value <= graphDomain.maximum, `${series.id}: normalized value fits the axis`);
      previousYear = point.year;
    });
    for (let year = 2026; year <= 2040; year++) assert.equal(interpolateSample(samples[index], year), null, `${series.id}: no numerical forecasts`);
  });
  for (const id of ['humanoid', 'data']) {
    assert.deepEqual(pointsFor(id), [], `${id}: absent evidence is not zero or a proxy invented in code`);
    assert.equal(interpolateSample(pointsFor(id), 2020), null);
  }
  assert.equal(interpolateSample(pointsFor('llm'), 2025), null, 'LLM scores stop at their last verified result');
});

test('visual interpolation connects adjacent observations but never bridges missing years or extrapolates', () => {
  const sparse = [{ year: 2020, value: 10 }, { year: 2021, value: 20 }, { year: 2023, value: 60 }];
  assert.equal(interpolateSample(sparse, 2020), 10);
  assert.equal(interpolateSample(sparse, 2020.25), 12.5);
  assert.equal(interpolateSample(sparse, 2021), 20);
  assert.equal(interpolateSample(sparse, 2021.5), null);
  assert.equal(interpolateSample(sparse, 2022), null);
  assert.equal(interpolateSample(sparse, 2023), 60);
  assert.equal(interpolateSample(sparse, 2019.99), null);
  assert.equal(interpolateSample(sparse, 2023.01), null);
  assert.equal(interpolateSample([], 2020), null);
});

test('inspection snaps to whole years and clamps to the story timeline', () => {
  for (let value = 2014; value <= 2041; value += .17) assert.ok(Number.isInteger(snapYear(value)));
  assert.equal(snapYear(2015.49), 2015);
  assert.equal(snapYear(2015.5), 2016);
  assert.equal(snapYear(1000), 2015);
  assert.equal(snapYear(3000), 2040);
  assert.equal(snapYear(NaN), 2026);
});

test('hit testing finds observed points and four shared baselines without inventing absent or future lines', () => {
  const all = new Set(graphSeries.map(series => series.id));
  assert.deepEqual(findLineHits(samples, all, pointAt(2020, 100), layout, 1).map(hit => hit.id).sort(), ['deployment', 'hardware', 'llm', 'specialist']);
  const deployment2025 = pointsFor('deployment').find(point => point.year === 2025);
  assert.deepEqual(findLineHits(samples, new Set(['deployment']), pointAt(2025, deployment2025.value), layout, 1).map(hit => hit.id), ['deployment']);
  assert.deepEqual(findLineHits(samples, new Set(['humanoid', 'data']), pointAt(2020, 100), layout, 8), []);
  assert.deepEqual(findLineHits(samples, all, pointAt(2035, 150), layout, 8), []);

  const sparse = graphSeries.map(() => []);
  sparse[seriesIndex('llm')] = [{ year: 2020, value: 100 }, { year: 2022, value: 160 }];
  assert.deepEqual(findLineHits(sparse, new Set(['llm']), pointAt(2021, 130), layout, 1), [], 'A missing year must not produce an interactive connector');
  assert.deepEqual(findLineHits(sparse, new Set(['llm']), pointAt(2022, 160), layout, 1).map(hit => hit.id), ['llm'], 'An isolated measured point remains interactive');
});

test('endpoint labels remain ordered and separated at the last actual observation', () => {
  const endpoints = graphSeries.flatMap((series, index) => {
    const endpoint = samples[index].at(-1);
    return endpoint ? [{ id: series.id, year: endpoint.year, y: pointAt(endpoint.year, endpoint.value).y }] : [];
  });
  const placed = placeEndpointLabels(endpoints, 52, 452, 90);
  assert.deepEqual(placed.map(point => point.id), ['llm', 'specialist', 'deployment', 'hardware']);
  assert.equal(placed.find(point => point.id === 'llm').year, 2024);
  assert.ok(placed.every(point => point.year <= 2025), 'No label is attached to a fabricated 2040 endpoint');
  assert.ok(placed[0].labelY >= 52);
  assert.ok(placed.at(-1).labelY <= 452);
  placed.slice(1).forEach((point, index) => assert.ok(point.labelY - placed[index].labelY >= 90));
});

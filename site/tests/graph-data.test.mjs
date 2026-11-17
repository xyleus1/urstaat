import test from 'node:test';
import assert from 'node:assert/strict';
import { graphSeries, graphDomain, sampleSeries, rawValue, snapYear, interpolateSample, findLineHits, placeEndpointLabels } from '../graph-data.js';

test('normalization preserves all original vertices and central-baseline scenario bounds', () => {
  graphSeries.forEach((series, index) => {
    const original = (time, offset) => Math.max(0, series.ceiling / (1 + Math.exp(-series.slope * (time - series.midpoint - offset))) + .8 * Math.sin(time * 1.4 + index));
    const baseline = original(11, 0);
    for (const offset of [0, -1.2, 1.2]) {
      const points = sampleSeries(index, offset);
      assert.equal(points.length, 251);
      points.forEach((point, sample) => {
        assert.equal(point.year, 2015 + sample / 10);
        assert.ok(Math.abs(point.value - original(sample / 10, offset) / baseline * 100) < 1e-10);
        assert.ok(point.value >= 0 && point.value <= graphDomain.maximum);
      });
    }
    assert.equal(sampleSeries(index)[110].value, 100);
    assert.equal(rawValue(index, 11), baseline);
  });
  const llm = sampleSeries(0).filter(point => point.year >= 2035);
  assert.ok(llm.some((point, i) => i && point.value < llm[i - 1].value), 'Late LLM oscillations remain');
});

test('2040 endpoints and annual inspection remain independent', () => {
  const expected = [137.941300975, 607.891914316, 175.878027540, 844.372714101, 348.231758659, 168.771910527];
  graphSeries.forEach((_, i) => assert.ok(Math.abs(sampleSeries(i)[250].value - expected[i]) < 1e-7));
  for (let value = 2014; value <= 2041; value += .17) assert.ok(Number.isInteger(snapYear(value)));
  assert.equal(snapYear(2015.49), 2015); assert.equal(snapYear(2015.5), 2016);
  assert.equal(snapYear(1000), 2015); assert.equal(snapYear(3000), 2040); assert.equal(snapYear(NaN), 2026);
});

test('hit testing identifies steep continuous lines and all shared 2026 baselines', () => {
  const samples = graphSeries.map((_, i) => sampleSeries(i));
  const layout = { gx: 44, gy: 57, gw: 800, gh: 440 };
  const pointAt = (index, year) => ({ x: 44 + (year - 2015) / 25 * 800, y: 57 + 440 * (1 - interpolateSample(samples[index], year) / 900) });
  const all = new Set(graphSeries.map(series => series.id));
  assert.equal(findLineHits(samples, all, pointAt(0, 2026), layout, 1).length, 6);
  assert.deepEqual(findLineHits(samples, new Set(['deployment']), pointAt(3, 2031.49), layout, 1).map(hit => hit.id), ['deployment']);
  assert.equal(findLineHits(samples, new Set(['llm']), pointAt(3, 2036), layout, 1).length, 0);
  assert.equal(findLineHits(samples, all, { x: 300, y: 80 }, layout, 8).length, 0);
});

test('endpoint label placement prevents overlap without changing numeric order', () => {
  const endpoints = graphSeries.map((series, index) => ({ id: series.id, y: 57 + 440 * (1 - sampleSeries(index)[250].value / 900) }));
  const placed = placeEndpointLabels(endpoints, 52, 452);
  assert.deepEqual(placed.map(point => point.id), ['deployment', 'humanoid', 'data', 'specialist', 'hardware', 'llm']);
  assert.ok(placed[0].labelY >= 52); assert.ok(placed.at(-1).labelY <= 452);
  placed.slice(1).forEach((point, i) => assert.ok(point.labelY - placed[i].labelY >= 57));
});

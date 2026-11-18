import test from 'node:test';
import assert from 'node:assert/strict';
import {
  graphDomain, graphSeries, sampleSeries, readingAt,
  indexPresentation, compressIndex, uncompressIndex,
  displayValue, formatIndex, formatRaw,
} from '../graph-data.js';

const close = (actual, expected, tolerance = 1e-11) => {
  assert.ok(Number.isFinite(actual), 'A display conversion must remain finite');
  assert.ok(Math.abs(actual - expected) <= tolerance * Math.max(Math.abs(expected), 1e-12),
    String(actual) + ' should recover ' + String(expected));
};
const byId = id => graphSeries.findIndex(series => series.id === id);
const allSamples = graphSeries.flatMap((_, index) => sampleSeries(index));

test('one presentation scale anchors 2025 at 100 and the full-domain ceiling at 10,000', () => {
  assert.equal(indexPresentation.baseline, 100);
  assert.equal(indexPresentation.maximum, 10000);
  assert.ok(indexPresentation.power > 0 && indexPresentation.power < 1);
  close(compressIndex(100), 100);
  close(compressIndex(graphDomain.maximum), 10000);
  close(uncompressIndex(100), 100);
  close(uncompressIndex(10000), graphDomain.maximum);
  assert.ok(compressIndex(graphDomain.minimum) > 0);
  assert.ok(compressIndex(graphDomain.minimum) < 100);
});

test('all native historical and scenario samples retain ordering and reversible magnitudes', () => {
  const values = [...new Set([graphDomain.minimum, ...allSamples.map(point => point.value), graphDomain.maximum])]
    .sort((a, b) => a - b);
  let previous = -Infinity;
  for (const value of values) {
    const presented = compressIndex(value);
    assert.ok(Number.isFinite(presented) && presented >= previous,
      'One shared mapping must preserve native-value ordering');
    assert.ok(presented > 0 && presented <= 10000 * (1 + 1e-12));
    close(uncompressIndex(presented), value);
    previous = presented;
  }
});

test('display compression round-trips every curve point without changing its vertical position', () => {
  const low = displayValue(graphDomain.minimum);
  const span = displayValue(graphDomain.maximum) - low;
  for (const height of [360, 640]) {
    for (const point of allSamples) {
      const originalY = height * (1 - (displayValue(point.value) - low) / span);
      const recovered = uncompressIndex(compressIndex(point.value));
      const recoveredY = height * (1 - (displayValue(recovered) - low) / span);
      assert.ok(Math.abs(recoveredY - originalY) < 1e-8,
        'Presentation labels must not move a line at year ' + String(point.year));
    }
  }
});

test('rounded display labels leave the native endpoint and source units intact', () => {
  const point = readingAt(byId('llm'), 2040);
  const snapshot = { ...point };
  assert.ok(point.value > 1000000, 'The source-domain endpoint is not silently capped or rebased');
  assert.equal(formatIndex(point.value), '7,000');
  assert.equal(formatIndex(graphDomain.maximum), '10,000');
  assert.equal(formatIndex(100), '100');
  assert.doesNotMatch(formatIndex(point.value), /[×x]/u, 'A compressed label is not a growth multiple');
  assert.deepEqual(point, snapshot);
  for (const value of [NaN, Infinity, -Infinity]) assert.equal(formatIndex(value), '\u2014');
});

test('raw scenario readouts use rough magnitudes while retaining their physical units', () => {
  const humanoid = graphSeries[byId('humanoid')];
  const data = graphSeries[byId('data')];
  assert.equal(formatRaw(humanoid, 38924740.98405877), '40M robots/year');
  assert.equal(formatRaw(data, 37690146.946949), '40M episodes');
  for (const series of [humanoid, data]) assert.equal(formatRaw(series, NaN), '\u2014');
});

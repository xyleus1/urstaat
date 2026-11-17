import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectionYears, snapYear, stepYear, graphSeries, readingAt, sampleSeries } from '../graph-data.js';

test('inspection retains annual history and the 2026 boundary before five-year future milestones', () => {
  assert.deepEqual(inspectionYears, [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2030, 2035, 2040]);
  assert.ok(Object.isFrozen(inspectionYears));
  for (const year of inspectionYears) assert.equal(snapYear(year), year);
  for (let year = 2014; year <= 2041; year += .025) assert.ok(inspectionYears.includes(snapYear(year)));
});

test('absolute input snaps to its nearest inspection year and advances midpoint ties', () => {
  for (const [input, expected] of [
    [2015.49, 2015], [2015.5, 2016], [2025.5, 2026],
    [2027, 2026], [2027.999, 2026], [2028, 2030],
    [2032.49, 2030], [2032.5, 2035], [2037.49, 2035], [2037.5, 2040],
    [1000, 2015], [3000, 2040], [-Number.MAX_VALUE, 2015], [Number.MAX_VALUE, 2040], ['2033', 2035], [NaN, 2026], [Infinity, 2026], [undefined, 2026],
  ]) assert.equal(snapYear(input), expected, `${input} selects ${expected}`);
});

test('directional input crosses the historical boundary and traverses every future stop without sticking', () => {
  let year = 2024;
  const forward = [];
  for (let index = 0; index < 6; index++) { year = stepYear(year, 1); forward.push(year); }
  assert.deepEqual(forward, [2025, 2026, 2030, 2035, 2040, 2040]);
  const backward = [];
  for (let index = 0; index < 6; index++) { year = stepYear(year, -1); backward.push(year); }
  assert.deepEqual(backward, [2035, 2030, 2026, 2025, 2024, 2023]);
  assert.equal(stepYear(2015, -1), 2015);
  assert.equal(stepYear(2032, 0), 2030);
  assert.equal(stepYear(2030, 100), 2035);
  assert.equal(stepYear(2030, -100), 2026);
});

test('coarser future inspection does not discard annual model values or continuous drawing samples', () => {
  graphSeries.forEach((series, index) => {
    for (const year of [2027, 2028, 2029, 2031, 2032, 2033, 2034, 2036, 2037, 2038, 2039]) {
      const reading = readingAt(index, year);
      assert.equal(reading.year, year, `${series.id} retains its ${year} model reading`);
      assert.ok(Number.isFinite(reading.raw) && Number.isFinite(reading.value));
    }
    assert.ok(sampleSeries(index).some(point => point?.year === 2032.05), `${series.id} retains fractional-year drawing samples`);
  });
  assert.equal(graphSeries.find(series => series.id === 'humanoid').name, 'Humanoid deployment');
});

// Values and sampling are transcribed from the existing figma-chart.js.
// They are illustrative design-study curves, not observations or forecasts.
export const graphDomain = Object.freeze({ firstYear: 2015, lastYear: 2040, dividerYear: 2026, minimum: 0, maximum: 100 });
export const graphSeries = Object.freeze([
  { id: 'llm', name: 'LLM performance', color: '#8EAAF0', midpoint: 9, slope: .47, ceiling: 90, definition: 'Language capability index', rail: 75 },
  { id: 'humanoid', name: 'Humanoid development', color: '#D98B6A', midpoint: 16, slope: .33, ceiling: 82, definition: 'Embodied capability index', rail: 198 },
  { id: 'specialist', name: 'Specialist robots', color: '#A4BB8E', midpoint: 10, slope: .22, ceiling: 78, definition: 'Task-specific capability index', rail: 265 },
  { id: 'deployment', name: 'Robot deployment', color: '#F07855', midpoint: 17, slope: .34, ceiling: 95, definition: 'Fleet scale index', rail: 137 },
  { id: 'data', name: 'Interaction data', color: '#C8B57A', midpoint: 14, slope: .32, ceiling: 97, definition: 'Collected experience index', rail: 23 },
  { id: 'hardware', name: 'Hardware affordability', color: '#B6A3CE', midpoint: 10, slope: .17, ceiling: 62, definition: 'Cost-efficiency index', rail: 340 },
]);
export const graphViews = Object.freeze([
  { id: 'all', label: 'All systems', series: graphSeries.map(s => s.id), title: 'The embodiment gap', description: 'Knowing what to do is only the beginning of doing it. Explore how capability, data, hardware, and deployment move together.' },
  { id: 'intelligence', label: 'Intelligence → action', series: ['llm', 'humanoid'], title: 'Intelligence needs a body', description: 'Language capability can advance ahead of reliable physical action. Compare general intelligence with humanoid development.' },
  { id: 'data', label: 'The data bottleneck', series: ['data', 'llm'], title: 'Experience is the input', description: 'Interaction data connects learning to the physical world. More demonstrations, richer contact, and wider task coverage may change the trajectory.' },
  { id: 'deployment', label: 'Deployment', series: ['deployment', 'hardware'], title: 'From demonstration to work', description: 'Deployment depends on the whole system: useful capability, affordable hardware, maintenance, and reliability over repeated shifts.' },
  { id: 'specialist', label: 'Specialist robots', series: ['specialist'], title: 'Task-specific capability', description: 'Follow the specialist robot trajectory within the same illustrative system.' },
]);

export function sampleSeries(seriesIndex, offset = 0) {
  const series = graphSeries[seriesIndex];
  return Array.from({ length: 251 }, (_, i) => {
    const time = i / 10;
    return { year: 2015 + time, value: Math.max(0, series.ceiling / (1 + Math.exp(-series.slope * (time - series.midpoint - offset))) + .8 * Math.sin(time * 1.4 + seriesIndex)) };
  });
}

export function interpolateSample(points, year) {
  const position = Math.max(0, Math.min(250, (year - 2015) * 10));
  const start = Math.min(249, Math.floor(position));
  const fraction = position - start;
  return points[start].value + (points[start + 1].value - points[start].value) * fraction;
}

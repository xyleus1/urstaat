// Canonical sculptural pairings from the first Taku viewer. Each compact cloud
// contains five physical depth slices through the face, claw or folding linkage.
export const arrangements = {
  // [shape, horizontal position, vertical position, radius, ink]
  overview: [
    [0, -0.52, 0.09, 0.67, 0.94],
    [1, 0.56, -0.11, 0.62, 0.76],
  ],
  side: [
    [2, -0.52, 0.03, 0.75, 0.96],
    [1, 0.55, 0.13, 0.59, 0.71],
  ],
  face: [
    [0, -0.54, 0.08, 0.83, 1],
    [2, 0.59, -0.12, 0.63, 0.69],
  ],
  shoulder: [
    [0, -0.56, 0.15, 0.7, 0.9],
    [1, 0.58, -0.1, 0.59, 0.73],
  ],
  elbow: [
    [1, 0.57, -0.05, 0.76, 0.97],
    [2, -0.58, 0.13, 0.62, 0.72],
  ],
  wrist: [
    [1, -0.56, -0.01, 0.76, 0.97],
    [0, 0.57, 0.16, 0.55, 0.72],
  ],
  claw: [
    [1, -0.56, -0.01, 0.8, 1],
    [2, 0.59, 0.11, 0.64, 0.73],
  ],
  waist: [
    [2, -0.54, -0.02, 0.8, 0.98],
    [0, 0.59, 0.16, 0.55, 0.75],
  ],
  base: [
    [2, 0.55, 0.04, 0.72, 0.94],
    [1, -0.56, 0.13, 0.57, 0.73],
  ],
};

export function layoutSculpture(spec, index, aspect) {
  const [shape, x, y, radius, ink] = spec,
    portrait = aspect < 1.12;
  const u = portrait ? x * 0.93 : x;
  return {
    shape,
    x: u,
    y: portrait ? y + (index ? -0.27 : 0.3) : y,
    radius: Math.min(radius, aspect * (1 - Math.abs(u) - 0.045)),
    ink,
  };
}

// Working distance as a fraction of each preset's authored field of view.
const zoomRatios = {
  overview: [0.5, 1.62],
  side: [0.5, 1.62],
  face: [0.68, 1.52],
  shoulder: [0.68, 1.55],
  elbow: [0.62, 1.58],
  wrist: [0.65, 1.55],
  claw: [0.7, 1.52],
  waist: [0.72, 1.48],
  base: [0.72, 1.5],
};
export function zoomRange(id, distance) {
  const [near, far] = zoomRatios[id];
  return { min: distance * near, max: distance * far };
}
export function zoomAvailability(range, distance) {
  return { canZoomIn: distance > range.min * 1.001, canZoomOut: distance < range.max * 0.999 };
}

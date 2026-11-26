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

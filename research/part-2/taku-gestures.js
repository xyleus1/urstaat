// Pointer events already drive physical touch. Safari also dispatches GestureEvents
// for trackpad pinches, occasionally alongside a Ctrl-wheel event for the same pinch.
export function installZoomGestures(canvas, { engaged, hasPointers, zoom, signal }) {
  let gestureScale = 0;
  const options = { capture: true, passive: false, signal };
  canvas.addEventListener(
    'wheel',
    (event) => {
      if (!engaged() || !event.deltaY) return;
      event.preventDefault();
      // Both renderers use this handler, ahead of Three's native wheel listener.
      event.stopImmediatePropagation();
      if (event.ctrlKey && (gestureScale || hasPointers())) return;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? canvas.clientHeight : 1;
      const pixels = Math.max(-300, Math.min(300, event.deltaY * unit));
      zoom(Math.exp(-pixels * (event.ctrlKey ? 0.008 : 0.002)));
    },
    options,
  );
  canvas.addEventListener(
    'gesturestart',
    (event) => {
      gestureScale = 0;
      if (!engaged()) return;
      event.preventDefault();
      gestureScale = event.scale || 1;
    },
    options,
  );
  canvas.addEventListener(
    'gesturechange',
    (event) => {
      if (!engaged() || !gestureScale || !(event.scale > 0)) return;
      event.preventDefault();
      if (!hasPointers()) zoom(event.scale / gestureScale);
      gestureScale = event.scale;
    },
    options,
  );
  canvas.addEventListener(
    'gestureend',
    (event) => {
      if (engaged() && gestureScale) event.preventDefault();
      gestureScale = 0;
    },
    options,
  );
}

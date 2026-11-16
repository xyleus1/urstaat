const motorElement = document.querySelector('#hero-motor');
if (motorElement) {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const started = performance.now();
  let controller = null, loading = null, disposed = false, explicitResume = false;
  // The existing sourced poster is sufficient for visitors requesting less motion.
  const posterController = {
    ready: Promise.resolve(),
    get status() { return { ready: true, posterOnly: true, reducedMotion: motion.matches, paused: true, active: false, disposed, renderCount: 0, wavesReady: false, timings: { started, motorReady: started } }; },
    pause() {},
    resume() { return start(true); },
    dispose() { disposed = true; },
  };
  async function start(overrideMotion = false) {
    explicitResume ||= overrideMotion;
    if (disposed) return;
    if (controller) { controller.resume(); return controller; }
    if (loading) return loading;
    loading = import('./hero-renderer.js?v=menu-perf-1').then(async ({ mountHero }) => {
      if (disposed) return;
      controller = mountHero({
        motorElement,
        waveElement: document.querySelector('#hero-waves'),
        pauseButton: document.querySelector('#hero-pause'),
        posterElement: document.querySelector('#hero-poster'),
        assetBase: new URL('./assets/', import.meta.url).href,
      });
      window.__robotHero = controller;
      await controller.ready;
      if (explicitResume && !disposed) controller.resume();
      return controller;
    }).catch(error => {
      console.error('The ASCII motor could not start; the poster remains available.', error);
      window.__robotHero = posterController;
    });
    return loading;
  }
  if (motion.matches) window.__robotHero = posterController;
  else start();
  const motionChange = event => { if (!event.matches) start(); };
  motion.addEventListener('change', motionChange);
  window.addEventListener('pagehide', event => {
    if (!event.persisted) {
      disposed = true;
      motion.removeEventListener('change', motionChange);
      controller?.dispose();
    }
  });
}

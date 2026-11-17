const motorElement = document.querySelector('#hero-motor');
if (motorElement) {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const started = performance.now();
  let controller = null, loading = null, modelAbort = null, disposed = false, explicitResume = false;
  // The existing sourced poster is sufficient for visitors requesting less motion.
  const posterController = {
    ready: Promise.resolve(),
    get status() { return { ready: true, posterOnly: true, reducedMotion: motion.matches, paused: true, active: false, disposed, renderCount: 0, wavesReady: false, timings: { started, motorReady: started } }; },
    pause() {},
    resume() { return start(true); },
    dispose() { disposed = true; modelAbort?.abort(); },
  };
  async function start(overrideMotion = false) {
    explicitResume ||= overrideMotion;
    if (disposed) return;
    if (controller) { controller.resume(); return controller; }
    if (loading) return loading;
    // Start the original model alongside the renderer, not after it has parsed.
    // This content hash is checked by build.mjs. A changed model gets a new URL;
    // repeat visits may reuse its exact bytes from the browser's HTTP cache.
    modelAbort = new AbortController();
    const modelData = fetch(new URL('./assets/actuator.meshopt.glb?v=8f5c44694c2c', import.meta.url), {
      cache: 'force-cache', credentials: 'same-origin', priority: 'high', signal: modelAbort.signal,
    }).then(response => {
      if (!response.ok) throw new Error(`Actuator download failed (${response.status}).`);
      return response.arrayBuffer();
    });
    // A fast network failure can precede the renderer import. Its ready handler
    // still receives the rejection and retains the existing poster.
    modelData.catch(() => {});
    loading = import('./hero-renderer.js?v=full-quality-cache-1').then(async ({ mountHero }) => {
      if (disposed) return;
      controller = mountHero({
        motorElement,
        waveElement: document.querySelector('#hero-waves'),
        pauseButton: document.querySelector('#hero-pause'),
        posterElement: document.querySelector('#hero-poster'),
        assetBase: new URL('./assets/', import.meta.url).href,
        modelData,
      });
      window.__robotHero = controller;
      await controller.ready;
      if (explicitResume && !disposed) controller.resume();
      return controller;
    }).catch(error => {
      modelAbort.abort();
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
      modelAbort?.abort();
      motion.removeEventListener('change', motionChange);
      controller?.dispose();
    }
  });
}

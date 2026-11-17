const motorElement = document.querySelector('#hero-motor');
if (motorElement) {
  const video = document.querySelector('#hero-startup');
  const poster = document.querySelector('#hero-poster');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const started = performance.now();
  const startup = window.__heroStartup = {
    state: 'poster', started, firstFrameAt: null, firstMotionAt: null,
    liveStartAt: null, handoffAt: null, lastMediaTime: null,
    handoffMediaTime: null, handoffLiveTime: null, videoError: null,
    nativeBeforeBootstrap: !!video && video.currentTime > 0,
    nativeMediaTimeAtBootstrap: video?.currentTime || 0,
    firstFrameTiming: 'first-observed-frame; native playback may precede bootstrap',
  };
  Object.defineProperty(startup, 'status', { get: () => ({ ...startup }) });
  // Measured bounds from the unchanged renderer used for both recordings.
  // The orthographic camera equation also aligns intermediate viewport sizes.
  const profiles = {
    desktop: { width: 1000, height: 370, worldAspect: 185.8916856388889 / 75.11710503076668, version: 'a9920e0af3fd' },
    mobile: { width: 350, height: 300, worldAspect: 170.03785928700313 / 133.18289841860445, version: '079df7075d2a' },
  };
  let controller = null, loading = null, modelAbort = null, disposed = false;
  let manualPaused = false, reduced = motion.matches, pageSuspended = false;
  let onscreen = true, profile = null, videoStarted = false, videoFailed = false;
  let presentedTime = null, motionSeen = false, frameCallback = 0, fallbackTick = 0;
  let startupTimer = 0, handoffRaf = 0, handoffPending = false, handingOff = false;
  let lastVideoProgressAt = started;
  let wasLiveActive = false, resolveReady;
  const ready = new Promise(resolve => { resolveReady = resolve; });
  const rect = motorElement.getBoundingClientRect();
  onscreen = rect.bottom > 0 && rect.top < innerHeight;

  function setState(state) {
    startup.state = state;
    motorElement.dataset.startupState = state;
  }
  function canAnimate() {
    return !disposed && !manualPaused && !reduced && onscreen && !document.hidden && !pageSuspended;
  }
  const proxy = {
    get ready() { return reduced && !videoStarted ? Promise.resolve(proxy) : ready; },
    get status() {
      return {
        ready: reduced && !videoStarted, posterOnly: !videoStarted,
        reducedMotion: reduced, paused: manualPaused || reduced,
        active: canAnimate() && (videoStarted ? !video.paused : !!loading),
        disposed, renderCount: 0, wavesReady: false, time: presentedTime || 0,
        timings: { started, firstFrame: startup.firstFrameAt, firstMotion: startup.firstMotionAt },
      };
    },
    pause() { manualPaused = true; sync(); },
    resume() { manualPaused = false; reduced = false; sync(); return ready; },
    dispose,
  };
  window.__robotHero = proxy;
  setState('poster');

  function stopFrameWatch() {
    if (frameCallback && video?.cancelVideoFrameCallback) video.cancelVideoFrameCallback(frameCallback);
    frameCallback = 0;
    clearInterval(fallbackTick); fallbackTick = 0;
  }
  function onPresentedFrame(mediaTime) {
    if (disposed || startup.state === 'live' || handingOff) return;
    const previous = presentedTime;
    presentedTime = mediaTime;
    startup.lastMediaTime = mediaTime;
    if (startup.firstFrameAt === null) startup.firstFrameAt = performance.now();
    video.style.opacity = '1';
    setState('video');
    // A decoded still is not motion: let the browser present an advancing
    // second frame before starting the original renderer's shader work.
    if (previous !== null && mediaTime !== previous) {
      motionSeen = true;
      if (startup.firstMotionAt === null) {
        startup.firstMotionAt = performance.now();
        window.dispatchEvent(new Event('hero-motion-ready'));
      }
      clearTimeout(startupTimer); startupTimer = 0;
      if (canAnimate()) startLive();
    }
    if (handoffPending && canAnimate()) handoff(mediaTime);
  }
  function watchFrames() {
    if (!video || disposed || frameCallback || fallbackTick || startup.state === 'live') return;
    if (video.requestVideoFrameCallback) {
      frameCallback = video.requestVideoFrameCallback((now, metadata) => {
        frameCallback = 0;
        onPresentedFrame(metadata.mediaTime);
        if (!handingOff && startup.state !== 'live') watchFrames();
      });
    } else {
      // Older browsers expose playback time rather than presented-frame time.
      fallbackTick = setInterval(() => {
        if (!video.paused && video.readyState >= 2) onPresentedFrame(video.currentTime);
      }, 50);
    }
  }
  function sizeVideo() {
    if (!video) return;
    const bounds = motorElement.getBoundingClientRect();
    const nextProfile = bounds.width < 600 ? 'mobile' : 'desktop';
    const spec = profiles[nextProfile];
    const height = Math.max(1, bounds.height), width = Math.max(1, bounds.width);
    const scale = (height / Math.max(1, spec.worldAspect / (width / height)))
      / (spec.height / Math.max(1, spec.worldAspect / (spec.width / spec.height)));
    Object.assign(video.style, {
      width: `${spec.width * scale}px`, height: `${spec.height * scale}px`,
      left: '50%', top: '50%', right: 'auto', bottom: 'auto', transform: 'translate(-50%, -50%)',
    });
    if (nextProfile !== profile) {
      profile = nextProfile;
      if (videoStarted && startup.state !== 'live') selectSource();
    }
  }
  function selectSource() {
    if (!video || disposed) return;
    const sourceURL = new URL(`./exports/actuator-startup-${profile}.webm?v=${profiles[profile].version}`, import.meta.url).href;
    const selectedSource = video.currentSrc || video.getAttribute('src')
      || [...video.querySelectorAll('source')].find(source => !source.media || matchMedia(source.media).matches)?.src;
    if (selectedSource && new URL(selectedSource, document.baseURI).href === sourceURL) {
      // The HTML parser can already be streaming or playing the right clip.
      // Adopt that player without load(), a new request, or a phase reset.
      if (video.error) videoError(new Error(`Startup video unavailable (${video.error.code}).`));
      else if (canAnimate()) playVideo();
      return;
    }
    stopFrameWatch();
    clearTimeout(startupTimer); startupTimer = 0;
    presentedTime = null;
    motionSeen = false;
    videoFailed = false;
    lastVideoProgressAt = performance.now();
    video.style.opacity = '0';
    if (poster) poster.hidden = false;
    setState('poster');
    removeSourceChildren();
    video.src = sourceURL;
    video.load();
    if (canAnimate()) playVideo();
  }
  function videoError(error) {
    if (disposed || startup.state === 'live' || handingOff) return;
    videoFailed = true;
    startup.videoError = error instanceof Error ? error.message : String(error);
    window.dispatchEvent(new Event('hero-startup-unavailable'));
    clearTimeout(startupTimer); startupTimer = 0;
    // Keep a successfully presented frame, or the original poster, visible.
    if (canAnimate()) startLive();
  }
  function playVideo() {
    if (!video || !canAnimate() || handingOff || startup.state === 'live') return;
    watchFrames();
    if (!motionSeen && !startupTimer) {
      startupTimer = setTimeout(checkVideoProgress, 8000);
    }
    video.play()?.catch(error => {
      // pause(), source changes and pagehide may interrupt a pending play().
      if (error.name !== 'AbortError' && canAnimate()) videoError(error);
    });
  }
  function checkVideoProgress() {
    startupTimer = 0;
    if (!canAnimate() || motionSeen) return;
    // A viable stream can take longer on a cold connection. Do not start heavy
    // WebGL work while its bytes are still arriving and competing for bandwidth.
    if (performance.now() - lastVideoProgressAt < 4000) {
      startupTimer = setTimeout(checkVideoProgress, 4000);
    } else videoError(new Error('Startup video stopped loading; using the live renderer.'));
  }
  function onVideoProgress() {
    lastVideoProgressAt = performance.now();
    if (motionSeen && canAnimate()) startLive();
  }
  function removeSourceChildren() { video?.querySelectorAll('source').forEach(source => source.remove()); }
  function sync() {
    if (disposed || startup.state === 'live') return;
    if (!canAnimate()) {
      video?.pause();
      stopFrameWatch();
      clearTimeout(startupTimer); startupTimer = 0;
      return;
    }
    if (!video) { videoError(new Error('Startup video is unavailable.')); return; }
    if (!videoStarted) {
      videoStarted = true;
      video.muted = true;
      video.defaultMuted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'auto';
      sizeVideo();
      if (!video.getAttribute('src') && !video.currentSrc) selectSource();
    } else playVideo();
    if (videoFailed || motionSeen) startLive();
    if (handoffPending && videoFailed) handoff(presentedTime || 0);
  }

  function startLive() {
    if (disposed || loading || !canAnimate()) return loading;
    if (video && videoStarted && !videoFailed) {
      const currentTime = video.currentTime;
      let bufferedAhead = 0, complete = false;
      for (let index = 0; index < video.buffered.length; index++) {
        const start = video.buffered.start(index), end = video.buffered.end(index);
        if (start <= currentTime && end >= currentTime) bufferedAhead = end - currentTime;
        if (Number.isFinite(video.duration) && start <= 0.05 && end >= video.duration - 0.05) complete = true;
      }
      // Keep native playback supplied before the unchanged model competes for
      // bandwidth. Presented frames and progress events revisit this gate.
      if (!complete && bufferedAhead < 3) return;
      startup.liveBufferSeconds = bufferedAhead;
    }
    startup.liveStartAt = performance.now();
    // Give the native player's first motion the network and main thread first.
    // Then fetch the unchanged model and renderer together, keeping the model's
    // existing content-keyed cache without competing for high network priority.
    modelAbort = new AbortController();
    const modelData = fetch(new URL('./assets/actuator.meshopt.glb?v=8f5c44694c2c', import.meta.url), {
      cache: 'force-cache', credentials: 'same-origin', priority: 'low', signal: modelAbort.signal,
    }).then(response => {
      if (!response.ok) throw new Error(`Actuator download failed (${response.status}).`);
      return response.arrayBuffer();
    });
    modelData.catch(() => {});
    loading = import('./hero-renderer.js?v=instant-motion-1').then(async ({ mountHero }) => {
      if (disposed) return;
      controller = mountHero({
        motorElement,
        waveElement: document.querySelector('#hero-waves'),
        pauseButton: document.querySelector('#hero-pause'),
        posterElement: null,
        startPaused: true,
        assetBase: new URL('./assets/', import.meta.url).href,
        modelData,
      });
      // Standalone mountHero exposes itself. Escape must still control video
      // during initialization, so retain the lightweight proxy until handoff.
      window.__robotHero = proxy;
      await controller.ready;
      if (disposed) return;
      if (!controller.status.ready || controller.status.error) {
        throw new Error(controller.status.error || 'The live actuator did not become ready.');
      }
      handoffPending = true;
      if (canAnimate()) {
        if (!video || videoFailed || !videoStarted) handoff(presentedTime || 0);
        else { watchFrames(); playVideo(); }
      }
      return controller;
    }).catch(error => {
      if (disposed) return;
      modelAbort.abort();
      controller?.dispose();
      controller = null;
      startup.liveError = error instanceof Error ? error.message : String(error);
      window.__robotHero = proxy;
      if (startup.firstFrameAt === null) setState('error');
      resolveReady(proxy);
      console.warn('The live actuator could not start; its recorded animation remains available.', error);
    });
    return loading;
  }
  function handoff(mediaTime) {
    if (disposed || handingOff || !controller?.status.ready || !canAnimate()) return;
    handingOff = true;
    handoffPending = false;
    video?.pause();
    stopFrameWatch();
    clearTimeout(startupTimer); startupTimer = 0;
    // Match the last frame actually presented, not a later currentTime value.
    startup.handoffMediaTime = mediaTime;
    controller.renderAt(mediaTime);
    startup.handoffLiveTime = controller.status.time;
    handoffRaf = requestAnimationFrame(() => {
      handoffRaf = 0;
      if (disposed) return;
      if (!canAnimate()) {
        handingOff = false;
        handoffPending = true;
        return;
      }
      controller.canvas.style.opacity = '1';
      if (poster) poster.hidden = true;
      if (video) {
        video.style.opacity = '0';
        removeSourceChildren();
        video.removeAttribute('src');
        video.load();
      }
      setState('live');
      startup.handoffAt = performance.now();
      window.__robotHero = controller;
      if (canAnimate()) controller.resume();
      startupObserver.disconnect();
      resizeObserver.disconnect();
      motion.removeEventListener('change', motionChange);
      document.removeEventListener('visibilitychange', sync);
      resolveReady(controller);
    });
  }
  function motionChange(event) { reduced = event.matches; sync(); }
  function onVideoError() { videoError(new Error(`Startup video unavailable (${video?.error?.code || 'unknown'}).`)); }
  function onPlaying() { if (!video?.requestVideoFrameCallback) watchFrames(); }
  function pagehide(event) {
    if (!event.persisted) { dispose(); return; }
    // Visibility may already be hidden when pagehide fires. Remember the
    // user's motion intent, not the temporary visibility-derived active flag.
    wasLiveActive = startup.state === 'live' && !!controller && !controller.status.paused;
    pageSuspended = true;
    video?.pause();
    stopFrameWatch();
    clearTimeout(startupTimer); startupTimer = 0;
    controller?.pause();
  }
  function pageshow(event) {
    if (!event.persisted || disposed) return;
    pageSuspended = false;
    if (startup.state === 'live') {
      if (wasLiveActive) controller?.resume();
    } else sync();
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    modelAbort?.abort();
    stopFrameWatch();
    clearTimeout(startupTimer);
    cancelAnimationFrame(handoffRaf);
    video?.pause();
    if (video) { removeSourceChildren(); video.removeAttribute('src'); video.load(); }
    controller?.dispose();
    startupObserver.disconnect();
    resizeObserver.disconnect();
    motion.removeEventListener('change', motionChange);
    document.removeEventListener('visibilitychange', sync);
    video?.removeEventListener('error', onVideoError);
    video?.removeEventListener('playing', onPlaying);
    video?.removeEventListener('progress', onVideoProgress);
    video?.removeEventListener('loadedmetadata', onVideoProgress);
    video?.removeEventListener('loadeddata', onVideoProgress);
    window.removeEventListener('pagehide', pagehide);
    window.removeEventListener('pageshow', pageshow);
    resolveReady(proxy);
  }
  const startupObserver = new IntersectionObserver(([entry]) => {
    onscreen = entry.isIntersecting;
    sync();
  }, { rootMargin: '40px' });
  const resizeObserver = new ResizeObserver(sizeVideo);
  startupObserver.observe(motorElement);
  resizeObserver.observe(motorElement);
  video?.addEventListener('error', onVideoError);
  video?.addEventListener('playing', onPlaying);
  video?.addEventListener('progress', onVideoProgress);
  video?.addEventListener('loadedmetadata', onVideoProgress);
  video?.addEventListener('loadeddata', onVideoProgress);
  motion.addEventListener('change', motionChange);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pagehide', pagehide);
  window.addEventListener('pageshow', pageshow);
  sync();
}

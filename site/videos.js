/** Real, publisher-sourced robot footage. No video request is made until intent. */
const manifestURL = new URL('./video-manifest.json', import.meta.url);

export async function mountVideos(root = document) {
  const response = await fetch(manifestURL);
  if (!response.ok) throw new Error(`Preview manifest: ${response.status}`);
  const manifest = await response.json();
  const cards = [...root.querySelectorAll('.contents-tile')];
  const abort = new AbortController();
  const options = { signal: abort.signal };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const states = [];
  let active = null;
  let armedTouch = null;
  let pointerType = 'mouse';

  let hint = document.getElementById('video-preview-instructions');
  if (!hint) {
    hint = document.createElement('span');
    hint.id = 'video-preview-instructions';
    hint.className = 'video-visually-hidden';
    hint.textContent = 'Hover or focus to preview. On touch, tap once to preview and again to read. Press Space to play or pause the preview; Enter opens the section. With reduced motion, previews play only after a tap or Space.';
    (root.body || root).append(hint);
  }

  function stop(state) {
    if (!state) return;
    state.wanted = false;
    state.video.pause();
    if (state.video.readyState > 0) state.video.currentTime = 0;
    state.card.classList.remove('is-previewing', 'is-video-playing');
    state.card.dataset.videoStatus = state.failed ? 'error' : 'idle';
    if (active === state) active = null;
  }

  async function start(state, explicit = false) {
    if (state.failed || document.hidden || (reduceMotion.matches && !explicit)) return;
    if (active && active !== state) stop(active);
    active = state;
    state.wanted = true;
    state.card.classList.add('is-previewing');
    state.card.dataset.videoStatus = 'loading';
    if (!state.loaded) {
      state.loaded = true;
      state.video.src = new URL(state.item.video, manifestURL).href;
      state.video.load();
    }
    try {
      await state.video.play();
      if (!state.wanted || active !== state) state.video.pause();
    } catch (error) {
      // Leaving during load aborts play; a blocked autoplay keeps the poster usable.
      if (state.wanted && error.name !== 'AbortError') stop(state);
    }
  }

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) {
        const state = states.find(item => item.card === entry.target);
        stop(state);
        if (armedTouch === state) armedTouch = null;
      }
    }
  }, { threshold: 0 });

  cards.forEach((card, index) => {
    if (card.dataset.videoMounted) return;
    const item = manifest.find(entry => entry.key === card.dataset.sectionKey) || manifest[index];
    const frame = card.querySelector('.contents-image');
    if (!item || !frame) return;
    card.dataset.videoMounted = 'true';
    card.dataset.sectionKey = item.key;
    card.dataset.videoStatus = 'idle';
    card.classList.add('has-video-preview');
    frame.classList.remove('hardware-image');
    let poster = frame.querySelector('img');
    if (!poster) {
      poster = document.createElement('img');
      frame.append(poster);
    }
    poster.src = new URL(item.poster, manifestURL).href;
    poster.alt = item.description;
    poster.width = item.width;
    poster.height = item.height;
    poster.loading = 'lazy';
    poster.decoding = 'async';
    poster.classList.add('video-poster');

    const video = document.createElement('video');
    video.className = 'contents-video';
    video.preload = 'none';
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.disablePictureInPicture = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('aria-hidden', 'true');
    video.tabIndex = -1;
    frame.append(video);
    const descriptions = (card.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
    if (!descriptions.includes(hint.id)) descriptions.push(hint.id);
    card.setAttribute('aria-describedby', descriptions.join(' '));
    const state = { card, video, item, loaded: false, wanted: false, failed: false };
    states.push(state);

    video.addEventListener('playing', () => {
      if (!state.wanted || active !== state) return;
      card.classList.add('is-video-playing');
      card.dataset.videoStatus = 'playing';
    }, options);
    video.addEventListener('error', () => {
      state.failed = true;
      stop(state);
    }, options);
    card.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'touch') start(state);
    }, options);
    card.addEventListener('pointerleave', event => {
      if (event.pointerType !== 'touch' && !card.matches(':focus-visible')) stop(state);
    }, options);
    card.addEventListener('focusin', () => {
      if (pointerType !== 'touch') start(state);
    }, options);
    card.addEventListener('focusout', event => {
      if (!card.contains(event.relatedTarget)) stop(state);
    }, options);
    card.addEventListener('keydown', event => {
      pointerType = 'keyboard';
      if (event.code === 'Space') {
        event.preventDefault();
        if (active === state && state.wanted) stop(state);
        else start(state, true);
      }
    }, options);
    card.addEventListener('click', event => {
      if (pointerType !== 'touch' || event.detail === 0) return;
      if (armedTouch === state) {
        armedTouch = null;
        return; // Second tap follows the original essay anchor.
      }
      event.preventDefault();
      armedTouch = state;
      start(state, true);
    }, options);
    observer.observe(card);
  });

  document.addEventListener('pointerdown', event => {
    pointerType = event.pointerType;
    if (armedTouch && !armedTouch.card.contains(event.target)) {
      stop(armedTouch);
      armedTouch = null;
    }
  }, { ...options, capture: true });
  document.addEventListener('keydown', () => { pointerType = 'keyboard'; }, { ...options, capture: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(active);
  }, options);
  window.addEventListener('pagehide', () => stop(active), options);
  reduceMotion.addEventListener('change', () => stop(active), options);

  return {
    manifest,
    destroy() {
      stop(active);
      observer.disconnect();
      abort.abort();
      states.forEach(({ card, video }) => {
        video.remove();
        card.classList.remove('has-video-preview', 'is-previewing', 'is-video-playing');
        delete card.dataset.videoMounted;
      });
    },
  };
}

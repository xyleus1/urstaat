(() => {
  'use strict';

  const area = document.querySelector('.type-area');
  const surface = document.querySelector('#type-deck');
  const slides = surface.querySelector('.slides');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!window.Reveal) return;

  // Four hand-set impressions of the same line, like nudging loose pieces of type.
  // Each tuple is x, y, rotation, scale-y. No character appears or disappears.
  const impressions = [
    [],
    [[0, 1, -1], [1, -2, 1.5], [-1, 0, -.5], [0, 2, 0], [1, -1, -1], [0, 1, 1], [], [0, -2, -1.5], [-1, 1, .5], [1, -1, 0, 1.04], [0, 2, -1]],
    [[-1, 0, .7], [0, 1, -1], [1, -1, .8], [0, -2, -1.5], [-1, 1, .5], [1, 0, -1], [], [0, 1, .5], [1, -2, -1, .97], [-1, 1, 1.5], [0, -1, .5]],
    [[0, -1, -.5], [-1, 0, .5], [0, 2, -1], [1, 0, .7], [0, -1, -1], [-1, 2, 1], [], [1, 0, -.5], [0, 1, 1.5], [0, -2, -1], [-1, 1, .5]]
  ];

  for (const impression of impressions) {
    const section = document.createElement('section');
    section.setAttribute('data-auto-animate', '');
    section.setAttribute('data-auto-animate-id', 'letterpress');
    for (const [i, letter] of [...'Coming soon'].entries()) {
      const glyph = document.createElement('span');
      const [x = 0, y = 0, rotation = 0, stretch = 1] = impression[i] || [];
      glyph.dataset.id = `letter-${i}`;
      glyph.className = letter === ' ' ? 'glyph space' : 'glyph';
      glyph.textContent = letter === ' ' ? '\u00a0' : letter;
      glyph.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg) scaleY(${stretch})`;
      section.append(glyph);
    }
    slides.append(section);
  }

  const deck = new Reveal(surface, {
    embedded: true,
    disableLayout: true,
    controls: false,
    progress: false,
    keyboard: false,
    touch: false,
    overview: false,
    help: false,
    pause: false,
    hash: false,
    respondToHashChanges: false,
    jumpToSlide: false,
    slideNumber: false,
    transition: 'none',
    backgroundTransition: 'none',
    hideInactiveCursor: false,
    focusBodyOnPageVisibilityChange: false,
    postMessage: false,
    autoAnimateUnmatched: false,
    autoAnimateDuration: .12,
    autoAnimateEasing: 'steps(1, end)',
    autoAnimateMatcher(from, to) {
      return [...from.querySelectorAll('.glyph')].map(glyph => ({
        from: glyph,
        to: to.querySelector(`[data-id="${glyph.dataset.id}"]`),
        options: { translate: false, scale: false, styles: ['transform'] }
      }));
    }
  });

  // An uneven rhythm, with long still moments between little corrections.
  const score = [[1, 180], [2, 260], [3, 160], [0, 2350], [2, 190], [1, 145], [0, 3100]];
  let beat = 0;
  let timer;
  let ready = false;

  function play() {
    clearTimeout(timer);
    if (!ready || document.hidden || motion.matches) return;
    const [impression, hold] = score[beat];
    deck.slide(impression);
    surface.dataset.impression = String(impression);
    beat = (beat + 1) % score.length;
    timer = setTimeout(play, hold);
  }

  function resume() {
    clearTimeout(timer);
    if (!ready) return;
    if (motion.matches || document.hidden) {
      deck.slide(0);
      return;
    }
    beat = 0;
    timer = setTimeout(play, 1800);
  }

  deck.initialize().then(() => {
    ready = true;
    surface.setAttribute('aria-hidden', 'true');
    surface.setAttribute('tabindex', '-1');
    area.classList.add('type-ready');
    resume();
  }).catch(() => area.classList.remove('type-ready'));

  motion.addEventListener('change', resume);
  document.addEventListener('visibilitychange', resume);
})();

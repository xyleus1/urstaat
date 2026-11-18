// A keyboard-only motion control keeps the requested hero free of utility text.
// System reduced-motion preferences remain the default accessibility control.
addEventListener('keydown', event => {
  if (event.defaultPrevented || event.key !== 'Escape' || !window.__robotHero) return;
  const hero = window.__robotHero;
  if (hero.status.active) hero.pause(); else hero.resume();
});

// Give the visible actuator's first moving frame priority over below-the-fold
// downloads. Navigation intent still starts the existing sections immediately.
let sectionsStarted = false, fallbackTimer = 0;
function startSections() {
  if (sectionsStarted) return;
  sectionsStarted = true;
  clearTimeout(fallbackTimer);
  removeEventListener('hero-motion-ready', startSections);
  removeEventListener('hero-startup-unavailable', startSections);
  removeEventListener('scroll', onScroll);
  removeEventListener('hashchange', startSections);
  document.removeEventListener('click', onNavigation);
  const graphHost = document.querySelector('#robotics-graph');
  if (graphHost) {
    import('./graph.js?v=storyboards-20261118-1').then(({ mountGraph }) => {
      window.__researchGraph = mountGraph(graphHost);
    }).catch(error => { console.warn('Research trajectories could not start.', error); });
  }
  import('./videos.js?v=editorial-cleanup-1').then(({ mountVideos }) => mountVideos(document))
    .then(controller => { window.__researchVideos = controller; })
    .catch(error => {
      // Chapter links and their original posters remain usable if previews cannot load.
      console.warn('Chapter previews are unavailable.', error);
    });
}
function onScroll() { if (scrollY > 0) startSections(); }
function onNavigation(event) {
  const href = event.target.closest?.('a[href]')?.getAttribute('href');
  if (href?.startsWith('#') && href !== '#top') startSections();
}
const startup = window.__heroStartup;
if (!document.querySelector('#hero-motor') || matchMedia('(prefers-reduced-motion: reduce)').matches
  || (location.hash && location.hash !== '#top') || scrollY > 0
  || startup?.firstMotionAt != null || startup?.videoError) {
  startSections();
} else {
  addEventListener('hero-motion-ready', startSections, { once: true });
  addEventListener('hero-startup-unavailable', startSections, { once: true });
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('hashchange', startSections, { once: true });
  document.addEventListener('click', onNavigation);
  fallbackTimer = setTimeout(startSections, 8000);
}

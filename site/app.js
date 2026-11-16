import { mountVideos } from './videos.js?v=finish-1';

const graphHost = document.querySelector('#robotics-graph');
if (graphHost) {
  // The below-fold chart should not compete with the actuator's first frame.
  let graphRequest;
  const loadGraph = () => {
    if (graphRequest) return graphRequest;
    graphHost.dataset.graphLoad = 'loading';
    graphRequest = import('./graph.js?v=menu-perf-1').then(({ mountGraph }) => {
      window.__researchGraph = mountGraph(graphHost);
      graphHost.dataset.graphLoad = 'ready';
      return window.__researchGraph;
    }).catch(error => {
      graphHost.dataset.graphLoad = 'error';
      graphHost.replaceChildren();
      const retry = document.createElement('button');
      retry.type = 'button'; retry.className = 'graph-load-retry';
      retry.textContent = 'Reload to try again';
      retry.addEventListener('click', () => {
        const url = new URL(location.href); url.hash = 'trajectories';
        history.replaceState(null, '', url);
        location.reload(); // A new module map also clears failed dependency loads.
      });
      graphHost.append(retry);
      console.warn('The graph could not load.', error);
    });
    return graphRequest;
  };
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect(); loadGraph();
    }, { rootMargin: '200px 0px' });
    observer.observe(graphHost);
  } else loadGraph();
  document.querySelectorAll('a[href="#trajectories"]').forEach(link => link.addEventListener('click', loadGraph, { once: true }));
  graphHost.addEventListener('pointerenter', loadGraph, { once: true });
  if (location.hash === '#trajectories') loadGraph();
}
mountVideos(document).then(controller => { window.__researchVideos = controller; }).catch(error => {
  // Chapter links and their original posters remain usable if previews cannot load.
  document.querySelectorAll('.desktop-preview-hint, .mobile-preview-hint').forEach(hint => { hint.hidden = true; });
  console.warn('Chapter previews are unavailable.', error);
});

// A keyboard-only motion control keeps the requested hero free of utility text.
// System reduced-motion preferences remain the default accessibility control.
addEventListener('keydown', event => {
  if (event.defaultPrevented || event.key !== 'Escape' || !window.__robotHero) return;
  const hero = window.__robotHero;
  if (hero.status.active) hero.pause(); else hero.resume();
});

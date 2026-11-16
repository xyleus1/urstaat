import { mountGraph } from './graph.js?v=observed-1';
import { mountVideos } from './videos.js?v=finish-1';

const graphHost = document.querySelector('#robotics-graph');
if (graphHost) window.__researchGraph = mountGraph(graphHost);
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

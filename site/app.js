import { mountGraph } from './graph.js';
import { mountVideos } from './videos.js';

const graphHost = document.querySelector('#robotics-graph');
if (graphHost) window.__researchGraph = mountGraph(graphHost);
mountVideos(document).then(controller => { window.__researchVideos = controller; });

// A keyboard-only motion control keeps the requested hero free of utility text.
// System reduced-motion preferences remain the default accessibility control.
addEventListener('keydown', event => {
  if (event.key !== 'Escape' || !window.__robotHero) return;
  const hero = window.__robotHero;
  if (hero.status.active) hero.pause(); else hero.resume();
});

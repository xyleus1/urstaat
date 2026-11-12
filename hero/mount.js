import { mountHero } from './hero-renderer.js';

const motorElement = document.querySelector('#hero-motor');
if (motorElement) {
  const controller = mountHero({
    motorElement,
    waveElement: document.querySelector('#hero-waves'),
    pauseButton: document.querySelector('#hero-pause'),
    posterElement: document.querySelector('#hero-poster'),
    assetBase: new URL('./assets/', import.meta.url).href,
  });
  window.__robotHero = controller;
  Promise.resolve(controller.ready).catch(error => {
    console.error('The ASCII motor could not start; the poster remains available.', error);
  });
  window.addEventListener('pagehide', event => {
    if (!event.persisted) controller.dispose();
  });
}

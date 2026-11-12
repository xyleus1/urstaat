const links = [...document.querySelectorAll('.reading-contents a')];
const sections = links.map(a => document.getElementById(decodeURIComponent(a.hash.slice(1)))).filter(Boolean);
let queued = false;
function update() {
  queued = false;
  const article = document.querySelector('.essay');
  if (!article) return;
  let current = sections[0];
  for (const section of sections) if (section.getBoundingClientRect().top <= 160) current = section;
  for (const link of links) {
    if (current && link.hash === '#' + current.id) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
  const available = document.documentElement.scrollHeight - innerHeight;
  document.querySelector('.reading-progress')?.style.setProperty('transform', `scaleX(${Math.max(0, Math.min(1, scrollY / Math.max(1, available)))})`);
}
addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
update();

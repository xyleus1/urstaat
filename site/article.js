const contents = document.querySelector('.reading-contents');
const article = document.querySelector('.essay');
const header = article?.querySelector('header');
const list = contents?.querySelector('ol');
const links = [...(contents?.querySelectorAll('a') || [])];
const sections = links.map(link => document.getElementById(decodeURIComponent(link.hash.slice(1)))).filter(Boolean);
const progress = document.querySelector('.reading-progress');
const compact = matchMedia('(max-width: 800px)');
let queued = false;

if (contents && list && header) {
  // The mobile title comes first. Without JavaScript, all section links remain available.
  const originalPosition = document.createComment('Reading contents position');
  contents.before(originalPosition);
  list.id ||= 'reading-sections';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'reading-contents-toggle';
  toggle.setAttribute('aria-controls', list.id);
  const label = document.createElement('span');
  label.textContent = contents.querySelector('p')?.textContent || 'Contents';
  const mark = document.createElement('span');
  mark.setAttribute('aria-hidden', 'true');
  toggle.append(label, mark);
  contents.prepend(toggle);
  contents.classList.add('has-section-toggle');
  const setExpanded = expanded => {
    toggle.setAttribute('aria-expanded', String(expanded));
    mark.textContent = expanded ? '−' : '+';
    list.hidden = compact.matches && !expanded;
  };
  const adapt = () => {
    if (compact.matches) header.after(contents);
    else originalPosition.after(contents);
    setExpanded(!compact.matches);
    queueUpdate();
  };
  toggle.addEventListener('click', () => setExpanded(toggle.getAttribute('aria-expanded') !== 'true'));
  links.forEach(link => link.addEventListener('click', () => {
    if (!compact.matches) return;
    setExpanded(false);
    const section = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    if (section) {
      section.tabIndex = -1;
      requestAnimationFrame(() => section.focus({ preventScroll: true }));
    }
  }));
  contents.addEventListener('keydown', event => {
    if (compact.matches && event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setExpanded(false); toggle.focus(); event.preventDefault();
    }
  });
  compact.addEventListener('change', adapt);
  adapt();
}

function update() {
  queued = false;
  if (!article) return;
  const headerBottom = document.querySelector('.reading-header')?.getBoundingClientRect().bottom || 88;
  let current = sections[0];
  for (const section of sections) if (section.getBoundingClientRect().top <= headerBottom + 56) current = section;
  for (const link of links) {
    if (current && link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
  const available = document.documentElement.scrollHeight - innerHeight;
  progress?.style.setProperty('transform', `scaleX(${Math.max(0, Math.min(1, scrollY / Math.max(1, available)))})`);
}
function queueUpdate() {
  if (!queued) { queued = true; requestAnimationFrame(update); }
}
addEventListener('scroll', queueUpdate, { passive: true });
addEventListener('resize', queueUpdate, { passive: true });
addEventListener('hashchange', queueUpdate);
document.fonts?.ready.then(queueUpdate);
update();

// A direct source link must land after the mobile contents and webfonts settle.
// Stop correcting the initial fragment as soon as the reader takes control.
if (location.hash) {
  const initialHash = location.hash;
  let readerMoved = false;
  const cancelInitialAlignment = () => { readerMoved = true; };
  for (const type of ['wheel', 'touchstart', 'pointerdown', 'keydown']) addEventListener(type, cancelInitialAlignment, { once: true, passive: true });
  const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise(resolve => addEventListener('load', resolve, { once: true }));
  Promise.all([loaded, document.fonts?.ready]).then(() => requestAnimationFrame(() => requestAnimationFrame(() => {
    if (!readerMoved && location.hash === initialHash) {
      let target;
      try { target = document.getElementById(decodeURIComponent(initialHash.slice(1))); } catch { return; }
      target?.scrollIntoView({ block: 'start', behavior: 'instant' });
      queueUpdate();
    }
  })));
}

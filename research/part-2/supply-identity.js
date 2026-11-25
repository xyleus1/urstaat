// Tile numbers refer to the primary-source artwork in assets/identity/SOURCES.md.
const companies = [
  ['Mineração Rio do Norte', 0, 'trombetas'],
  ['Olin', 1, 'brine caustic'],
  ['Klaveness Combination Carriers', 2, 'caustic-cargo'],
  ['Hydro', 3, 'bauxite bar'],
  ['Hydro Alunorte', 3, 'alumina soda-terminal'],
  ['Rain Carbon', 4, 'calcined-coke pitch'],
  ['Albras', 5, 'carbon-anode pot-metal aluminium'],
  ['OSR Metallrecycling', 6, 'mixed-offcuts sorted-offcuts'],
  ['Constellium', 7, 'al-scrap al-cast al-sheet'],
  ['Protolabs', 8, 'al-blank panel cap'],
  ['MP Materials', 9, 'rare-ore rare-concentrate rare-oxide mag-alloy magnet block'],
  ['Boliden', 10, 'cu-ore cu-concentrate cu-cathode'],
  ['Elcowire', 11, 'cu-rod'],
  ['Elektrisola', 12, 'wire'],
  ['maxon', 13, 'motor'],
  ['Ovako', 14, 'fe-scrap steel ring'],
  ['THK', 15, 'bearing race spacers screw'],
  ['SKF', 16, 'srb'],
  ['Harmonic Drive SE', 17, 'gear'],
  ['Elkem', 18, 'quartz'],
  ['WACKER', 19, 'silicon poly'],
  ['Siltronic', 20, 'ingot wafer'],
  ['Sony Semiconductor Manufacturing', 21, 'imager'],
  ['RLS', 22, 'readhead encoder'],
  ['MAB Robotics', 23, 'actuator sealed-joint checked-joint'],
  ['Sibelco', 24, 'sand'],
  ['UQG Optics', 25, 'window'],
  ['Zimmer Group', 26, 'gripper'],
  ['ARLANXEO', 27, 'nbr'],
  ['SCHUNK', 28, 'pad'],
  ['Covestro', 29, 'pu-input'],
  ['Blickle', 30, 'tread wheel'],
  ['Basler', 31, 'camera'],
  ['Schaeffler', 32, 'plain linkage linear'],
  ['Festo', 33, 'electric-grip'],
  ['ELANTAS', 34, 'enamel'],
  ['KRW Leipzig', 35, 'roller-blank rollers'],
  ['STOBER Drives', 36, 'planetary'],
  ['Framo Morat', 37, 'hub'],
  ['SCHOTT', 38, 'glass'],
  ['Hydro Rein, Atlas Renewable Energy & Albras', null, 'solar-power'],
];

const byNode = new Map();
for (const [name, tile, ids] of companies) {
  for (const id of ids.split(' ')) byNode.set(id, { name, tile });
}

const countryCodes = {
  Belgium: 'be', Brazil: 'br', France: 'fr', Germany: 'de', Italy: 'it', Japan: 'jp',
  Norway: 'no', Poland: 'pl', Slovenia: 'si', 'South Korea': 'kr', Sweden: 'se',
  'United Kingdom': 'gb', 'United States': 'us',
};
const logoURL = new URL('./assets/identity/companies.webp', import.meta.url).href;
const flagURL = new URL('./assets/identity/flags.svg', import.meta.url).href;

function companyMark(tile) {
  const clip = document.createElement('span');
  clip.className = 'identity-logo';
  clip.setAttribute('aria-hidden', 'true');
  const image = document.createElement('img');
  image.alt = '';
  image.decoding = 'async';
  image.style.left = `-${tile * 100}%`;
  image.addEventListener('error', () => clip.remove(), { once: true });
  image.src = logoURL;
  clip.append(image);
  return clip;
}

function siteFlag(country, code) {
  const box = document.createElement('span');
  box.className = 'identity-flag';
  box.dataset.country = code;
  box.setAttribute('role', 'img');
  box.setAttribute('aria-label', 'Site in ' + country);
  box.title = country;
  box.textContent = code.toUpperCase();
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 640 480');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS(ns, 'use');
  use.setAttribute('href', flagURL + '#flag-' + code);
  svg.append(use);
  box.append(svg);
  return box;
}

export function companyIdentity(node) {
  const { name, tile } = byNode.get(node.id) ?? { name: node.site };
  const country = node.place?.split(',').at(-1).trim();
  const row = document.createElement('span');
  row.className = 'supply-identity';
  const text = document.createElement('span');
  text.className = 'identity-name';
  text.textContent = name;
  if (tile != null) row.append(companyMark(tile));
  row.append(text);
  if (countryCodes[country]) row.append(siteFlag(country, countryCodes[country]));
  return row;
}

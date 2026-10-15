# Urstaat

A minimal Arial coming-soon page for **urstaat.com**, with an unfinished-looking circuit board and cursor-lit traces.

Live: <https://xyleus1.github.io/urstaat/>

## Preview

Open `index.html` directly, or serve this directory:

```sh
python -m http.server 4173
```

Visit <http://localhost:4173>. There are no packages to install or build steps.

## Files

- `index.html` — page content and contact link
- `styles.css` — plain Arial layout; no entrance animation
- `type.js` — hand-set letter impressions, animated in place by reveal.js Auto-Animate
- `traces.js` — component-led PCB with overlapping copper layers, pads, vias, labels, and loose airwires
- `vendor/reveal/` — self-hosted reveal.js runtime and its MIT license
- `favicon.svg` — browser icon

The text is visible immediately. Its letters shift and re-register on an uneven, stop-motion rhythm instead of fading or sliding in. The animation uses a small embedded reveal.js instance with presentation controls and navigation disabled. The runtime is vendored so the site needs no CDN or build step.

The circuit effect supports mouse, pen, and touch. Reduced-motion preferences keep the text still and use an immediate hover highlight. Both effects pause when the page is hidden, and circuit rendering stops after the pointer settles. The heading and email remain usable without JavaScript.

## Publish

Push to `main` to republish through the existing GitHub Pages branch deployment. To use another static host, upload the HTML, CSS, JavaScript, favicon, and `vendor/` directory together.

To use **urstaat.com**, add it as the custom domain in your host's settings, then apply the DNS records supplied by that host at your domain provider. A GitHub push alone does not change the domain's hosting or DNS.

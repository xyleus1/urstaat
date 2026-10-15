# Urstaat

A minimal coming-soon page for **urstaat.com** with cursor-lit PCB traces.

## Preview

Open `index.html` directly, or serve this directory:

```sh
python -m http.server 4173
```

Visit <http://localhost:4173>. There are no packages to install or build steps.

## Files

- `index.html` — page content and contact link
- `styles.css` — responsive layout and subtle entrance/status animation
- `traces.js` — procedural circuit board with a green cursor glow and fading trail
- `favicon.svg` — browser icon

The circuit effect supports mouse, pen, and touch. Reduced-motion preferences disable entrance/status animation and use an immediate hover highlight. Rendering pauses when idle or hidden. The heading and email remain usable without JavaScript.

## Publish

Upload the four site files above to any static host. For GitHub Pages, select **Deploy from a branch**, **main**, **/ (root)** in the repository's **Settings → Pages**.

To use **urstaat.com**, add it as the custom domain in your host's settings, then apply the DNS records supplied by that host at your domain provider. A GitHub push alone does not change the domain's hosting or DNS.

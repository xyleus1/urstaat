# Run before you walk

Robotics and embodied intelligence research by Nima Kamali and Ava Poole.

The website includes an animated ASCII actuator, eight video chapter previews,
the research article, interactive robotics trajectories, and a sources page.

## Preview

Serve this directory over HTTP (Python 3):

```sh
python -m http.server 4173
```

Open http://localhost:4173/. No package installation or build is required to view
or deploy the committed website. ES modules require HTTP rather than file://.

## Pages and source

- `index.html`: homepage; page styles are in `revision/styles.css` and `site/`.
- `research/index.html`: research article.
- `sources/index.html`: asset sources and licenses.
- `site/graph.js`, `site/graph-data.js`, `site/graph.css`: interactive graph.
- `site/videos.js` and `site/video-manifest.json`: real footage previews.
- `hero/renderer.js`: ASCII actuator integration source.
- `hero/assets/`: compressed actuator model, font, attribution, and licenses.

The graph uses illustrative synthetic trajectories, not measured observations.
The sources page and media manifests retain the footage credits and rights notes.

## Rebuild the actuator bundle

The built bundle is committed. After editing `hero/renderer.js`:

```sh
cd hero
npm ci
npm run build
```

## Deployment

GitHub Pages serves the `main` branch root. `.nojekyll` keeps this a plain static
site; `CNAME` retains the existing `urstaat.com` domain. All page and asset paths
are relative, including support for a repository subpath on another static host.

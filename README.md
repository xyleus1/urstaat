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

## Rebuild the annual graph

The graph normalizes each existing curve to 2026 = 100. Its timeline contains
72 historical video stories and 84 future scenario stories. Future stories use
intentional "Sketch forthcoming" placeholders for this release. Their reserved
asset paths and Recraft prompts are in `site/graph-future-stories.json`.
No generation credentials are shipped.

After changing the story manifests, run `node site/build-stories.mjs`.
It validates complete coverage and permits only explicitly declared artwork
placeholders. For the later artwork release, install each sketch at its reserved
path, change its media state to `ready`, and use `--require-art` to enforce all
84 unique images. The committed frontend bundle is generated in `site/`:

```sh
cd site
npm ci
npm test
npm run test:browser
npm run build
node build-stories.mjs
```

The publication check rejects unplanned missing, invalid, or duplicate artwork.
ECharts 6.1.0 and Motion 14.14.0 are bundled
locally; their licenses are included in `site/vendor/LICENSES.txt`.

Development requires Node 22+ and npm. `npm ci` also installs Puppeteer's
managed Chrome; if browser downloads were disabled, run
`npx puppeteer browsers install chrome`. The browser regression check starts
its own local server and blocks third-party requests. It verifies graph
interactions; publisher playback is checked separately in the full website.

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

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
- `research/index.html` and `research/media/`: research article and its figures.
- `sources/index.html`: asset sources and licenses.
- `site/graph.js`, `site/graph-data.js`, `site/graph-model.js`, `site/graph.css`: interactive graph.
- `site/videos.js` and `site/video-manifest.json`: real footage previews.
- `hero/renderer.js`: ASCII actuator integration source.
- `hero/assets/`: compressed actuator model, font, attribution, and licenses.

The graph combines audited publisher observations, historical
reconstructions, and authored future scenarios. Each series uses its own
reported 2025 value as index 100, with one shared compressed display scale.
The sources page documents the metrics and assumptions; media manifests retain
the footage credits and rights notes.

## Graph data and scenarios

Humanoid deployment uses Counterpoint's approximate 16,000 additional
installations in 2025. Earlier counts are unavailable. Its 50,000-unit 2026
scenario anchor conservatively represents a published forecast of **more than**
50,000 shipments; the separately recorded H1 figure of over 22,000 is not a
full-year observation. Robot deployment uses IFR annual industrial installations:
603,307 in 2025 and a 655,000 forecast for 2026. It shares its historical proxy
with Specialist robots. IFR's industrial population and Counterpoint's broader
humanoid population differ, so their observed ratio is not market share.

The authored future robot-deployment trajectory follows the LLM curve's
proportional growth and 2037 pause, reaching about 4.10 billion robots/year by
2040. This is a scenario anchored to industrial installations, not an IFR
forecast or an all-robot census. Humanoid counts initially follow that growth,
then increase sublinearly: with `g = robot deployments / 655000`,
`humanoids = 50000 * (1 + (10 / 0.6) * ((1 + (g - 1) / 10)^0.6 - 1))`.
Counts do not decrease; their modeled fraction falls from about 7.63% in 2026
to 0.95% in 2040. Raw readouts use robots/year and the projected humanoid panel
shows this modeled fraction. Vertical gaps between separately normalized lines
do not show count shares.

The LLM scenario retains its ten-work-year ceiling, with its growth phase
extended by a time factor of 5/9 and its pause starting in 2037.
Interaction data approaches 30 times its inventory, reaching 95% in 2035;
specialist installations peak at four times their 2025 value in 2034 and
ending at one quarter in 2040; and hardware prices approaching a 3% floor with
a 2.2-year half-life above it. Deterministic monotone PCHIP timing variations
soften the pace between fixed 2026, 2030, 2031, 2034, 2035, 2037, and 2040 anchors. They add
no observations. The plot remains continuous and densely sampled; inspection
steps are annual from 2015 through 2026, then 2030, 2035, and 2040.

`site/data/observed-inputs.json` retains the source facts and earlier
HumanoidBench/IFR stock inputs. `site/tests/observed-baseline.json` independently
pins observations and archives the retired benchmark and stock fixtures in
`retiredSeries`; those older measures are not deployment counts.

## Rebuild the graph

The story manifests contain 72 historical video stories and 84 future scenario
stories. Future stories use
intentional "Sketch forthcoming" placeholders for this release. Their reserved
asset paths and Recraft prompts are in `site/graph-future-stories.json`.
No generation credentials are shipped.

After changing the story manifests, run `node site/build-stories.mjs`.
It validates complete coverage and permits only explicitly declared artwork
placeholders. For the later artwork release, install each sketch at its reserved
path, change its media state to `ready`, and use `--require-art` to enforce all
84 unique images. The numerical generator writes the runtime module
`site/graph-model.js`. To rebuild it offline from the audited inputs,
install the pinned Python dependencies as well as the frontend dependencies:

```sh
cd site
npm ci
python -m pip install -r scripts/requirements-graph.txt
npm run build:data
node build-stories.mjs
npm run build
npm test
npm run test:browser
```

`npm run refresh:data` rechecks primary sources before rebuilding. If
Counterpoint blocks direct HTML retrieval, it retains the previously verified
snapshot and its verification date with an explicit refresh-status note; no original-byte hash is
asserted for the rendered-article verification.

The publication check rejects unplanned missing, invalid, or duplicate artwork.
ECharts 6.1.0, D3 Scale 4.0.2, and Motion 14.14.0 are bundled
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

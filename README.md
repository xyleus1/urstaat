# Urstaat

A minimal Arial coming-soon page for **urstaat.com**, with an unfinished-looking circuit board and cursor-lit traces.

Custom domain: **urstaat.com**. GitHub Pages is configured for this domain; public availability also requires the GoDaddy DNS records below.

## Preview

Open `index.html` directly, or serve this directory:

```sh
python -m http.server 4173
```

Visit <http://localhost:4173>. There are no packages to install or build steps.

## Files

- `index.html` — page content and contact link
- `styles.css` — plain, static Arial text and responsive layout
- `traces.js` — component-led PCB with overlapping copper layers, pads, vias, labels, and loose airwires
- `favicon.svg` — browser icon

The heading and email are ordinary Arial text, visible immediately with no text animation. The site has no dependencies, CDN requests, or build step.

The circuit effect supports mouse, pen, and touch. Reduced-motion preferences use an immediate hover highlight. Circuit rendering pauses when the page is hidden or the pointer settles. The heading and email remain usable without JavaScript.

## Publish

Push to `main` to republish through the existing GitHub Pages branch deployment. To use another static host, upload the HTML, CSS, JavaScript, and favicon together.

### Domain DNS

DNS is hosted at GoDaddy. In the DNS records for **urstaat.com**, replace the two parking `A` records for `@` (`3.33.130.190` and `15.197.148.33`) with these four records:

| Type | Name | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | xyleus1.github.io |

Edit the existing `www` CNAME rather than adding a second one. Leave unrelated records, including email records, in place. Use GoDaddy's default TTL. DNS propagation and GitHub's HTTPS certificate provisioning can take up to 24 hours. Once the certificate is ready, confirm **Enforce HTTPS** is enabled in the repository's **Settings → Pages**.

References: [GitHub custom-domain setup](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site), [GoDaddy DNS records](https://www.godaddy.com/help/manage-dns-records-680).

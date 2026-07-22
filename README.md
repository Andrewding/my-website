# ThermalWear — Brand Product Display Website

A static, front-end-only brand site for heated massage wearables (belts, socks, gloves).
Pure HTML5 + CSS3 (Tailwind, via CDN) + vanilla JavaScript. No build step, no backend, no database.

## 1. Deploy to GitHub Pages

1. Create a new GitHub repository (public, for free GitHub Pages).
2. Upload **everything inside this folder** to the repository root (not into a subfolder).
   `index.html` must sit at the repo root — that's the required GitHub Pages entry point.
3. In the repo: **Settings → Pages → Source → Deploy from a branch → `main` / root**.
4. Wait ~1 minute, then open the URL GitHub gives you (e.g. `https://yourname.github.io/repo-name/`).

No configuration, no `npm install`, no environment variables needed.

## 2. Preview locally before uploading

Opening `index.html` directly by double-clicking it (`file://...`) will **not** load the product
catalog, because browsers block `fetch()` of local JSON files under the `file://` protocol.
This is a browser security rule, not a bug in the site — it will work correctly once served over
`http://` or `https://` (which is exactly what GitHub Pages does).

To preview locally, run a tiny local server from this folder and open the printed address:

```bash
# Python 3 (already on most systems)
python3 -m http.server 8000
# then open http://localhost:8000/
```

or, with Node installed:

```bash
npx serve .
```

## 3. Folder structure

```
index.html              Homepage — hero carousel, categories, best sellers, recently viewed
products.html           All-products grid with search / category / heat / vibration / price filters
product-detail.html     Single product page (reads ?id=... and renders from data/products.json)
history.html            Full "You Recently Viewed" list + manual "Clear history"
about.html               Brand story (static)
contact.html              Message form (static demo — see note below)
shipping.html             Shipping Policy (static)
return.html               Return & Refund Policy (static)
privacy.html               Privacy Policy (static, cookie/GDPR notes)
data/products.json      ALL product data — the single file to edit for new/updated products
assets/css/style.css    Design tokens + custom component styles
assets/js/main.js       Nav, cookie consent, browsing-history storage, helpers
assets/js/products.js   Catalog loading, card rendering, search/filter, product-detail rendering
assets/images/products/ Product photos (currently placeholder SVGs, see below)
assets/images/brand/    Logo + hero banner placeholders
```

## 4. Editing products (no code changes needed)

Everything a product needs lives in **`data/products.json`**. To add, edit, or remove a product:

1. Open `data/products.json` in any text editor.
2. Copy an existing product object as a template, or edit one in place.
3. Fields to fill in from your Amazon listing: `title`, `shortDescription`, `description`,
   `price`, `features` (bullet points), `specs` (material/voltage/battery/size/weight),
   `colors`, `sizes`, `models`, `faqs`, and `functions` (`temperature` / `vibration` / `heatingDisplay`).
4. To take a product off the site, delete its object from the `products` array (or add a
   custom `"active": false` flag and filter on it in `assets/js/products.js` if you want a
   quick on/off toggle without deleting data).
5. Save the file and re-upload/commit — GitHub Pages updates automatically on push.

**Images/videos:** put files in `assets/images/products/` (or `assets/videos/`) and reference them
with a relative path in the product's `image`, `gallery`, and `video` fields, e.g.
`"assets/images/products/my-belt-main.jpg"`. Keep filenames web-safe (lowercase, hyphens, no spaces).

**Currently the site ships with placeholder SVG product photos** (simple line-art icons) and
placeholder `[bracketed]` copy, exactly as requested, so you can drop in real Amazon photos and
listing text without touching any HTML/JS.

## 5. Browsing history — how it works

- Stored entirely in the visitor's own browser via `localStorage` — no server/database involved.
- Persists after closing the browser tab or window (until the visitor clears site data).
- Only starts recording **after** the visitor accepts the cookie banner (EU/GDPR-style consent).
- A "Clear history" button is available on the `history.html` page.
- Because there is no backend in this version, "guest" and "registered" visitors are treated the
  same way (both use local browser storage). The `assets/js/main.js` file marks this in comments
  so it's easy to swap in real per-account sync later.

## 6. Reserved for future e-commerce phase

Per the phased scope, this version has **no cart, checkout, payment, or order system**. Two
integration points are already in place for later:
- `product-detail.html` has an "Ask About This Product" button that can become "Add to Cart".
- `assets/js/products.js` keeps all product/price data in one place, ready to feed a cart module.

## 7. Before going live — things to connect

- **Contact form** (`contact.html`) currently just shows an on-page confirmation; it does not
  send email. Connect a form backend (Formspree, Netlify Forms, or your own endpoint) by changing
  the `<form>` action or the submit handler in `assets/js/main.js`.
- **Legal pages** (`shipping.html`, `return.html`, `privacy.html`) contain placeholder `[...]`
  text. Replace with your real policies and have them reviewed for your target markets (EU/UK/US).
- **Reviews section** on the product page is a labeled placeholder, ready for an Amazon review
  import later.
- **Product photos**: replace the placeholder SVGs with real photography/video.

## 8. Self-check performed before delivery

Three passes were run against the generated code:
1. **Paths & resources** — every `href`/`src` in all 9 HTML files (214 references) was verified
   to resolve to a real file; no absolute paths; no 404s.
2. **Responsive rendering** — every page was rendered headlessly at desktop (1440px) and mobile
   (390px) widths with zero console or network errors, and visually reviewed as screenshots.
3. **Core functions** — 25 automated end-to-end checks covering the cookie banner (accept/decline
   paths), browsing history recording/clearing, category quick links, global search, category/
   price/function filters, product gallery + FAQ interactions, related products, and the contact
   form — all passed.

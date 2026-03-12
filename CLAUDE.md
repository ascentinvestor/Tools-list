# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**AscentInvestor** — a personal finance tools website for Indian investors, deployed on Netlify at `ascentinvestor.netlify.app` / `www.ascentinvestor.in`.

**Build system**: Zero-dependency Node.js (`node build.js`). Netlify runs this on every deploy and publishes from `dist/`.

```bash
node build.js          # assemble dist/ from src/
node migrate.js        # one-time migration tool (not needed after initial run)
npx serve dist/        # local preview of built output
```

## Project Structure

```
src/
  pages/           ← Source HTML pages (lean — page-specific content only)
  partials/        ← Shared HTML snippets (header, footer, head-common, etc.)
  assets/
    css/           ← Shared CSS (reset, layout, components, blog)
    js/            ← Shared JS (utils, charts, mobile-menu)
public/            ← Static files copied verbatim to dist/ (images, favicon, sitemap)
dist/              ← Build output (gitignored, Netlify publishes this)
build.js           ← Site assembler (zero external deps)
netlify.toml       ← Build config + cache headers + pretty-URL redirects
```

## Pages (authored in src/pages/)

| File | Route | Purpose |
|------|-------|---------|
| `index.html` | `/tools` | Tools landing page |
| `fd-calc.html` | `/fd-calc` | Fixed Deposit calculator |
| `tax-calc.html` | `/tax-calc` | Income Tax calculator (Old vs New regime) |
| `swp-calc.html` | `/swp-calc` | Systematic Withdrawal Plan calculator |
| `retirement-calc.html` | `/retirement-calc` | Retirement planning calculator |
| `fire-calc.html` | `/fire-calc` | FIRE calculator (5 variants, Indian context) |
| `portfolio.html` | `/portfolio` | Mutual fund portfolio screenshot tracker |
| `blogs.html` | `/blogs` | Blog listing page |
| `blog-*.html` | `/blog-*` | Individual blog articles |

Legal pages (verbatim, no partial injection): `privacy-policy.html`, `refund-policy.html`, `terms-conditions.html`, `fb-disclaimer.html`.

SEO/verification files (in `public/`): `sitemap.xml`, `BingSiteAuth.xml`, `google28730d30145fb2d6.html`.

## Partial Tokens (used in src/pages/ source files)

Each source page starts with a config block:
```html
<!-- @config
nav_current: tools
-->
```

Available tokens injected by `build.js`:

| Token | What it injects |
|-------|----------------|
| `<!-- @partial head-common -->` | charset, viewport, AdSense meta, preconnects, favicon, CSS links |
| `<!-- @partial header-main -->` | Full nav (Tools/Blogs/Portfolio), skip-link, mobile menu |
| `<!-- @partial header-blog -->` | Blog nav (Tools/Blogs only, logo → YouTube) |
| `<!-- @partial footer-main -->` | Footer with Portfolio link |
| `<!-- @partial footer-calc -->` | Footer without Portfolio link |
| `<!-- @partial fonts-async -->` | Async Google Fonts load |
| `<!-- @partial adsense -->` | AdSense async script + `<ins>` ad units |

`nav_current` values: `tools`, `blogs`, `portfolio` — sets `aria-current="page"` on the matching nav link.

## Shared Assets

### CSS (src/assets/css/)
- `reset.css` — Full Tailwind-inspired normalization reset
- `layout.css` — `.container`, `.header`, `.nav`, `.footer`, `.skip-link`, `.main`
- `components.css` — `.card`, `.form-group`, `.slider`, `.table`, `.results`, `.badge`, icon utilities
- `blog.css` — `.article-*`, `.breadcrumb`, `.like-*`, `.comments-*`

### JS (src/assets/js/)
- `utils.js` — `formatCurrency()`, `formatDate()`, `rawFmt()` (simple version)
- `charts.js` — `drawPieChart()`, `drawLineChart()` (canvas-based, no Chart.js)
- `mobile-menu.js` — Hamburger menu toggle (auto-loaded via header partials)

**Note**: Calculator logic stays **inline** in each page's `<script>` block (not extracted — single use).

## Architecture Notes

- **Brand color**: `#4f46e5` (indigo)
- **Charts**: Custom canvas drawing (`charts.js`), no Chart.js CDN except on `blog-interactive-sip-guide.html`
- **`blog-interactive-sip-guide.html`**: Uses Tailwind CDN + Chart.js CDN — skip_head_partial=true, no shared reset.css
- **`fire-calc.html`**: Has its own sophisticated `rawFmt()` with Cr/L formatting — do NOT replace with utils.js version
- **Google AdSense**: `ca-pub-4584710287882818`

## When Adding a New Page

1. Copy a similar page from `src/pages/` as starting point
2. Add `<!-- @config nav_current: tools -->` at top (or `blogs`, `portfolio`)
3. Add appropriate `<!-- @partial head-common -->`, `<!-- @partial header-main -->`, `<!-- @partial footer-main -->` tokens
4. Add a `<url>` entry to `public/sitemap.xml`
5. Add a card/link in `src/pages/index.html` (calculators) or `src/pages/blogs.html` (articles)
6. Run `node build.js` — new page appears in `dist/`

## When Changing Navigation

Edit only `src/partials/header-main.html` (or `header-blog.html`) — change propagates to all pages on next `node build.js` run.

## When Changing Footer

Edit only `src/partials/footer-main.html` or `src/partials/footer-calc.html`.

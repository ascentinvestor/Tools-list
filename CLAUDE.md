# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**AscentInvestor** — a personal finance tools website for Indian investors, deployed on Netlify at `ascentinvestor.netlify.app` / `www.ascentinvestor.in`.

**Build system**: Astro SSR with `@astrojs/netlify` adapter. Netlify runs `yarn build` on every deploy; SSR function goes to `.netlify/build/`, static assets to `dist/`.

```bash
yarn dev           # local dev server (http://localhost:4321)
yarn build         # production build → dist/ + .netlify/build/
yarn preview       # preview production build locally
```

## Project Structure

```
src/
  pages/           ← Astro page files (.astro) — each maps to a route
  layouts/         ← Shared page layouts (BaseLayout, CalcLayout, BlogLayout)
  components/      ← Shared Astro components (HeadCommon, HeaderMain, HeaderBlog, FooterMain, FooterCalc, FontsAsync, AdSense)
  data/            ← Server-side data (fd-rates.ts — FD rates config + defaults)
public/
  assets/
    css/           ← Shared CSS (reset, layout, components, blog) — served at /assets/css/
    js/            ← Shared JS (utils, charts, mobile-menu) — served at /assets/js/
  *.png, favicon.ico, sitemap.xml, BingSiteAuth.xml, google*.html
dist/              ← Build output (gitignored, Netlify publishes this)
src/pages-html-backup/  ← Old HTML source files (reference only, not built)
astro.config.mjs   ← Astro config (output: 'server', netlify adapter)
netlify.toml       ← Build config + cache headers
```

## Pages (src/pages/)

| File | Route | Purpose |
|------|-------|---------|
| `index.astro` | `/` | 301 redirect → `/tools` |
| `tools.astro` | `/tools` | Tools landing page |
| `fd-calc.astro` | `/fd-calc` | Fixed Deposit calculator (SSR pre-computed defaults) |
| `tax-calc.astro` | `/tax-calc` | Income Tax calculator (Old vs New regime, SSR defaults) |
| `swp-calc.astro` | `/swp-calc` | Systematic Withdrawal Plan calculator (SSR defaults) |
| `retirement-calc.astro` | `/retirement-calc` | Retirement planning calculator (SSR defaults) |
| `fire-calc.astro` | `/fire-calc` | FIRE calculator (5 variants, Indian context) |
| `portfolio.astro` | `/portfolio` | Mutual fund portfolio screenshot tracker |
| `blogs.astro` | `/blogs` | Blog listing page |
| `blog-sip-guide.astro` | `/blog-sip-guide` | Blog article |
| `blog-fire-movement-guide.astro` | `/blog-fire-movement-guide` | Blog article |
| `blog-tax-planning-guide.astro` | `/blog-tax-planning-guide` | Blog article |
| `blog-interactive-sip-guide.astro` | `/blog-interactive-sip-guide` | Interactive blog (Tailwind CDN + Chart.js CDN) |

Legal pages (self-contained, no shared layouts): `privacy-policy.astro`, `refund-policy.astro`, `terms-conditions.astro`, `fb-disclaimer.astro`.

SEO/verification files (in `public/`): `sitemap.xml`, `BingSiteAuth.xml`, `google28730d30145fb2d6.html`.

## Layouts

| Layout | Props | Use for |
|--------|-------|---------|
| `BaseLayout.astro` | `title`, `description?`, `skipHeadCommon?`, `noAdsense?` | Root layout — all pages |
| `CalcLayout.astro` | `title`, `description?`, `navCurrent?` | Calculator pages (wraps BaseLayout + HeaderMain + FooterCalc) |
| `BlogLayout.astro` | `title`, `description?`, `skipHeadCommon?`, `noAdsense?` | Blog articles (wraps BaseLayout + HeaderBlog + FooterMain + blog.css) |

## Components

| Component | Props | Purpose |
|-----------|-------|---------|
| `HeadCommon.astro` | — | charset, viewport, AdSense meta, preconnects, favicon, shared CSS links |
| `HeaderMain.astro` | `navCurrent?: 'tools' \| 'blogs' \| 'portfolio' \| ''` | Full nav (Tools/Blogs/Portfolio) + mobile menu |
| `HeaderBlog.astro` | `navCurrent?: 'tools' \| 'blogs' \| ''` | Blog nav (Tools/Blogs only, logo → YouTube) + mobile menu |
| `FooterMain.astro` | — | Footer with Portfolio link |
| `FooterCalc.astro` | — | Footer without Portfolio link |
| `FontsAsync.astro` | — | Async Google Fonts loader |
| `AdSense.astro` | — | AdSense script + ad units |

`navCurrent` sets `aria-current="page"` on the matching nav link.

## Shared Assets (public/assets/)

### CSS (public/assets/css/)
- `reset.css` — Full Tailwind-inspired normalization reset
- `layout.css` — `.container`, `.header`, `.nav`, `.footer`, `.skip-link`, `.main`
- `components.css` — `.card`, `.form-group`, `.slider`, `.table`, `.results`, `.badge`, icon utilities
- `blog.css` — `.article-*`, `.breadcrumb`, `.like-*`, `.comments-*`

### JS (public/assets/js/)
- `utils.js` — `formatCurrency()`, `formatDate()`, `rawFmt()` (simple version)
- `charts.js` — `drawPieChart()`, `drawLineChart()` (canvas-based, no Chart.js)
- `mobile-menu.js` — Hamburger menu toggle (auto-loaded via header components)

**Note**: Calculator logic stays **inline** in each page's `<script is:inline>` block (not extracted — single use).

## Architecture Notes

- **SSR**: All pages rendered server-side per-request via Netlify Lambda function (`.netlify/build/entry.mjs`)
- **Brand color**: `#4f46e5` (indigo)
- **Charts**: Custom canvas drawing (`charts.js`), no Chart.js CDN except on `blog-interactive-sip-guide.astro`
- **`blog-interactive-sip-guide.astro`**: Uses Tailwind CDN + Chart.js CDN — `skipHeadCommon={true}` and `noAdsense={true}` passed to BlogLayout
- **`fire-calc.astro`**: Has its own sophisticated `rawFmt()` with Cr/L formatting — do NOT replace with utils.js version
- **Google AdSense**: `ca-pub-4584710287882818`
- **Inline scripts**: Calculator JS uses `<script is:inline>` to prevent Astro bundling
- **Inline external scripts**: `<script src="/assets/js/mobile-menu.js" is:inline>` required — Astro errors if you reference public/ files without `is:inline`
- **Page styles**: Use `<style is:global>` for page-specific CSS to prevent Astro scoping
- **FD rates data**: `src/data/fd-rates.ts` — hardcoded config, easy to swap for an API call later

## SSR Pre-computation

Calculator pages import data/defaults and compute initial results in the Astro frontmatter (server-side). This makes default results visible in the HTML before any JS runs. Example pattern:

```astro
---
import { FD_DEFAULTS, FD_RATES } from '../data/fd-rates';
const { principal, interestRate, years, compounding } = FD_DEFAULTS;
const maturity = principal * Math.pow(1 + interestRate / 100 / compounding, compounding * years);
---
<p id="maturity-amount">{maturity.toLocaleString('en-IN')}</p>
```

## When Adding a New Page

1. Copy a similar page from `src/pages/` as starting point
2. Choose the right layout: `CalcLayout` for tools, `BlogLayout` for articles, `BaseLayout` for other
3. Set `navCurrent` prop on the layout (values: `tools`, `blogs`, `portfolio`)
4. Add a `<url>` entry to `public/sitemap.xml`
5. Add a card/link in `src/pages/tools.astro` (calculators) or `src/pages/blogs.astro` (articles)
6. Run `yarn build` — new page appears in `dist/`

## When Changing Navigation

Edit only `src/components/HeaderMain.astro` (or `HeaderBlog.astro`) — change propagates to all pages automatically.

## When Changing Footer

Edit only `src/components/FooterMain.astro` or `src/components/FooterCalc.astro`.

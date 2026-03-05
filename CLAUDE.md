# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**AscentInvestor** — a personal finance tools website for Indian investors, deployed on Netlify at `ascentinvestor.netlify.app` / `www.ascentinvestor.in`. There is no build system, no package manager, and no framework. Every page is a self-contained `.html` file with inline `<style>` and `<script>` tags.

To preview locally, open any HTML file directly in a browser or use a simple static file server:
```bash
npx serve .
# or
python3 -m http.server 8080
```

## Site Structure

| File | Route | Purpose |
|------|-------|---------|
| `index.html` | `/tools` | Tools landing page (lists all calculators) |
| `fd-calc.html` | `/fd-calc` | Fixed Deposit calculator |
| `tax-calc.html` | `/tax-calc` | Income Tax calculator (Old vs New regime) |
| `swp-calc.html` | `/swp-calc` | Systematic Withdrawal Plan calculator |
| `retirement-calc.html` | `/retirement-calc` | Retirement planning calculator |
| `portfolio.html` | `/portfolio` | Mutual fund portfolio screenshot tracker |
| `blogs.html` | `/blogs` | Blog listing page |
| `blog-*.html` | `/blog-*` | Individual blog articles |

Legal pages: `privacy-policy.html`, `refund-policy.html`, `terms-conditions.html`, `fb-disclaimer.html`.

SEO/verification files: `sitemap.xml`, `BingSiteAuth.xml`, `google28730d30145fb2d6.html`.

## Architecture

- **No shared CSS or JS files.** Each page duplicates the header, nav, footer, and base CSS reset. When changing navigation links or shared UI, update every affected file.
- **CSS** is written inline in `<style>` tags using Tailwind-inspired utility patterns (not an actual Tailwind build — just hand-written utility-style CSS).
- **Charts** are loaded from a CDN (typically Chart.js) via `<script>` tags; no local copies.
- **Google AdSense** (`ca-pub-4584710287882818`) is included in main pages.
- **Brand color**: `#4f46e5` (indigo).

## When Adding a New Page

1. Copy an existing page as a starting point to inherit the header/nav/footer/CSS reset pattern.
2. Add a `<url>` entry to `sitemap.xml`.
3. Add a card/link in the appropriate listing page (`index.html` for calculators, `blogs.html` for articles).


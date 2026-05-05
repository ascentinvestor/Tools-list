---
name: AscentInvestor build system architecture
description: Key architectural decisions and patterns for the AscentInvestor static site build system (build.js + src/ structure)
type: project
---

## Build System (build.js)

- Zero-dependency Node.js assembler: reads src/pages/*.html, injects partials, resolves nav tokens, writes to dist/
- Partial injection via `<!-- @partial <name> -->` HTML comments
- Page config via `<!-- @config\nkey: value\n-->` block stripped before output
- Nav active state via `{{NAV_TOOLS}}`, `{{NAV_BLOGS}}`, `{{NAV_PORTFOLIO}}` placeholders resolved to `aria-current="page"` or empty string
- Assets (CSS/JS) copied from src/assets/ to dist/assets/
- Static files (images, favicon, sitemap) live in public/ and are copied verbatim to dist/

## Partial system

Partials live in src/partials/:
- head-common.html — charset, viewport, adsense meta, preconnects, favicons, preload, shared CSS links (reset/layout/components)
- header-main.html — skip link + sticky header with logo + nav (includes mobile-menu.js script)
- header-blog.html — same structure but logo links to YouTube; only Tools/Blogs nav (no Portfolio)
- footer-main.html — full footer with Portfolio link in Quick Links
- footer-calc.html — footer without Portfolio link
- fonts-async.html — async Google Fonts loader + noscript fallback
- adsense.html — async AdSense script + two <ins> ad slots

## Shared CSS files (dist/assets/css/)

- reset.css — Tailwind-inspired normalization
- layout.css — container, header, nav, footer, skip-link, .main padding
- components.css — icons, card, form-group, slider, results, table, badge
- blog.css — exists but is NOT linked from head-common.html; blog pages still carry inline blog CSS

## Known issues found in review (2026-03-12)

1. blog.css is not linked in head-common.html — blog pages carry duplicate inline blog CSS
2. header-blog.html has {{NAV_PORTFOLIO}} placeholder missing — any page using header-blog that sets nav_current:portfolio would leave a stray {{NAV_PORTFOLIO}} token
3. fd-calc.html main element missing id="main-content" — skip link target is broken
4. drawLineChart in charts.js: division by (data.length - 1) causes NaN when data has exactly 1 point
5. dist/ is gitignored but already exists with committed files at root level (old pre-migration HTMLs still at root)
6. netlify.toml: 1-hour HTML cache is aggressive for a build-on-deploy site — stale dist on CDN edge until TTL expires
7. resolveNavCurrent leaves trailing space in empty attribute: `class="nav-link" >` — minor HTML artifact

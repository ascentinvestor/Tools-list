#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "🔓 Clearing stale git lock..."
rm -f .git/index.lock

# ── 1. Commit the big feature branch ─────────────────────────────────────────
echo ""
echo "📦 Committing feature/portfolio-tracker-and-site-improvements..."
git checkout feature/portfolio-tracker-and-site-improvements

git add package.json \
        public/assets/css/layout.css \
        public/portfolio-data.json \
        scripts/capture-portfolio.js \
        src/components/HeadCommon.astro \
        src/pages/blogs.astro \
        src/pages/portfolio.astro \
        src/pages/tools.astro

git commit -m "feat: automated portfolio tracker + site-wide improvements

Portfolio Tracker: SSR from portfolio-data.json, timeline chart, day-over-day diffs, notes, stats bar
Groww capture script: Playwright + real Chrome, persistent session, --force flag
Tools page: Portfolio Tracker card, trust strip, og:image, https canonical
Blogs page: gradient hero icons, category badges, canonical/og tags
Navigation: active page underline indicator in layout.css
SEO: og:image, robots meta, JSON-LD schema in HeadCommon

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

git push -u origin feature/portfolio-tracker-and-site-improvements

gh pr create \
  --title "feat: automated portfolio tracker + site-wide improvements" \
  --body "## Summary
- **Portfolio Tracker**: rebuilt with SSR data source, timeline chart, day-over-day gain/loss diffs, per-entry value + notes, and stats bar
- **Groww capture script** (\`scripts/capture-portfolio.js\`): Playwright with real Chrome (avoids Google bot detection), persistent login session, \`--force\` re-capture flag, daily scheduled task
- **Tools page**: added missing Portfolio Tracker card, trust strip, contextual badges, https canonical, og:image
- **Blogs page**: unique gradient + SVG hero icons per card, category badges, Featured label, missing canonical/og tags added
- **Navigation**: active page now shows indigo underline via \`[aria-current=page]\` CSS
- **SEO**: og:image, robots meta, and JSON-LD WebSite schema added to HeadCommon

## Test plan
- [ ] Run \`yarn dev\` and verify all 6 tool cards appear on /tools
- [ ] Verify active nav link shows indigo underline on each page
- [ ] Check /blogs for gradient card images and category badges
- [ ] Run \`npm run capture\` — Chrome should open Groww for first-time login
- [ ] After login, verify screenshot appears in \`public/portfolio-screenshots/\`
- [ ] Check /portfolio for timeline chart and diff badges

🤖 Generated with [Claude Code](https://claude.com/claude-code)"

echo "✅ Feature PR created!"

# ── 2. Commit the blog fix branch ────────────────────────────────────────────
echo ""
echo "🔧 Committing fix/blog-interactive-sip-layout..."
git checkout fix/blog-interactive-sip-layout
rm -f .git/index.lock

git add src/pages/blog-interactive-sip-guide.astro

git commit -m "fix: restore layout on blog-interactive-sip-guide page

The page uses skipHeadCommon=true (to avoid Tailwind conflicts with
reset.css) but this also skipped layout.css, which defines .container,
.header, .nav, .footer and all structural classes used by BlogLayout.

Fix: explicitly load /assets/css/layout.css in the page head slot so
the header, nav, container padding, and footer render correctly.

Also fixed:
- favicon and logo hrefs missing leading slash (would 404 on sub-paths)
- http:// -> https:// in all canonical/og/twitter URLs
- Added og:image and twitter:image for social sharing

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

git push -u origin fix/blog-interactive-sip-layout

gh pr create \
  --title "fix: restore layout on blog-interactive-sip-guide page" \
  --body "## Problem
The interactive SIP blog page was broken — all content had zero left padding and the header/footer had no styling.

**Root cause:** \`skipHeadCommon={true}\` is set on this page (intentionally, to prevent Tailwind CDN from conflicting with the site's \`reset.css\`). But that also skipped \`layout.css\`, which defines every structural class used by \`BlogLayout\` — \`.container\`, \`.header\`, \`.nav\`, \`.footer\`, \`.logo\`, \`.main\` etc. Without it, everything rendered at full width with no padding.

## Fix
Added \`<link rel=\"stylesheet\" href=\"/assets/css/layout.css\">\` explicitly in the page's \`<Fragment slot=\"head\">\`. This restores the header, nav, container padding, and footer without loading \`reset.css\` (which would conflict with Tailwind Preflight).

## Also fixed
- Favicon and logo \`href\` paths missing leading \`/\` (would 404 on any sub-path)
- \`http://\` → \`https://\` in all canonical / og / twitter URLs
- Added \`og:image\` and \`twitter:image\` for social sharing

## Test plan
- [ ] Visit \`/blog-interactive-sip-guide\` and confirm header, nav, and content have correct padding/styling
- [ ] Confirm interactive charts (compounding + RCA simulation) still work
- [ ] Check that favicon loads correctly

🤖 Generated with [Claude Code](https://claude.com/claude-code)"

echo "✅ Fix PR created!"

# ── Cleanup ───────────────────────────────────────────────────────────────────
rm -- "$0"
echo ""
echo "🎉 Both PRs raised. push.sh removed."

#!/usr/bin/env node
/**
 * One-time migration script.
 * Transforms root HTML files into src/pages/ source templates.
 *
 * Run once: node migrate.js
 * Then verify src/pages/ output and delete this file.
 */

const fs   = require('fs');
const path = require('path');

const ROOT     = __dirname;
const SRC_DEST = path.join(ROOT, 'src', 'pages');

// ─── Page config map ────────────────────────────────────────────────────────
// Defines how to transform each page.
const PAGE_CONFIG = {
    'index.html':                  { nav_current: 'tools',     header: 'header-main', footer: 'footer-main', adsense: true },
    'blogs.html':                  { nav_current: 'blogs',     header: 'header-main', footer: 'footer-main', adsense: true },
    'portfolio.html':              { nav_current: 'portfolio', header: 'header-main', footer: 'footer-main', adsense: true },
    'fd-calc.html':                { nav_current: 'tools',     header: 'header-main', footer: 'footer-calc', adsense: true },
    'swp-calc.html':               { nav_current: 'tools',     header: 'header-main', footer: 'footer-calc', adsense: true },
    'tax-calc.html':               { nav_current: 'tools',     header: 'header-main', footer: 'footer-calc', adsense: true },
    'retirement-calc.html':        { nav_current: 'tools',     header: 'header-main', footer: 'footer-calc', adsense: true },
    'fire-calc.html':              { nav_current: 'tools',     header: 'header-main', footer: 'footer-calc', adsense: true },
    'blog-sip-guide.html':         { nav_current: 'blogs',     header: 'header-blog', footer: 'footer-main', adsense: true },
    'blog-fire-movement-guide.html': { nav_current: 'blogs',   header: 'header-blog', footer: 'footer-main', adsense: true },
    'blog-tax-planning-guide.html':  { nav_current: 'blogs',   header: 'header-blog', footer: 'footer-main', adsense: true },
    'blog-interactive-sip-guide.html': { nav_current: 'blogs', header: 'header-blog', footer: 'footer-main', adsense: false, skip_head_partial: true },
    'privacy-policy.html':         { verbatim: true },
    'refund-policy.html':          { verbatim: true },
    'terms-conditions.html':       { verbatim: true },
    'fb-disclaimer.html':          { verbatim: true },
};

// ─── CSS patterns to strip (shared rules now in linked CSS files) ────────────
// Full reset block — from line-start marker to [hidden]{display:none}
const RESET_BLOCK_REGEX = /\s*\/\*.*?Minified CSS.*?\*\/\s*|(?:\/\*[^*]*\*\/)?\s*\*,\*::before,\*::after\{box-sizing:border-box[^}]*\}[\s\S]*?\[hidden\]\{display:none\}\s*/g;

// Layout CSS selectors to strip
const LAYOUT_SELECTORS = [
    /\.container\{[^}]*\}\s*/g,
    /@media \(min-width:\d+px\)\{\.container\{[^}]*\}\}\s*/g,
    /\.header\{[^}]*\}\s*/g,
    /\.header-content\{[^}]*\}\s*/g,
    /\.header-flex\{[^}]*\}\s*/g,
    /\.logo\{[^}]*\}\s*/g,
    /\.logo:hover\{[^}]*\}\s*/g,
    /\.logo img\{[^}]*\}\s*/g,
    /\.nav\{[^}]*\}\s*/g,
    /@media \(min-width:\d+px\)\{\.nav\{[^}]*\}\}\s*/g,
    /\.nav a\{[^}]*\}\s*/g,
    /\.nav a:hover\{[^}]*\}\s*/g,
    /\.nav-link\{[^}]*\}\s*/g,
    /\.nav-link:hover\{[^}]*\}\s*/g,
    /\.menu-btn\{[^}]*\}\s*/g,
    /@media \(min-width:\d+px\)\{\.menu-btn\{[^}]*\}\}\s*/g,
    /\.main\{[^}]*\}\s*/g,
    /@media \(min-width:\d+px\)\{\.main\{[^}]*\}\}\s*/g,
    /\.footer\{[^}]*\}\s*/g,
    /\.footer-content\{[^}]*\}\s*/g,
    /@media \(min-width:\d+px\)\{\.footer-content\{[^}]*\}\}\s*/g,
    /@media \(min-width:\d+px\)\{\.footer-bottom\{[^}]*\}\}\s*/g,
    /\.footer-title\{[^}]*\}\s*/g,
    /\.footer-text\{[^}]*\}\s*/g,
    /\.footer-links\{[^}]*\}\s*/g,
    /\.footer-links li\{[^}]*\}\s*/g,
    /\.footer-links a\{[^}]*\}\s*/g,
    /\.footer-links a:hover\{[^}]*\}\s*/g,
    /\.footer-links svg\{[^}]*\}\s*/g,
    /\.footer-bottom\{[^}]*\}\s*/g,
    /\.skip-link\{[^}]*\}\s*/g,
    /\.skip-link:focus\{[^}]*\}\s*/g,
];

// Component CSS selectors to strip
const COMPONENT_SELECTORS = [
    // Icon utilities
    /\.icon\{[^}]*\}\s*/g,
    /\.icon-sm\{[^}]*\}\s*/g,
    /\.icon-lg\{[^}]*\}\s*/g,
    /\.icon-purple\{[^}]*\}\s*/g,
    /\.icon-rose\{[^}]*\}\s*/g,
    /\.icon-emerald\{[^}]*\}\s*/g,
    /\.icon-indigo\{[^}]*\}\s*/g,
    /\.icon-bg\{[^}]*\}\s*/g,
    /\.icon-bg-purple\{[^}]*\}\s*/g,
    /\.icon-bg-rose\{[^}]*\}\s*/g,
    /\.icon-bg-emerald\{[^}]*\}\s*/g,
    /\.icon-bg-indigo\{[^}]*\}\s*/g,
    /\.icon-bg-amber\{[^}]*\}\s*/g,
    // Card
    /\.card\{[^}]*\}\s*/g,
    // Form group
    /\.form-group\{[^}]*\}\s*/g,
    /\.form-group label\{[^}]*\}\s*/g,
    /\.form-group input,\.form-group select\{[^}]*\}\s*/g,
    /\.form-group input:focus,\.form-group select:focus\{[^}]*\}\s*/g,
    // Slider
    /\.slider-container\{[^}]*\}\s*/g,
    /\.slider\{[^}]*\}\s*/g,
    /\.slider::-webkit-slider-thumb\{[^}]*\}\s*/g,
    /\.slider::-moz-range-thumb\{[^}]*\}\s*/g,
    // Results
    /\.results\{[^}]*\}\s*/g,
    /\.result-item\{[^}]*\}\s*/g,
    /\.result-label\{[^}]*\}\s*/g,
    /\.result-value\{[^}]*\}\s*/g,
    // Table
    /\.table-container\{[^}]*\}\s*/g,
    /\.table\{[^}]*\}\s*/g,
    /\.table th,\.table td\{[^}]*\}\s*/g,
    /\.table th\{[^}]*\}\s*/g,
    /\.table tr:hover\{[^}]*\}\s*/g,
    // Badge
    /\.badge\{[^}]*\}\s*/g,
    // Body rule (in reset.css)
    /body\{[^}]*\}\s*/g,
    // Short 3-line reset used by calc pages
    /\*,\*::before,\*::after\{box-sizing:border-box;margin:0;padding:0\}\s*/g,
    // Blog-specific selectors (now in blog.css)
    /\.breadcrumb\{[^}]*\}\s*/g,
    /\.breadcrumb a\{[^}]*\}\s*/g,
    /\.breadcrumb a:hover\{[^}]*\}\s*/g,
    /\.article-header\{[^}]*\}\s*/g,
    /\.article-title\{[^}]*\}\s*/g,
    /@media \(min-width:\d+px\)\{\.article-title\{[^}]*\}\}\s*/g,
    /\.article-meta\{[^}]*\}\s*/g,
    /\.article-meta-item\{[^}]*\}\s*/g,
    /\.article-content\{[^}]*\}\s*/g,
    /@media \(min-width:\d+px\)\{\.article-content\{[^}]*\}\}\s*/g,
    /\.article-content h1\{[^}]*\}\s*/g,
    /\.article-content h2\{[^}]*\}\s*/g,
    /\.article-content h3\{[^}]*\}\s*/g,
    /\.article-content h4\{[^}]*\}\s*/g,
    /\.article-content p\{[^}]*\}\s*/g,
    /\.article-content ul\{[^}]*\}\s*/g,
    /\.article-content ul li\{[^}]*\}\s*/g,
    /\.article-content blockquote\{[^}]*\}\s*/g,
    /\.article-content hr\{[^}]*\}\s*/g,
    /\.article-content strong\{[^}]*\}\s*/g,
    /\.article-content em\{[^}]*\}\s*/g,
    /\.article-content a\{[^}]*\}\s*/g,
    /\.article-content a:hover\{[^}]*\}\s*/g,
    /\.article-content ol\{[^}]*\}\s*/g,
    /\.article-content ol li\{[^}]*\}\s*/g,
    /\.article-content img\{[^}]*\}\s*/g,
    /\.article-content pre\{[^}]*\}\s*/g,
    /\.article-content code\{[^}]*\}\s*/g,
    /\.article-content table\{[^}]*\}\s*/g,
    /\.article-content th\{[^}]*\}\s*/g,
    /\.article-content td\{[^}]*\}\s*/g,
    /\.article-image-placeholder\{[^}]*\}\s*/g,
    /\.back-to-blogs\{[^}]*\}\s*/g,
    /\.back-to-blogs:hover\{[^}]*\}\s*/g,
    /\.article-interaction\{[^}]*\}\s*/g,
    /@media \(min-width:\d+px\)\{\.article-interaction\{[^}]*\}\}\s*/g,
    /\.like-section\{[^}]*\}\s*/g,
    /\.like-btn\{[^}]*\}\s*/g,
    /\.like-btn:hover\{[^}]*\}\s*/g,
    /\.like-btn\.liked\{[^}]*\}\s*/g,
    /\.like-btn\.liked:hover\{[^}]*\}\s*/g,
    /\.like-btn\.liked \.like-icon\{[^}]*\}\s*/g,
    /\.like-icon\{[^}]*\}\s*/g,
    /\.comments-section\{[^}]*\}\s*/g,
    /\.comments-title\{[^}]*\}\s*/g,
    /\.comment-form\{[^}]*\}\s*/g,
    /\.form-label\{[^}]*\}\s*/g,
    /\.form-input,\.form-textarea\{[^}]*\}\s*/g,
    /\.form-input:focus,\.form-textarea:focus\{[^}]*\}\s*/g,
    /\.form-textarea\{[^}]*\}\s*/g,
    /\.submit-btn\{[^}]*\}\s*/g,
    /\.submit-btn:hover\{[^}]*\}\s*/g,
    /\.submit-btn:disabled\{[^}]*\}\s*/g,
    /\.comments-list\{[^}]*\}\s*/g,
    /\.comment-item\{[^}]*\}\s*/g,
    /\.comment-header\{[^}]*\}\s*/g,
    /\.comment-author\{[^}]*\}\s*/g,
    /\.comment-date\{[^}]*\}\s*/g,
    /\.comment-text\{[^}]*\}\s*/g,
    /\.empty-comments\{[^}]*\}\s*/g,
    // Blog mobile media block (max-width:640px)
    /@media \(max-width:640px\)\{[\s\S]*?\}\s*/g,
];

function stripSharedCSS(styleContent) {
    // 1. Strip full reset block
    styleContent = styleContent.replace(RESET_BLOCK_REGEX, '\n');

    // 2. Strip layout selectors
    for (const re of LAYOUT_SELECTORS) {
        styleContent = styleContent.replace(re, '');
    }

    // 3. Strip component selectors
    for (const re of COMPONENT_SELECTORS) {
        styleContent = styleContent.replace(re, '');
    }

    // Clean up empty @media blocks left behind
    styleContent = styleContent.replace(/@media [^{]+\{\s*\}/g, '');

    // Strip CSS comments left behind (e.g. section comments from extracted blocks)
    styleContent = styleContent.replace(/\/\*[\s\S]*?\*\//g, '');

    // Clean up excess whitespace left behind
    styleContent = styleContent.replace(/\n{3,}/g, '\n\n').trim();

    return styleContent;
}

// ─── HEAD replacement ────────────────────────────────────────────────────────
// Replaces the block from <meta charset> through the last preload/preconnect
// line (just before the page-specific SEO meta tags) with @partial head-common.

function replaceHead(html, config) {
    if (config.skip_head_partial) return html;

    // Strategy: Remove all head boilerplate that's now in head-common,
    // then inject <!-- @partial head-common --> right after <head>

    // 1. Remove AdSense meta (now in head-common)
    html = html.replace(/\s*<meta name="google-adsense-account"[^>]*>/g, '');

    // 2. Remove standalone charset + viewport
    html = html.replace(/\s*<meta charset="UTF-8">/g, '');
    html = html.replace(/\s*<meta name="viewport"[^>]*>/g, '');

    // 3. Remove Apple touch icon lines that appear before <title>
    html = html.replace(/\s*<!-- Apple Touch Icon[^>]*-->/g, '');
    html = html.replace(/\s*<link rel="apple-touch-icon" sizes="192x192"[^>]*>/g, '');
    // Note: apple-touch-icon 180x180 is in head-common, strip duplicates
    html = html.replace(/\s*<link rel="apple-touch-icon" sizes="180x180" href="logo-ai\.png">/g, '');

    // 4. Remove preconnect block
    html = html.replace(/\s*<!-- Preconnect for faster font loading -->\s*<link rel="preconnect"[^>]*>\s*<link rel="preconnect"[^>]*>/g, '');

    // 5. Remove favicon block
    html = html.replace(/\s*<!-- Favicon -->\s*<link rel="icon"[^>]*>\s*<link rel="shortcut icon"[^>]*>/g, '');
    html = html.replace(/\s*<meta name="msapplication-TileImage"[^>]*>/g, '');
    html = html.replace(/\s*<meta name="theme-color"[^>]*>/g, '');

    // 6. Remove preload block
    html = html.replace(/\s*<!-- Preload critical images[^>]*-->\s*<link rel="preload"[^\n]*/g, '');

    // 7. Remove the synchronous Google Fonts link (fire-calc pattern)
    html = html.replace(/\s*<link href="https:\/\/fonts\.googleapis\.com[^>]*rel="stylesheet">/g, '');
    html = html.replace(/\s*<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*rel="stylesheet">/g, '');

    // 8. Inject <!-- @partial head-common --> right after <head>
    html = html.replace('<head>', '<head>\n    <!-- @partial head-common -->');

    return html;
}

// ─── Inline style stripping ──────────────────────────────────────────────────
function processInlineStyles(html) {
    return html.replace(/<style>([\s\S]*?)<\/style>/, (match, styleContent) => {
        const cleaned = stripSharedCSS(styleContent);
        if (cleaned.trim()) {
            return `<style>\n${cleaned}\n    </style>`;
        }
        return ''; // Remove empty style blocks
    });
}

// ─── Header replacement ──────────────────────────────────────────────────────
function replaceHeader(html, headerPartial) {
    // Match: optional skip link + <header ...> through </header>
    const headerRegex = /(\s*<!-- Accessibility: Skip Link -->\s*<a[^>]*class="skip-link"[^>]*>[^<]*<\/a>\s*)?(\s*<!-- Header -->\s*)?<header[\s\S]*?<\/header>/;
    return html.replace(headerRegex, `\n    <!-- @partial ${headerPartial} -->`);
}

// ─── Footer replacement ──────────────────────────────────────────────────────
function replaceFooter(html, footerPartial) {
    // Match: <!-- Footer --> + <footer...> through </footer>
    const footerRegex = /\s*<!-- Footer -->\s*<footer[\s\S]*?<\/footer>/;
    return html.replace(footerRegex, `\n\n    <!-- @partial ${footerPartial} -->`);
}

// ─── Fonts replacement ───────────────────────────────────────────────────────
function replaceFonts(html) {
    // Synchronous Google Fonts link (fire-calc pattern)
    html = html.replace(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>\s*/g, '');

    // Async Google Fonts pattern + noscript
    const asyncFontsRegex = /\s*<!-- Load Google Fonts asynchronously -->\s*<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>[^<]*<noscript>[^<]*<link[^>]*><\/noscript>/;
    if (asyncFontsRegex.test(html)) {
        html = html.replace(asyncFontsRegex, '\n    <!-- @partial fonts-async -->');
    }

    return html;
}

// ─── AdSense replacement ─────────────────────────────────────────────────────
function replaceAdsense(html) {
    // Pattern 1: Dynamic injection + <ins> tags (index.html pattern)
    const fullAdsenseRegex = /\s*<!-- Load AdSense[^>]*-->\s*<script>[\s\S]*?adsbygoogle[\s\S]*?<\/script>\s*<!-- Responsive_ads -->\s*<ins[\s\S]*?<\/ins>\s*<!-- Display_ads -->\s*<ins[\s\S]*?<\/ins>/;
    if (fullAdsenseRegex.test(html)) {
        return html.replace(fullAdsenseRegex, '\n\n    <!-- @partial adsense -->');
    }

    // Pattern 2: Dynamic injection only (fd-calc pattern, no <ins> tags)
    const shortAdsenseRegex = /\s*<!-- Load AdSense[^>]*-->\s*<script>[\s\S]*?document\.head\.appendChild\(script\)[\s\S]*?<\/script>/;
    if (shortAdsenseRegex.test(html)) {
        return html.replace(shortAdsenseRegex, '\n\n    <!-- @partial adsense -->');
    }

    // Pattern 3: Defer script (fire-calc pattern)
    const deferAdsenseRegex = /\s*<script defer src="https:\/\/pagead2\.googlesyndication\.com[^>]*><\/script>/;
    if (deferAdsenseRegex.test(html)) {
        return html.replace(deferAdsenseRegex, '\n\n    <!-- @partial adsense -->');
    }

    return html;
}

// ─── Process a single page ───────────────────────────────────────────────────
function migratePage(filename, config) {
    const srcPath  = path.join(ROOT, filename);
    const destPath = path.join(SRC_DEST, filename);

    if (!fs.existsSync(srcPath)) {
        console.warn(`  ⚠ Not found: ${filename}`);
        return;
    }

    if (config.verbatim) {
        // Legal pages — copy unchanged
        fs.copyFileSync(srcPath, destPath);
        console.log(`  ✓ ${filename} (verbatim)`);
        return;
    }

    let html = fs.readFileSync(srcPath, 'utf8');

    // Apply transformations in order
    html = replaceHead(html, config);
    html = processInlineStyles(html);
    html = replaceHeader(html, config.header);
    html = replaceFooter(html, config.footer);
    html = replaceFonts(html);
    if (config.adsense) html = replaceAdsense(html);

    // Prepend @config block
    const configBlock = `<!-- @config\nnav_current: ${config.nav_current}\n-->\n`;
    html = configBlock + html;

    fs.writeFileSync(destPath, html, 'utf8');
    console.log(`  ✓ ${filename}`);
}

// ─── Main ────────────────────────────────────────────────────────────────────
console.log('🔄 Migrating pages to src/pages/...\n');

if (!fs.existsSync(SRC_DEST)) {
    fs.mkdirSync(SRC_DEST, { recursive: true });
}

for (const [filename, config] of Object.entries(PAGE_CONFIG)) {
    migratePage(filename, config);
}

console.log('\n✅ Migration complete. Review src/pages/ before running build.js.');

#!/usr/bin/env node
/**
 * AscentInvestor static site builder
 * Zero external dependencies — uses only Node.js built-ins.
 *
 * Algorithm:
 *   1. Load all partials from src/partials/ into a Map.
 *   2. For each .html in src/pages/:
 *      a. Parse <!-- @config key: value --> block (stripped from output).
 *      b. Replace <!-- @partial <name> --> tokens with partial content.
 *      c. Resolve {{NAV_TOOLS}} / {{NAV_BLOGS}} / {{NAV_PORTFOLIO}} based on nav_current.
 *      d. Write assembled HTML to dist/.
 *   3. Copy src/assets/ → dist/assets/ (CSS, JS).
 *   4. Copy public/ → dist/ verbatim (images, favicon, sitemap, SEO files).
 */

const fs   = require('fs');
const path = require('path');

const ROOT       = __dirname;
const SRC_PAGES  = path.join(ROOT, 'src', 'pages');
const PARTIALS   = path.join(ROOT, 'src', 'partials');
const ASSETS_SRC = path.join(ROOT, 'src', 'assets');
const PUBLIC_DIR = path.join(ROOT, 'public');
const DIST_DIR   = path.join(ROOT, 'dist');

// ─── Helpers ───────────────────────────────────────────────────────────────

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyDir(src, dest) {
    ensureDir(dest);
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath  = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// ─── Load partials ─────────────────────────────────────────────────────────

const partialMap = new Map();

if (fs.existsSync(PARTIALS)) {
    for (const file of fs.readdirSync(PARTIALS)) {
        if (!file.endsWith('.html')) continue;
        const name    = path.basename(file, '.html'); // e.g. "header-main"
        const content = fs.readFileSync(path.join(PARTIALS, file), 'utf8');
        partialMap.set(name, content);
    }
}

// ─── Parse @config block ───────────────────────────────────────────────────
// Matches: <!-- @config\n  key: value\n  ... -->
// Returns { config: { key: value, ... }, source: string-with-config-stripped }

function parseConfig(source) {
    const config = {};
    const configRegex = /<!--\s*@config\s*([\s\S]*?)-->/;
    const match = source.match(configRegex);

    if (match) {
        const body = match[1];
        for (const line of body.split('\n')) {
            const kv = line.match(/^\s*(\w+)\s*:\s*(.+)\s*$/);
            if (kv) config[kv[1].trim()] = kv[2].trim();
        }
        source = source.replace(configRegex, '').replace(/^\n/, '');
    }

    return { config, source };
}

// ─── Inject partials ───────────────────────────────────────────────────────

function injectPartials(source) {
    return source.replace(/<!--\s*@partial\s+([\w-]+)\s*-->/g, (_, name) => {
        if (partialMap.has(name)) return partialMap.get(name);
        console.warn(`  ⚠ Partial not found: "${name}"`);
        return '';
    });
}

// ─── Resolve nav_current markers ──────────────────────────────────────────
// Replaces {{NAV_TOOLS}}, {{NAV_BLOGS}}, {{NAV_PORTFOLIO}} with aria-current="page"
// on the active link, empty string on the others.

const NAV_KEYS = ['tools', 'blogs', 'portfolio'];

function resolveNavCurrent(source, navCurrent) {
    for (const key of NAV_KEYS) {
        const placeholder = `{{NAV_${key.toUpperCase()}}}`;
        const value = navCurrent === key ? ' aria-current="page"' : '';
        source = source.split(placeholder).join(value);
    }
    // Clean up any double spaces left by empty token replacements
    source = source.replace(/ {2,}>/g, '>');
    return source;
}

// ─── Build pages ───────────────────────────────────────────────────────────

function buildPages() {
    if (!fs.existsSync(SRC_PAGES)) {
        console.warn('src/pages/ not found — skipping page build.');
        return 0;
    }

    let count = 0;

    for (const file of fs.readdirSync(SRC_PAGES)) {
        if (!file.endsWith('.html')) continue;

        try {
            let source = fs.readFileSync(path.join(SRC_PAGES, file), 'utf8');

            // 1. Parse @config
            const { config, source: stripped } = parseConfig(source);
            source = stripped;

            // 2. Inject partials
            source = injectPartials(source);

            // 3. Resolve nav current markers
            source = resolveNavCurrent(source, config.nav_current || '');

            // 4. Warn on any unresolved tokens
            const leftover = source.match(/\{\{NAV_\w+\}\}/g) || source.match(/<!--\s*@partial\s+[\w-]+\s*-->/g);
            if (leftover) {
                console.warn(`  ⚠ Unresolved tokens in ${file}: ${leftover.join(', ')}`);
            }

            // 5. Write to dist/
            fs.writeFileSync(path.join(DIST_DIR, file), source, 'utf8');
            count++;
        } catch (err) {
            console.error(`  ✗ Failed to build ${file}: ${err.message}`);
        }
    }

    return count;
}

// ─── Main ──────────────────────────────────────────────────────────────────

console.log('🔨 AscentInvestor build starting...\n');

// Clean dist/ before building to prevent stale files from accumulating
if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
ensureDir(DIST_DIR);

// Build pages
const pageCount = buildPages();
console.log(`✓ Built ${pageCount} pages → dist/`);

// Copy assets (CSS, JS)
if (fs.existsSync(ASSETS_SRC)) {
    copyDir(ASSETS_SRC, path.join(DIST_DIR, 'assets'));
    console.log('✓ Copied src/assets/ → dist/assets/');
}

// Copy public files (images, favicon, sitemap, SEO verification files)
if (fs.existsSync(PUBLIC_DIR)) {
    copyDir(PUBLIC_DIR, DIST_DIR);
    console.log('✓ Copied public/ → dist/');
}

console.log('\n✅ Build complete.');

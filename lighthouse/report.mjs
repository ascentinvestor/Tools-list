/**
 * Lighthouse results reporter
 *
 * Reads lighthouse/results.db and prints a summary table to stdout.
 *
 * Usage:
 *   node lighthouse/report.mjs                   # last 3 runs, all URLs
 *   node lighthouse/report.mjs --runs 5          # last 5 runs
 *   node lighthouse/report.mjs --url /fd-calc    # filter by URL substring
 *   node lighthouse/report.mjs --trend /fd-calc  # score trend over time for one URL
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath    = join(__dirname, 'results.db');

if (!existsSync(dbPath)) {
  console.error('No results.db found. Run `yarn lighthouse:run` first.');
  process.exit(1);
}

const db   = new Database(dbPath, { readonly: true });
const args = process.argv.slice(2);

// ── Arg helpers ───────────────────────────────────────────────────────────────

function arg(flag, defaultVal) {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : defaultVal;
}
function hasFlag(flag) { return args.includes(flag); }

// ── Color helpers ─────────────────────────────────────────────────────────────

function color(n) {
  if (n === null || n === undefined) return '\x1b[90m';
  if (n >= 90) return '\x1b[32m';
  if (n >= 50) return '\x1b[33m';
  return '\x1b[31m';
}
const reset = '\x1b[0m';
const bold  = '\x1b[1m';

function colorScore(n) {
  const label = n != null ? String(n).padStart(3) : '  -';
  return `${color(n)}${label}${reset}`;
}

// ── Trend mode ────────────────────────────────────────────────────────────────

const trendUrl = arg('--trend', null);

if (trendUrl) {
  const rows = db.prepare(`
    SELECT run_at, performance, accessibility, best_practices, seo,
           lcp_ms, cls, ttfb_ms
    FROM   runs
    WHERE  url LIKE ?
    ORDER  BY run_at ASC
  `).all(`%${trendUrl}%`);

  if (rows.length === 0) {
    console.log(`No data found for URL matching "${trendUrl}"`);
    process.exit(0);
  }

  const url = rows[0].url ?? trendUrl;
  console.log(`\n${bold}Trend: ${url}${reset}`);
  console.log(`${'─'.repeat(88)}`);
  console.log(
    `${'Date (IST)'.padEnd(24)} ${'Perf'.padStart(4)} ${'A11y'.padStart(4)} ` +
    `${'BP'.padStart(4)} ${'SEO'.padStart(4)}  ${'LCP'.padStart(7)}  ${'CLS'.padStart(6)}  ${'TTFB'.padStart(7)}`
  );
  console.log('─'.repeat(88));

  for (const r of rows) {
    const date = new Date(r.run_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const lcp  = r.lcp_ms  != null ? `${(r.lcp_ms / 1000).toFixed(2)}s`  : '     -';
    const cls  = r.cls     != null ? r.cls.toFixed(3)                     : '     -';
    const ttfb = r.ttfb_ms != null ? `${r.ttfb_ms.toFixed(0)}ms`          : '     -';

    console.log(
      `${date.padEnd(24)} ` +
      `${colorScore(r.performance)} ${colorScore(r.accessibility)} ` +
      `${colorScore(r.best_practices)} ${colorScore(r.seo)}  ` +
      `${lcp.padStart(7)}  ${cls.padStart(6)}  ${ttfb.padStart(7)}`
    );
  }
  console.log();
  process.exit(0);
}

// ── Summary mode (default) ────────────────────────────────────────────────────

const maxRuns  = parseInt(arg('--runs', '3'), 10);
const filterUrl = arg('--url', null);

const recentRuns = db.prepare(
  `SELECT DISTINCT run_at FROM runs ORDER BY run_at DESC LIMIT ?`
).all(maxRuns);

if (recentRuns.length === 0) {
  console.log('No runs in DB yet. Run `yarn lighthouse:run` first.');
  process.exit(0);
}

for (const { run_at } of recentRuns) {
  const date = new Date(run_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  console.log(`\n${bold}=== Run: ${date} IST ===${reset}`);
  console.log('─'.repeat(96));
  console.log(
    `${'Path'.padEnd(40)} ${'Perf'.padStart(4)} ${'A11y'.padStart(4)} ` +
    `${'BP'.padStart(4)} ${'SEO'.padStart(4)}  ${'LCP'.padStart(7)}  ${'CLS'.padStart(6)}  ${'TTFB'.padStart(7)}`
  );
  console.log('─'.repeat(96));

  let rows = db.prepare(`
    SELECT url, performance, accessibility, best_practices, seo,
           lcp_ms, cls, ttfb_ms
    FROM   runs
    WHERE  run_at = ?
    ORDER  BY url
  `).all(run_at);

  if (filterUrl) {
    rows = rows.filter(r => r.url.includes(filterUrl));
  }

  for (const r of rows) {
    const path = r.url.replace('https://ascentinvestor.netlify.app', '') || '/';
    const lcp  = r.lcp_ms  != null ? `${(r.lcp_ms / 1000).toFixed(2)}s`  : '     -';
    const cls  = r.cls     != null ? r.cls.toFixed(3)                     : '     -';
    const ttfb = r.ttfb_ms != null ? `${r.ttfb_ms.toFixed(0)}ms`          : '     -';

    console.log(
      `${path.padEnd(40)} ` +
      `${colorScore(r.performance)} ${colorScore(r.accessibility)} ` +
      `${colorScore(r.best_practices)} ${colorScore(r.seo)}  ` +
      `${lcp.padStart(7)}  ${cls.padStart(6)}  ${ttfb.padStart(7)}`
    );
  }
}
console.log();

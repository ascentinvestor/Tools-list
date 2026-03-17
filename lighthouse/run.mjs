/**
 * Lighthouse CI runner
 *
 * Reads all URLs from public/sitemap.xml, runs Lighthouse on each,
 * and persists scores + Core Web Vitals to lighthouse/results.db (SQLite).
 *
 * Usage:
 *   node lighthouse/run.mjs
 *   node lighthouse/run.mjs --urls https://ascentinvestor.netlify.app/tools,https://ascentinvestor.netlify.app/fd-calc
 */

import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── URL source ────────────────────────────────────────────────────────────────

function urlsFromSitemap() {
  const xml = readFileSync(join(__dirname, '../public/sitemap.xml'), 'utf8');
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
}

const argUrlsIdx = process.argv.indexOf('--urls');
const urls =
  argUrlsIdx !== -1
    ? process.argv[argUrlsIdx + 1].split(',').map(u => u.trim())
    : urlsFromSitemap();

// ── Database ──────────────────────────────────────────────────────────────────

const db = new Database(join(__dirname, 'results.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS runs (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    run_at          TEXT    NOT NULL,
    url             TEXT    NOT NULL,
    performance     INTEGER,
    accessibility   INTEGER,
    best_practices  INTEGER,
    seo             INTEGER,
    fcp_ms          REAL,
    lcp_ms          REAL,
    tbt_ms          REAL,
    cls             REAL,
    si_ms           REAL,
    ttfb_ms         REAL
  )
`);

const insertRun = db.prepare(`
  INSERT INTO runs
    (run_at, url, performance, accessibility, best_practices, seo,
     fcp_ms, lcp_ms, tbt_ms, cls, si_ms, ttfb_ms)
  VALUES
    (@run_at, @url, @performance, @accessibility, @best_practices, @seo,
     @fcp_ms, @lcp_ms, @tbt_ms, @cls, @si_ms, @ttfb_ms)
`);

// ── Helpers ───────────────────────────────────────────────────────────────────

const score  = (lhr, cat) => Math.round((lhr.categories[cat]?.score ?? 0) * 100);
const metric = (lhr, key) => lhr.audits[key]?.numericValue ?? null;

function gradeColor(n) {
  if (n === null || n === undefined) return '';
  if (n >= 90) return '\x1b[32m';   // green
  if (n >= 50) return '\x1b[33m';   // yellow
  return '\x1b[31m';                 // red
}
const reset = '\x1b[0m';

// ── Main ──────────────────────────────────────────────────────────────────────

const run_at = new Date().toISOString();
console.log(`\nLighthouse run started: ${run_at}`);
console.log(`Auditing ${urls.length} URL(s)\n`);

const chrome = await chromeLauncher.launch({
  chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'],
});

let passed = 0;
let failed = 0;

for (const url of urls) {
  process.stdout.write(`  ${url.padEnd(60)} `);

  try {
    const result = await lighthouse(url, {
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    });

    const { lhr } = result;

    const perf = score(lhr, 'performance');
    const a11y = score(lhr, 'accessibility');
    const bp   = score(lhr, 'best-practices');
    const seo  = score(lhr, 'seo');

    insertRun.run({
      run_at,
      url,
      performance:    perf,
      accessibility:  a11y,
      best_practices: bp,
      seo,
      fcp_ms:  metric(lhr, 'first-contentful-paint'),
      lcp_ms:  metric(lhr, 'largest-contentful-paint'),
      tbt_ms:  metric(lhr, 'total-blocking-time'),
      cls:     metric(lhr, 'cumulative-layout-shift'),
      si_ms:   metric(lhr, 'speed-index'),
      ttfb_ms: metric(lhr, 'server-response-time'),
    });

    const fmt = n => `${gradeColor(n)}${String(n).padStart(3)}${reset}`;
    console.log(`perf=${fmt(perf)} a11y=${fmt(a11y)} bp=${fmt(bp)} seo=${fmt(seo)}`);
    passed++;
  } catch (err) {
    console.log(`\x1b[31mFAILED\x1b[0m: ${err.message}`);
    failed++;
  }
}

await chrome.kill();

console.log(`\n${'─'.repeat(72)}`);
console.log(`Done.  ${passed} succeeded, ${failed} failed.`);
console.log(`Results stored in lighthouse/results.db  (run_at = ${run_at})\n`);

/**
 * capture-portfolio.js
 *
 * Automatically opens Groww in a persistent browser (remembers your login),
 * navigates to your portfolio, takes a dated screenshot, and updates
 * public/portfolio-data.json.
 *
 * Usage:
 *   node scripts/capture-portfolio.js
 *
 * First run:  A browser window opens. Log in to Groww normally.
 *             Your session is saved — future runs are fully automatic.
 *
 * Requires:  playwright  (already in devDependencies)
 *            Run `npx playwright install chromium` once to install the browser.
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ─── Paths ────────────────────────────────────────────────────────────────────
const __dirname    = path.dirname(fileURLToPath(import.meta.url));
const ROOT         = path.join(__dirname, '..');
const SCREENSHOTS  = path.join(ROOT, 'public', 'portfolio-screenshots');
const DATA_FILE    = path.join(ROOT, 'public', 'portfolio-data.json');
const PROFILE_DIR  = path.join(__dirname, '.browser-profile');   // saved session

// ─── Config ───────────────────────────────────────────────────────────────────
const GROWW_PORTFOLIO_URL = 'https://groww.in/portfolio';
const LOGIN_TIMEOUT_MS    = 5 * 60 * 1000;   // 5 min to log in manually
const LOAD_WAIT_MS        = 60000;            // wait after page load for charts

// ─── Helpers ──────────────────────────────────────────────────────────────────
function todayISO() {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

function loadData() {
  if (!fs.existsSync(DATA_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return []; }
}

function saveData(data) {
  // Sort newest first
  data.sort((a, b) => new Date(b.date) - new Date(a.date));
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const FORCE          = process.argv.includes('--force');
const today          = todayISO();
const screenshotFile = `${today}.png`;
const screenshotPath = path.join(SCREENSHOTS, screenshotFile);
const webPath        = `/portfolio-screenshots/${screenshotFile}`;

// Ensure directories exist
fs.mkdirSync(SCREENSHOTS, { recursive: true });
fs.mkdirSync(PROFILE_DIR,  { recursive: true });

// Skip if already captured today (unless --force is passed)
const existingData = loadData();
if (!FORCE && existingData.find(e => e.date === today)) {
  console.log(`✅ Screenshot already captured for ${today}. Nothing to do.`);
  console.log('   Run with --force to re-capture: node scripts/capture-portfolio.js --force');
  process.exit(0);
}

if (FORCE) {
  console.log('⚡ --force: removing any existing entry for today and re-capturing…');
  const filtered = existingData.filter(e => e.date !== today);
  saveData(filtered);
}

console.log(`📸 Starting portfolio capture for ${today}…`);

const browser = await chromium.launchPersistentContext(PROFILE_DIR, {
  headless: false,          // show browser — needed for first-time login
  channel: 'chrome',        // use real installed Chrome (avoids Google's bot detection)
  viewport: { width: 1440, height: 900 },
  args: [
    '--start-maximized',
    '--disable-blink-features=AutomationControlled',  // hide automation flag
  ],
  ignoreDefaultArgs: ['--enable-automation'],         // remove automation banner
});

const page = await browser.newPage();

try {
  console.log('🌐 Navigating to Groww portfolio…');
  await page.goto(GROWW_PORTFOLIO_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

  // ── Handle login if needed ────────────────────────────────────────────────
  const currentUrl = page.url();
  const needsLogin = currentUrl.includes('/login') || currentUrl.includes('/signin')
    || currentUrl.includes('/auth') || !currentUrl.includes('groww.in/portfolio');

  if (needsLogin) {
    console.log('');
    console.log('🔐 Not logged in. A browser window has opened.');
    console.log('   Please log in to Groww manually. Your session will be saved.');
    console.log(`   (You have ${LOGIN_TIMEOUT_MS / 60000} minutes)`);
    console.log('');

    // Wait for the portfolio URL to appear
    await page.waitForURL('**/portfolio**', { timeout: LOGIN_TIMEOUT_MS });
    console.log('✅ Logged in! Session saved for future runs.');
    // Extra wait for the portfolio to fully render after login
    await page.waitForTimeout(3000);
  }

  // ── Wait for portfolio content to render ─────────────────────────────────
  console.log('⏳ Waiting for portfolio to load…');
  await page.waitForTimeout(LOAD_WAIT_MS);

  // Try to wait for a known portfolio element (best-effort)
  try {
    await page.waitForSelector('[class*="portfolio"], [class*="Portfolio"], [class*="holding"]', {
      timeout: 10000,
    });
  } catch {
    console.log('   (Could not detect portfolio element — taking screenshot anyway)');
  }

  // ── Take screenshot ───────────────────────────────────────────────────────
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`📁 Screenshot saved → ${screenshotFile}`);

  // ── Update portfolio-data.json ────────────────────────────────────────────
  const data = loadData();
  data.push({
    id:         `portfolio-${today}`,
    date:       today,
    screenshot: webPath,
    value:      null,    // fill in manually on the tracker page
    notes:      '',
  });
  saveData(data);
  console.log('✅ portfolio-data.json updated!');
  console.log('');
  console.log('💡 Tip: Open the Portfolio Tracker and enter today\'s total value');
  console.log('   to keep the timeline chart up to date.');

} catch (err) {
  console.error('❌ Capture failed:', err.message);
  process.exit(1);
} finally {
  await browser.close();
}

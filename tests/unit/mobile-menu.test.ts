/**
 * mobile-menu.js tests.
 *
 * Vitest runs with environment: 'jsdom', giving us a real `document` global.
 * We set up the DOM in `document.body`, then load the script by running it
 * with the Function constructor — `document` in the script resolves to the
 * Vitest jsdom global, which is exactly what we want.
 *
 * The script wraps logic in DOMContentLoaded, so we trigger that event
 * manually after injecting the HTML.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const menuSource = readFileSync(
  resolve(__dirname, '../../public/assets/js/mobile-menu.js'),
  'utf-8'
);

function setupDOM() {
  document.body.innerHTML = `
    <div class="menu-btn"><button aria-expanded="false"></button></div>
    <nav class="nav">
      <a class="nav-link" href="/tools">Tools</a>
      <a class="nav-link" href="/blogs">Blogs</a>
    </nav>
  `;

  // Run the script in the Vitest jsdom global scope
  // eslint-disable-next-line no-new-func
  new Function(menuSource)();

  // Fire DOMContentLoaded so the script's event handler runs
  document.dispatchEvent(new Event('DOMContentLoaded'));
}

describe('mobile-menu.js', () => {
  beforeEach(() => {
    setupDOM();
  });

  it('opens nav on button click', () => {
    const btn = document.querySelector('.menu-btn button') as HTMLButtonElement;
    const nav = document.querySelector('.nav') as HTMLElement;
    btn.click();
    expect(nav.classList.contains('nav-open')).toBe(true);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
  });

  it('closes nav on second button click', () => {
    const btn = document.querySelector('.menu-btn button') as HTMLButtonElement;
    const nav = document.querySelector('.nav') as HTMLElement;
    btn.click();
    btn.click();
    expect(nav.classList.contains('nav-open')).toBe(false);
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes nav when a nav-link is clicked', () => {
    const btn = document.querySelector('.menu-btn button') as HTMLButtonElement;
    const nav = document.querySelector('.nav') as HTMLElement;
    const link = document.querySelector('.nav-link') as HTMLAnchorElement;
    btn.click();
    expect(nav.classList.contains('nav-open')).toBe(true);
    link.click();
    expect(nav.classList.contains('nav-open')).toBe(false);
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  it('does nothing if button or nav is missing', () => {
    document.body.innerHTML = '';
    expect(() => {
      new Function(menuSource)();
      document.dispatchEvent(new Event('DOMContentLoaded'));
    }).not.toThrow();
  });
});

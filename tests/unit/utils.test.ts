/**
 * utils.js is a plain script that defines global functions.
 * In Vitest (ESM + jsdom), we load it by extracting and calling
 * each function's source so it runs in the module scope.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(resolve(__dirname, '../../public/assets/js/utils.js'), 'utf-8');

// Use the Function constructor to run the script and capture exports via a
// passed-in container object — avoids ESM eval scope issues entirely.
const exports: Record<string, unknown> = {};
new Function('exports', src + '\nexports.formatCurrency=formatCurrency;exports.formatDate=formatDate;exports.rawFmt=rawFmt;')(exports);

const formatCurrency = exports.formatCurrency as (n: number) => string;
const formatDate = exports.formatDate as (d: Date) => string;
const rawFmt = exports.rawFmt as (n: number) => string;

describe('formatCurrency', () => {
  it('formats whole numbers in en-IN grouping', () => {
    expect(formatCurrency(100000)).toContain('1,00,000');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toMatch(/0/);
  });

  it('formats large amounts with crore grouping', () => {
    expect(formatCurrency(10000000)).toContain('1,00,00,000');
  });

  it('rounds to at most 2 decimal places', () => {
    expect(formatCurrency(1234.567)).toContain('1,234.57');
  });

  it('returns a non-empty string', () => {
    const result = formatCurrency(5000);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('formatDate', () => {
  it('formats 15 Jan 2024 correctly', () => {
    const result = formatDate(new Date(2024, 0, 15));
    expect(result).toContain('2024');
    expect(result).toContain('Jan');
    expect(result).toContain('15');
  });

  it('formats 1 Dec 2025 correctly', () => {
    const result = formatDate(new Date(2025, 11, 1));
    expect(result).toContain('2025');
    expect(result).toContain('Dec');
    expect(result).toContain('1');
  });
});

describe('rawFmt', () => {
  it('includes rupee Unicode character ₹', () => {
    expect(rawFmt(50000)).toContain('\u20B9');
  });

  it('formats with en-IN number grouping', () => {
    expect(rawFmt(100000)).toContain('1,00,000');
  });

  it('rounds to 0 decimal places', () => {
    expect(rawFmt(1234.9)).not.toContain('.');
  });

  it('formats zero', () => {
    expect(rawFmt(0)).toContain('0');
  });
});

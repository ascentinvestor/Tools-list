import { describe, it, expect } from 'vitest';
import { FD_RATES, FD_DEFAULTS, type FDRate } from '../../src/data/fd-rates';

describe('FD_RATES', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(FD_RATES)).toBe(true);
    expect(FD_RATES.length).toBeGreaterThan(0);
  });

  it('every entry has required fields with correct types', () => {
    for (const rate of FD_RATES) {
      expect(typeof rate.bank).toBe('string');
      expect(rate.bank.length).toBeGreaterThan(0);
      expect(typeof rate.tenure).toBe('string');
      expect(rate.tenure.length).toBeGreaterThan(0);
      expect(typeof rate.rateGeneral).toBe('number');
      expect(typeof rate.rateSenior).toBe('number');
    }
  });

  it('senior rates are always >= general rates', () => {
    for (const rate of FD_RATES) {
      expect(rate.rateSenior).toBeGreaterThanOrEqual(rate.rateGeneral);
    }
  });

  it('rates are within realistic range (1–15%)', () => {
    for (const rate of FD_RATES) {
      expect(rate.rateGeneral).toBeGreaterThanOrEqual(1);
      expect(rate.rateGeneral).toBeLessThanOrEqual(15);
      expect(rate.rateSenior).toBeGreaterThanOrEqual(1);
      expect(rate.rateSenior).toBeLessThanOrEqual(15);
    }
  });

  it('includes SBI entries', () => {
    const sbi = FD_RATES.filter(r => r.bank === 'SBI');
    expect(sbi.length).toBeGreaterThan(0);
  });

  it('includes HDFC Bank entries', () => {
    const hdfc = FD_RATES.filter(r => r.bank === 'HDFC Bank');
    expect(hdfc.length).toBeGreaterThan(0);
  });
});

describe('FD_DEFAULTS', () => {
  it('has all required fields', () => {
    expect(FD_DEFAULTS).toHaveProperty('principal');
    expect(FD_DEFAULTS).toHaveProperty('interestRate');
    expect(FD_DEFAULTS).toHaveProperty('years');
    expect(FD_DEFAULTS).toHaveProperty('compounding');
  });

  it('principal is a positive number', () => {
    expect(FD_DEFAULTS.principal).toBeGreaterThan(0);
  });

  it('interestRate is within realistic range', () => {
    expect(FD_DEFAULTS.interestRate).toBeGreaterThan(0);
    expect(FD_DEFAULTS.interestRate).toBeLessThanOrEqual(20);
  });

  it('compounding is quarterly (4)', () => {
    expect(FD_DEFAULTS.compounding).toBe(4);
  });
});

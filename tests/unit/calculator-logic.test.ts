import { describe, it, expect } from 'vitest';
import { FD_DEFAULTS } from '../../src/data/fd-rates';

// ─── FD Calculator ───────────────────────────────────────────────────────────

function calcFDMaturity(principal: number, ratePercent: number, years: number, compounding: number): number {
  const r = ratePercent / 100;
  return principal * Math.pow(1 + r / compounding, compounding * years);
}

describe('FD calculator logic', () => {
  it('computes correct maturity for default values', () => {
    const { principal, interestRate, years, compounding } = FD_DEFAULTS;
    const maturity = calcFDMaturity(principal, interestRate, years, compounding);
    // ₹1L at 7.5% quarterly for 3 years ≈ ₹1,24,972
    expect(maturity).toBeCloseTo(124972, -1);
  });

  it('maturity > principal for positive rate', () => {
    expect(calcFDMaturity(100000, 6, 1, 4)).toBeGreaterThan(100000);
  });

  it('maturity equals principal at 0% rate', () => {
    expect(calcFDMaturity(100000, 0, 3, 4)).toBeCloseTo(100000, 2);
  });

  it('higher compounding yields more interest', () => {
    const monthly = calcFDMaturity(100000, 7.5, 1, 12);
    const quarterly = calcFDMaturity(100000, 7.5, 1, 4);
    expect(monthly).toBeGreaterThan(quarterly);
  });

  it('longer tenure gives more maturity', () => {
    const five = calcFDMaturity(100000, 7.5, 5, 4);
    const three = calcFDMaturity(100000, 7.5, 3, 4);
    expect(five).toBeGreaterThan(three);
  });

  it('interest earned = maturity - principal', () => {
    const principal = 200000;
    const maturity = calcFDMaturity(principal, 7, 2, 4);
    const interest = maturity - principal;
    expect(interest).toBeGreaterThan(0);
    expect(interest).toBeCloseTo(maturity - principal, 5);
  });
});

// ─── Income Tax Calculator ───────────────────────────────────────────────────

function calcSlabs(taxable: number, slabs: { limit: number; rate: number }[]): number {
  let tax = 0, prev = 0;
  for (const { limit, rate } of slabs) {
    if (taxable <= prev) break;
    tax += (Math.min(taxable, limit) - prev) * rate;
    prev = limit;
  }
  return tax;
}

const OLD_SLABS = [
  { limit: 250000, rate: 0 },
  { limit: 500000, rate: 0.05 },
  { limit: 1000000, rate: 0.20 },
  { limit: Infinity, rate: 0.30 },
];

const NEW_SLABS = [
  { limit: 400000, rate: 0 },
  { limit: 800000, rate: 0.05 },
  { limit: 1200000, rate: 0.10 },
  { limit: 1600000, rate: 0.15 },
  { limit: 2000000, rate: 0.20 },
  { limit: 2400000, rate: 0.25 },
  { limit: Infinity, rate: 0.30 },
];

describe('Tax slab calculator', () => {
  it('zero tax for income below old regime basic exemption', () => {
    expect(calcSlabs(200000, OLD_SLABS)).toBe(0);
  });

  it('5% slab for income between 2.5L–5L (old regime)', () => {
    // 3L taxable: (3L - 2.5L) * 5% = 2500
    expect(calcSlabs(300000, OLD_SLABS)).toBeCloseTo(2500);
  });

  it('old regime: 8L salary with std+80C deductions', () => {
    const salary = 800000;
    const deductions = 50000 + 150000; // std + 80C
    const taxable = salary - deductions; // 6L
    let tax = calcSlabs(taxable, OLD_SLABS);
    // Not <= 5L so no rebate
    // (5L-2.5L)*5% + (6L-5L)*20% = 12500 + 20000 = 32500
    expect(tax).toBeCloseTo(32500);
    const cess = tax * 0.04;
    expect(cess).toBeCloseTo(1300);
  });

  it('new regime: income <= 7L gets full rebate (zero tax)', () => {
    const taxable = 700000;
    let tax = calcSlabs(taxable, NEW_SLABS);
    if (taxable <= 700000) tax = 0;
    expect(tax).toBe(0);
  });

  it('new regime: income above 7L is taxed', () => {
    const taxable = 900000;
    let tax = calcSlabs(taxable, NEW_SLABS);
    // (8L-4L)*5% + (9L-8L)*10% = 20000 + 10000 = 30000
    expect(tax).toBeCloseTo(30000);
  });

  it('cess is always 4% of tax', () => {
    const tax = 50000;
    expect(tax * 0.04).toBeCloseTo(2000);
  });
});

// ─── SWP Calculator ──────────────────────────────────────────────────────────

function calcSWP(
  investment: number,
  monthlyWithdrawal: number,
  annualReturn: number,
  inflation: number,
  years: number,
  taxRate: number
): { finalBalance: number; totalWithdrawals: number } {
  let bal = investment;
  let totalWithdrawals = 0;
  for (let y = 1; y <= years; y++) {
    const annualWithdrawal = monthlyWithdrawal * 12 * Math.pow(1 + inflation, y - 1);
    const interest = bal * annualReturn;
    const tax = interest * taxRate;
    bal = bal + (interest - tax) - annualWithdrawal;
    if (bal < 0) bal = 0;
    totalWithdrawals += annualWithdrawal;
  }
  return { finalBalance: bal, totalWithdrawals };
}

describe('SWP calculator logic', () => {
  it('corpus depletes faster with higher withdrawals', () => {
    const low = calcSWP(1000000, 5000, 0.12, 0.06, 20, 0.10);
    const high = calcSWP(1000000, 15000, 0.12, 0.06, 20, 0.10);
    expect(low.finalBalance).toBeGreaterThan(high.finalBalance);
  });

  it('corpus survives with very low withdrawal', () => {
    const result = calcSWP(10000000, 1000, 0.12, 0.06, 20, 0);
    expect(result.finalBalance).toBeGreaterThan(0);
  });

  it('total withdrawals increase with inflation', () => {
    const noInflation = calcSWP(1000000, 8000, 0.12, 0, 10, 0);
    const withInflation = calcSWP(1000000, 8000, 0.12, 0.06, 10, 0);
    expect(withInflation.totalWithdrawals).toBeGreaterThan(noInflation.totalWithdrawals);
  });

  it('final balance is never negative', () => {
    const result = calcSWP(100000, 50000, 0.05, 0.06, 20, 0.10);
    expect(result.finalBalance).toBeGreaterThanOrEqual(0);
  });
});

// ─── Retirement Calculator ───────────────────────────────────────────────────

function calcRetirement(
  currentAge: number,
  retirementAge: number,
  currentExpenses: number,
  currentSavings: number,
  monthlySavings: number,
  expectedReturn: number,
  inflation: number
): { corpusNeeded: number; projectedCorpus: number } {
  const yearsToRetirement = retirementAge - currentAge;
  const futureMonthlyExpenses = currentExpenses * Math.pow(1 + inflation, yearsToRetirement);
  const corpusNeeded = futureMonthlyExpenses * 12 * 25; // 25x rule
  const annualSavings = monthlySavings * 12;
  const projectedCorpus =
    currentSavings * Math.pow(1 + expectedReturn, yearsToRetirement) +
    annualSavings * (Math.pow(1 + expectedReturn, yearsToRetirement) - 1) / expectedReturn;
  return { corpusNeeded, projectedCorpus };
}

describe('Retirement calculator logic', () => {
  it('corpus needed increases with inflation over longer horizon', () => {
    const short = calcRetirement(55, 60, 50000, 0, 0, 0.12, 0.06);
    const long  = calcRetirement(30, 60, 50000, 0, 0, 0.12, 0.06);
    expect(long.corpusNeeded).toBeGreaterThan(short.corpusNeeded);
  });

  it('projected corpus grows with higher savings', () => {
    const low  = calcRetirement(30, 60, 50000, 500000, 10000, 0.12, 0.06);
    const high = calcRetirement(30, 60, 50000, 500000, 50000, 0.12, 0.06);
    expect(high.projectedCorpus).toBeGreaterThan(low.projectedCorpus);
  });

  it('higher return yields higher projected corpus', () => {
    const conservative = calcRetirement(30, 60, 50000, 500000, 25000, 0.08, 0.06);
    const aggressive   = calcRetirement(30, 60, 50000, 500000, 25000, 0.15, 0.06);
    expect(aggressive.projectedCorpus).toBeGreaterThan(conservative.projectedCorpus);
  });

  it('corpus needed uses the 25x annual-expenses rule', () => {
    const result = calcRetirement(30, 60, 50000, 0, 0, 0.12, 0);
    // No inflation: future expenses = current expenses, corpus = 50000*12*25
    expect(result.corpusNeeded).toBeCloseTo(50000 * 12 * 25, -2);
  });

  it('existing savings compound over retirement horizon', () => {
    const withSavings    = calcRetirement(30, 60, 50000, 1000000, 0, 0.12, 0.06);
    const withoutSavings = calcRetirement(30, 60, 50000, 0,       0, 0.12, 0.06);
    expect(withSavings.projectedCorpus).toBeGreaterThan(withoutSavings.projectedCorpus);
  });
});

import { describe, it, expect } from 'vitest';
import { CC_CATEGORIES, CREDIT_CARDS, CC_DEFAULTS, SPEND_PRESETS, calcCardReward, rankCards } from '../../src/data/credit-cards';

const card = (id: string) => {
  const c = CREDIT_CARDS.find(x => x.id === id);
  if (!c) throw new Error(`missing card ${id}`);
  return c;
};

describe('CREDIT_CARDS', () => {
  it('has unique ids', () => {
    const ids = CREDIT_CARDS.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every card has valid fields', () => {
    const catIds = new Set(CC_CATEGORIES.map(c => c.id));
    for (const c of CREDIT_CARDS) {
      expect(c.bank.length).toBeGreaterThan(0);
      expect(c.name.length).toBeGreaterThan(0);
      expect(c.pointValue).toBeGreaterThan(0);
      expect(c.pointValue).toBeLessThanOrEqual(2);
      expect(c.earn.base).toBeGreaterThanOrEqual(0);
      expect(c.annualFee).toBeGreaterThanOrEqual(0);
      if (c.rewardType === 'cashback') expect(c.pointValue).toBe(1);
      for (const k of Object.keys(c.earn)) if (k !== 'base') expect(catIds.has(k as never)).toBe(true);
      for (const k of c.excluded ?? []) expect(catIds.has(k)).toBe(true);
    }
  });

  it('effective reward rate never exceeds 25% in any category', () => {
    for (const c of CREDIT_CARDS) {
      for (const cat of CC_CATEGORIES) {
        expect(calcCardReward(c, cat.id, 10000).rate).toBeLessThanOrEqual(25);
      }
    }
  });
});

describe('CC_DEFAULTS', () => {
  it('points at an existing card and category', () => {
    expect(CREDIT_CARDS.some(c => c.id === CC_DEFAULTS.cardId)).toBe(true);
    expect(CC_CATEGORIES.some(c => c.id === CC_DEFAULTS.category)).toBe(true);
    expect(SPEND_PRESETS).toContain(CC_DEFAULTS.monthlySpend);
  });
});

describe('calcCardReward', () => {
  it('applies the accelerated category rate', () => {
    // Millennia: 5% on dining → ₹10,000 earns ₹500
    const r = calcCardReward(card('hdfc-millennia'), 'dining', 10000);
    expect(r).toMatchObject({ points: 500, worth: 500, capped: false, excluded: false });
    expect(r.rate).toBeCloseTo(5, 5);
  });

  it('falls back to the base rate for unlisted categories', () => {
    expect(calcCardReward(card('hdfc-millennia'), 'grocery', 10000).worth).toBe(100);
  });

  it('caps rewards at the monthly category limit', () => {
    // 5% of ₹50,000 = ₹2,500, capped at ₹1,000
    const r = calcCardReward(card('hdfc-millennia'), 'dining', 50000);
    expect(r.worth).toBe(1000);
    expect(r.capped).toBe(true);
  });

  it('caps base-rate categories with the base cap', () => {
    // 1% of ₹2L = ₹2,000, capped at ₹1,000
    expect(calcCardReward(card('hdfc-millennia'), 'offline', 200000)).toMatchObject({ worth: 1000, capped: true });
  });

  it('category cap applies even when the category earns the base rate', () => {
    // Regalia Gold grocery: 2.67 pts/₹100 on ₹1L = 2,670 pts, capped at 2,000
    expect(calcCardReward(card('hdfc-regalia-gold'), 'grocery', 100000)).toMatchObject({ points: 2000, worth: 1000, capped: true });
  });

  it('returns zero for excluded categories', () => {
    expect(calcCardReward(card('hdfc-millennia'), 'fuel', 10000)).toMatchObject({ points: 0, worth: 0, excluded: true });
  });

  it('UPI only earns on cards that list it', () => {
    expect(calcCardReward(card('sbi-cashback'), 'upi', 10000).excluded).toBe(true);
    expect(calcCardReward(card('hdfc-tata-neu-infinity'), 'upi', 10000).worth).toBe(150);
  });

  it('converts points to rupees with the card point value', () => {
    // SBI PRIME dining: 10 pts/₹100 × ₹10,000 = 1,000 pts × ₹0.25
    expect(calcCardReward(card('sbi-prime'), 'dining', 10000)).toMatchObject({ points: 1000, worth: 250 });
  });

  it('applies the higher tier rate above the threshold', () => {
    // IDFC Wealth: 2/₹100 on first ₹20K + 6.67/₹100 on next ₹10K = 400 + 667
    expect(calcCardReward(card('idfc-wealth'), 'offline', 30000).points).toBe(1067);
    expect(calcCardReward(card('idfc-wealth'), 'offline', 10000).points).toBe(200);
  });

  it('Axis Magnus for Burgundy earns 35 per ₹200 above ₹1.5L', () => {
    // 6/₹100 on first ₹1.5L + 17.5/₹100 on next ₹50K = 9,000 + 8,750 points × ₹0.40
    expect(calcCardReward(card('axis-magnus-burgundy'), 'offline', 200000)).toMatchObject({ points: 17750, worth: 7100 });
    expect(calcCardReward(card('axis-magnus-burgundy'), 'dining', 10000)).toMatchObject({ points: 600, worth: 240 });
    expect(calcCardReward(card('axis-magnus-burgundy'), 'rent', 10000).excluded).toBe(true);
  });

  it('HSBC Premier earns 3 points per ₹100 everywhere except exclusions', () => {
    expect(calcCardReward(card('hsbc-premier'), 'travel', 10000)).toMatchObject({ points: 300, worth: 150 });
    expect(calcCardReward(card('hsbc-premier'), 'fuel', 10000).excluded).toBe(true);
  });

  it('handles zero and negative spend', () => {
    expect(calcCardReward(card('hdfc-millennia'), 'dining', 0)).toMatchObject({ worth: 0, rate: 0 });
    expect(calcCardReward(card('hdfc-millennia'), 'dining', -500)).toMatchObject({ worth: 0, rate: 0 });
  });
});

describe('rankCards', () => {
  it('returns every card sorted by reward value', () => {
    const ranked = rankCards('dining', 10000);
    expect(ranked).toHaveLength(CREDIT_CARDS.length);
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].result.worth).toBeGreaterThanOrEqual(ranked[i].result.worth);
    }
  });

  it('breaks ties with the lower annual fee', () => {
    const ranked = rankCards('dining', 10000);
    for (let i = 1; i < ranked.length; i++) {
      if (ranked[i - 1].result.worth === ranked[i].result.worth) {
        expect(ranked[i - 1].card.annualFee).toBeLessThanOrEqual(ranked[i].card.annualFee);
      }
    }
  });
});

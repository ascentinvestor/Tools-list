export type CategoryId =
  | 'dining' | 'online' | 'offline' | 'grocery' | 'travel' | 'hotels'
  | 'fuel' | 'utilities' | 'insurance' | 'rent' | 'education' | 'government'
  | 'wallet' | 'upi' | 'international' | 'entertainment' | 'medical' | 'jewellery';

export interface SpendCategory {
  id: CategoryId;
  label: string;
  icon: string;
}

export interface CreditCard {
  id: string;
  bank: string;
  name: string;
  rewardType: 'cashback' | 'points';
  /** ₹ value of one reward unit (1 for cashback) */
  pointValue: number;
  /** How the point value above is realised */
  pointValueNote?: string;
  /** Reward units earned per ₹100 spent. `base` applies to any category not listed. */
  earn: { base: number } & Partial<Record<CategoryId, number>>;
  /** Max reward units per month, per category (`base` caps categories earning the base rate) */
  caps?: Partial<Record<CategoryId | 'base', number>>;
  /** Higher base rate on monthly spend above a threshold (base-rate categories only) */
  tier?: { above: number; earn: number };
  /** Categories that earn nothing */
  excluded?: CategoryId[];
  annualFee: number;
  popular?: boolean;
  highlight: string;
}

export interface RewardResult {
  points: number;
  worth: number;
  /** Reward value as % of spend */
  rate: number;
  capped: boolean;
  excluded: boolean;
}

export const CC_CATEGORIES: SpendCategory[] = [
  { id: 'dining', label: 'Dining & Food Delivery', icon: '🍽️' },
  { id: 'online', label: 'Online Shopping', icon: '🛒' },
  { id: 'offline', label: 'Offline / In-store', icon: '🏬' },
  { id: 'grocery', label: 'Grocery', icon: '🥦' },
  { id: 'travel', label: 'Flights & Travel', icon: '✈️' },
  { id: 'hotels', label: 'Hotels', icon: '🏨' },
  { id: 'fuel', label: 'Fuel', icon: '⛽' },
  { id: 'utilities', label: 'Utilities & Bills', icon: '💡' },
  { id: 'insurance', label: 'Insurance', icon: '🛡️' },
  { id: 'rent', label: 'Rent', icon: '🏠' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'government', label: 'Government & Taxes', icon: '🏛️' },
  { id: 'wallet', label: 'Wallet Loads', icon: '👛' },
  { id: 'upi', label: 'UPI (RuPay cards)', icon: '📲' },
  { id: 'international', label: 'International', icon: '🌍' },
  { id: 'entertainment', label: 'Movies & Entertainment', icon: '🎬' },
  { id: 'medical', label: 'Medical & Pharmacy', icon: '💊' },
  { id: 'jewellery', label: 'Jewellery & Gold', icon: '💍' },
];

const COMMON_EXCLUSIONS: CategoryId[] = ['fuel', 'rent', 'wallet', 'government'];
const CASHBACK_EXCLUSIONS: CategoryId[] = [...COMMON_EXCLUSIONS, 'utilities', 'insurance', 'education', 'jewellery'];

// Indicative reward structures — issuers revise these often, verify before relying on them
export const CREDIT_CARDS: CreditCard[] = [
  // HDFC Bank
  {
    id: 'hdfc-millennia', bank: 'HDFC Bank', name: 'Millennia', rewardType: 'cashback', pointValue: 1,
    earn: { base: 1, online: 5, dining: 5, entertainment: 5 },
    caps: { online: 1000, dining: 1000, entertainment: 1000, base: 1000 },
    excluded: COMMON_EXCLUSIONS, annualFee: 1000, popular: true,
    highlight: '5% on Amazon, Flipkart, Myntra, Swiggy, Zomato, BookMyShow',
  },
  {
    id: 'hdfc-swiggy', bank: 'HDFC Bank', name: 'Swiggy', rewardType: 'cashback', pointValue: 1,
    earn: { base: 1, dining: 10, online: 5 },
    caps: { dining: 1500, online: 1500, base: 500 },
    excluded: CASHBACK_EXCLUSIONS, annualFee: 500, popular: true,
    highlight: '10% on Swiggy (food, Instamart, Dineout)',
  },
  {
    id: 'hdfc-tata-neu-infinity', bank: 'HDFC Bank', name: 'Tata Neu Infinity', rewardType: 'points', pointValue: 1,
    pointValueNote: '1 NeuCoin = ₹1 on Tata Neu',
    earn: { base: 1.5, grocery: 5, medical: 5, upi: 1.5 },
    caps: { upi: 500 },
    excluded: COMMON_EXCLUSIONS, annualFee: 1499, popular: true,
    highlight: '5% NeuCoins on Tata brands (BigBasket, 1mg, Croma)',
  },
  {
    id: 'hdfc-regalia-gold', bank: 'HDFC Bank', name: 'Regalia Gold', rewardType: 'points', pointValue: 0.5,
    pointValueNote: '₹0.50/point on SmartBuy flights & hotels',
    earn: { base: 2.67 },
    caps: { grocery: 2000 },
    excluded: COMMON_EXCLUSIONS, annualFee: 2500, popular: true,
    highlight: '4 points per ₹150, 5X on Nykaa, Myntra, Reliance Digital',
  },
  {
    id: 'hdfc-infinia', bank: 'HDFC Bank', name: 'Infinia Metal', rewardType: 'points', pointValue: 1,
    pointValueNote: '₹1/point on SmartBuy flights & hotels',
    earn: { base: 3.33 },
    caps: { grocery: 1000 },
    excluded: COMMON_EXCLUSIONS, annualFee: 12500, popular: true,
    highlight: '5 points per ₹150, up to 10X via SmartBuy',
  },
  {
    id: 'hdfc-dcb', bank: 'HDFC Bank', name: 'Diners Club Black Metal', rewardType: 'points', pointValue: 1,
    pointValueNote: '₹1/point on SmartBuy flights & hotels',
    earn: { base: 3.33 },
    caps: { grocery: 1000 },
    excluded: COMMON_EXCLUSIONS, annualFee: 10000,
    highlight: '5 points per ₹150, up to 10X via SmartBuy',
  },
  {
    id: 'hdfc-moneyback-plus', bank: 'HDFC Bank', name: 'MoneyBack+', rewardType: 'points', pointValue: 0.25,
    pointValueNote: '₹0.25/CashPoint as statement credit',
    earn: { base: 1.33, online: 13.33, dining: 13.33, grocery: 13.33 },
    caps: { online: 2500, dining: 2500, grocery: 2500 },
    excluded: COMMON_EXCLUSIONS, annualFee: 500,
    highlight: '10X CashPoints on Amazon, Flipkart, Swiggy, BigBasket',
  },

  // ICICI Bank
  {
    id: 'icici-amazon-pay', bank: 'ICICI Bank', name: 'Amazon Pay', rewardType: 'cashback', pointValue: 1,
    earn: { base: 1, online: 5 },
    excluded: ['fuel', 'rent', 'wallet', 'jewellery'], annualFee: 0, popular: true,
    highlight: '5% on Amazon for Prime members, lifetime free',
  },
  {
    id: 'icici-emeralde-pm', bank: 'ICICI Bank', name: 'Emeralde Private Metal', rewardType: 'points', pointValue: 1,
    pointValueNote: '₹1/point on flights & hotels',
    earn: { base: 3 },
    caps: { grocery: 1000, utilities: 1000, insurance: 1000, education: 1000, rent: 1000, government: 1000 },
    excluded: ['fuel', 'wallet'], annualFee: 12500,
    highlight: '6 points per ₹200, unlimited lounge access',
  },
  {
    id: 'icici-sapphiro', bank: 'ICICI Bank', name: 'Sapphiro', rewardType: 'points', pointValue: 0.25,
    pointValueNote: '₹0.25/point',
    earn: { base: 2, international: 4, utilities: 1, insurance: 1 },
    excluded: ['fuel', 'rent', 'wallet'], annualFee: 3500,
    highlight: '2 points per ₹100, 4 per ₹100 abroad',
  },
  {
    id: 'icici-coral', bank: 'ICICI Bank', name: 'Coral', rewardType: 'points', pointValue: 0.25,
    pointValueNote: '₹0.25/point',
    earn: { base: 2, utilities: 1, insurance: 1 },
    excluded: ['fuel', 'rent', 'wallet'], annualFee: 500,
    highlight: '2 points per ₹100, movie ticket discounts',
  },

  // Axis Bank
  {
    id: 'axis-atlas', bank: 'Axis Bank', name: 'Atlas', rewardType: 'points', pointValue: 1,
    pointValueNote: '₹1/EDGE Mile (conservative; 1:2 airline transfers)',
    earn: { base: 2, travel: 5, hotels: 5 },
    caps: { travel: 10000, hotels: 10000 },
    excluded: [...CASHBACK_EXCLUSIONS], annualFee: 5000, popular: true,
    highlight: '5 EDGE Miles per ₹100 on travel, transfers to airlines',
  },
  {
    id: 'axis-magnus-burgundy', bank: 'Axis Bank', name: 'Magnus for Burgundy', rewardType: 'points', pointValue: 0.4,
    pointValueNote: '₹0.40/point (5:4 airline transfers, valued like Atlas)',
    earn: { base: 6 },
    tier: { above: 150000, earn: 17.5 },
    excluded: [...CASHBACK_EXCLUSIONS], annualFee: 30000, popular: true,
    highlight: '12 points per ₹200, 35 per ₹200 on monthly spends above ₹1.5L',
  },
  {
    id: 'axis-flipkart', bank: 'Axis Bank', name: 'Flipkart', rewardType: 'cashback', pointValue: 1,
    earn: { base: 1, online: 5, travel: 5, dining: 4, entertainment: 4 },
    caps: { online: 1333, travel: 1333 },
    excluded: CASHBACK_EXCLUSIONS, annualFee: 500, popular: true,
    highlight: '5% on Flipkart & Cleartrip, 4% on Swiggy, PVR, Uber',
  },
  {
    id: 'axis-ace', bank: 'Axis Bank', name: 'ACE', rewardType: 'cashback', pointValue: 1,
    earn: { base: 1.5, utilities: 5, dining: 4, travel: 4 },
    caps: { utilities: 500, dining: 500, travel: 500 },
    excluded: ['fuel', 'rent', 'wallet', 'government', 'insurance', 'education', 'jewellery'], annualFee: 499, popular: true,
    highlight: '5% on bills via Google Pay, 1.5% flat on everything else',
  },
  {
    id: 'axis-airtel', bank: 'Axis Bank', name: 'Airtel', rewardType: 'cashback', pointValue: 1,
    earn: { base: 1, utilities: 10, dining: 10, grocery: 10 },
    caps: { utilities: 250, dining: 500, grocery: 500 },
    excluded: ['fuel', 'rent', 'wallet', 'government', 'insurance', 'education', 'jewellery'], annualFee: 500,
    highlight: '25% on Airtel bills, 10% on Swiggy, Zomato, BigBasket',
  },

  // SBI Card
  {
    id: 'sbi-cashback', bank: 'SBI Card', name: 'Cashback', rewardType: 'cashback', pointValue: 1,
    earn: { base: 1, online: 5 },
    caps: { online: 5000, base: 5000 },
    excluded: [...CASHBACK_EXCLUSIONS], annualFee: 999, popular: true,
    highlight: '5% on all online spends, no merchant restrictions',
  },
  {
    id: 'sbi-simplyclick', bank: 'SBI Card', name: 'SimplyCLICK', rewardType: 'points', pointValue: 0.25,
    pointValueNote: '₹0.25/point',
    earn: { base: 1, online: 5, entertainment: 10, travel: 10 },
    caps: { online: 10000, entertainment: 10000, travel: 10000 },
    excluded: ['fuel', 'rent', 'wallet'], annualFee: 499, popular: true,
    highlight: '10X on Amazon, BookMyShow, Cleartrip; 5X other online',
  },
  {
    id: 'sbi-prime', bank: 'SBI Card', name: 'PRIME', rewardType: 'points', pointValue: 0.25,
    pointValueNote: '₹0.25/point',
    earn: { base: 2, dining: 10, grocery: 10, entertainment: 10 },
    excluded: ['fuel', 'rent', 'wallet'], annualFee: 2999,
    highlight: '10 points per ₹100 on dining, groceries, movies',
  },
  {
    id: 'sbi-bpcl-octane', bank: 'SBI Card', name: 'BPCL Octane', rewardType: 'points', pointValue: 0.25,
    pointValueNote: '₹0.25/point',
    earn: { base: 1, fuel: 25, dining: 10, grocery: 10, entertainment: 10 },
    caps: { fuel: 2500, dining: 7500, grocery: 7500, entertainment: 7500 },
    excluded: ['rent', 'wallet'], annualFee: 1499,
    highlight: '25 points per ₹100 on BPCL fuel (~6.25% back)',
  },

  // IDFC FIRST Bank
  {
    id: 'idfc-wealth', bank: 'IDFC FIRST Bank', name: 'Wealth', rewardType: 'points', pointValue: 0.25,
    pointValueNote: '₹0.25/point',
    earn: { base: 2, utilities: 0.67, insurance: 0.67 },
    tier: { above: 20000, earn: 6.67 },
    excluded: ['fuel', 'rent', 'wallet'], annualFee: 0,
    highlight: '10X points on monthly spends above ₹20,000, lifetime free',
  },
  {
    id: 'idfc-millennia', bank: 'IDFC FIRST Bank', name: 'Millennia', rewardType: 'points', pointValue: 0.25,
    pointValueNote: '₹0.25/point',
    earn: { base: 2, utilities: 0.67, insurance: 0.67 },
    tier: { above: 20000, earn: 6.67 },
    excluded: ['fuel', 'rent', 'wallet'], annualFee: 0,
    highlight: '10X points on monthly spends above ₹20,000, lifetime free',
  },

  // American Express
  {
    id: 'amex-platinum-travel', bank: 'American Express', name: 'Platinum Travel', rewardType: 'points', pointValue: 0.5,
    pointValueNote: '₹0.50/point via Gold Collection',
    earn: { base: 2 },
    excluded: ['fuel', 'rent', 'wallet', 'government', 'utilities', 'insurance'], annualFee: 5000,
    highlight: '1 point per ₹50 plus milestone bonuses (not modelled)',
  },
  {
    id: 'amex-mrcc', bank: 'American Express', name: 'Membership Rewards', rewardType: 'points', pointValue: 0.5,
    pointValueNote: '₹0.50/point via Gold Collection',
    earn: { base: 2 },
    excluded: ['fuel', 'rent', 'wallet', 'government', 'utilities', 'insurance'], annualFee: 1500,
    highlight: '1 point per ₹50 plus monthly bonus points (not modelled)',
  },

  // HSBC
  {
    id: 'hsbc-live-plus', bank: 'HSBC', name: 'Live+', rewardType: 'cashback', pointValue: 1,
    earn: { base: 1.5, dining: 10, grocery: 10 },
    caps: { dining: 1000, grocery: 1000 },
    excluded: CASHBACK_EXCLUSIONS, annualFee: 999, popular: true,
    highlight: '10% on dining, food delivery and groceries',
  },
  {
    id: 'hsbc-premier', bank: 'HSBC', name: 'Premier', rewardType: 'points', pointValue: 0.5,
    pointValueNote: '₹0.50/point (1:1 airline & hotel transfers)',
    earn: { base: 3 },
    excluded: COMMON_EXCLUSIONS, annualFee: 0,
    highlight: '3 points per ₹100 on all spends, free for HSBC Premier customers',
  },

  // Federal Bank
  {
    id: 'federal-scapia', bank: 'Federal Bank', name: 'Scapia', rewardType: 'points', pointValue: 0.2,
    pointValueNote: '₹0.20/coin on Scapia travel bookings',
    earn: { base: 10, travel: 20, hotels: 20 },
    excluded: COMMON_EXCLUSIONS, annualFee: 0, popular: true,
    highlight: '10% coins on all spends, 20% on Scapia travel, zero forex',
  },
];

export const CC_DEFAULTS = {
  cardId: 'hdfc-millennia',
  category: 'dining' as CategoryId,
  monthlySpend: 10000,
};

export const SPEND_PRESETS = [2000, 5000, 10000, 15000, 20000, 25000, 50000, 100000, 250000, 500000];

// Keep in sync with the inline calc() in src/pages/credit-card-rewards-calc.astro
export function calcCardReward(card: CreditCard, category: CategoryId, monthlySpend: number): RewardResult {
  const spend = Math.max(0, monthlySpend);
  const isExcluded = card.excluded?.includes(category) || (category === 'upi' && card.earn.upi === undefined);
  if (isExcluded || spend === 0) {
    return { points: 0, worth: 0, rate: 0, capped: false, excluded: isExcluded };
  }

  const special = card.earn[category];
  let points: number;
  if (special !== undefined) {
    points = (spend * special) / 100;
  } else if (card.tier && spend > card.tier.above) {
    points = (card.tier.above * card.earn.base + (spend - card.tier.above) * card.tier.earn) / 100;
  } else {
    points = (spend * card.earn.base) / 100;
  }

  const cap = card.caps?.[category] ?? (special === undefined ? card.caps?.base : undefined);
  const capped = cap !== undefined && points > cap;
  if (capped) points = cap;

  points = Math.round(points);
  const worth = Math.round(points * card.pointValue);
  return { points, worth, rate: (worth / spend) * 100, capped, excluded: false };
}

export function rankCards(category: CategoryId, monthlySpend: number) {
  return CREDIT_CARDS
    .map(card => ({ card, result: calcCardReward(card, category, monthlySpend) }))
    .sort((a, b) => b.result.worth - a.result.worth || a.card.annualFee - b.card.annualFee);
}

export function cardLabel(card: CreditCard) {
  return `${card.bank} ${card.name}`;
}

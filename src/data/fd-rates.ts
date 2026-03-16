export interface FDRate {
  bank: string;
  tenure: string;
  rateGeneral: number;
  rateSenior: number;
}

// Hardcoded FD rates — swap fetchLiveRates() here when a live API is available
export const FD_RATES: FDRate[] = [
  { bank: 'SBI', tenure: '1 Year', rateGeneral: 6.80, rateSenior: 7.30 },
  { bank: 'SBI', tenure: '2 Years', rateGeneral: 7.00, rateSenior: 7.50 },
  { bank: 'SBI', tenure: '3 Years', rateGeneral: 6.75, rateSenior: 7.25 },
  { bank: 'SBI', tenure: '5 Years', rateGeneral: 6.50, rateSenior: 7.50 },
  { bank: 'HDFC Bank', tenure: '1 Year', rateGeneral: 7.10, rateSenior: 7.60 },
  { bank: 'HDFC Bank', tenure: '2 Years', rateGeneral: 7.20, rateSenior: 7.70 },
  { bank: 'HDFC Bank', tenure: '3 Years', rateGeneral: 7.25, rateSenior: 7.75 },
  { bank: 'ICICI Bank', tenure: '1 Year', rateGeneral: 7.10, rateSenior: 7.60 },
  { bank: 'ICICI Bank', tenure: '3 Years', rateGeneral: 7.00, rateSenior: 7.50 },
  { bank: 'Axis Bank', tenure: '1 Year', rateGeneral: 7.10, rateSenior: 7.75 },
  { bank: 'Axis Bank', tenure: '3 Years', rateGeneral: 7.10, rateSenior: 7.75 },
  { bank: 'Kotak Bank', tenure: '1 Year', rateGeneral: 7.10, rateSenior: 7.60 },
  { bank: 'Kotak Bank', tenure: '3 Years', rateGeneral: 7.10, rateSenior: 7.60 },
];

export const FD_DEFAULTS = {
  principal: 100000,
  interestRate: 7.5,
  years: 3,
  compounding: 4, // quarterly
};

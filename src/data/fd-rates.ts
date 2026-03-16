export interface FDRate {
  bank: string;
  tenure: string;
  rateGeneral: number;
  rateSenior: number;
  category: 'PSU' | 'Private' | 'Small Finance';
}

// Hardcoded FD rates — swap fetchLiveRates() here when a live API is available
export const FD_RATES: FDRate[] = [
  // PSU Banks
  { bank: 'SBI', tenure: '7–45 days', rateGeneral: 3.50, rateSenior: 4.00, category: 'PSU' },
  { bank: 'SBI', tenure: '46–179 days', rateGeneral: 5.50, rateSenior: 6.00, category: 'PSU' },
  { bank: 'SBI', tenure: '180–364 days', rateGeneral: 6.25, rateSenior: 6.75, category: 'PSU' },
  { bank: 'SBI', tenure: '1 Year', rateGeneral: 6.80, rateSenior: 7.30, category: 'PSU' },
  { bank: 'SBI', tenure: '2 Years', rateGeneral: 7.00, rateSenior: 7.50, category: 'PSU' },
  { bank: 'SBI', tenure: '3 Years', rateGeneral: 6.75, rateSenior: 7.25, category: 'PSU' },
  { bank: 'SBI', tenure: '5 Years', rateGeneral: 6.50, rateSenior: 7.50, category: 'PSU' },
  { bank: 'Bank of Baroda', tenure: '1 Year', rateGeneral: 6.85, rateSenior: 7.35, category: 'PSU' },
  { bank: 'Bank of Baroda', tenure: '2 Years', rateGeneral: 7.05, rateSenior: 7.55, category: 'PSU' },
  { bank: 'Bank of Baroda', tenure: '3 Years', rateGeneral: 6.80, rateSenior: 7.30, category: 'PSU' },
  { bank: 'Punjab National Bank', tenure: '1 Year', rateGeneral: 6.75, rateSenior: 7.25, category: 'PSU' },
  { bank: 'Punjab National Bank', tenure: '3 Years', rateGeneral: 6.50, rateSenior: 7.00, category: 'PSU' },
  // Private Banks
  { bank: 'HDFC Bank', tenure: '7–29 days', rateGeneral: 3.50, rateSenior: 4.00, category: 'Private' },
  { bank: 'HDFC Bank', tenure: '30–90 days', rateGeneral: 4.50, rateSenior: 5.00, category: 'Private' },
  { bank: 'HDFC Bank', tenure: '6 Months', rateGeneral: 5.75, rateSenior: 6.25, category: 'Private' },
  { bank: 'HDFC Bank', tenure: '1 Year', rateGeneral: 7.10, rateSenior: 7.60, category: 'Private' },
  { bank: 'HDFC Bank', tenure: '2 Years', rateGeneral: 7.20, rateSenior: 7.70, category: 'Private' },
  { bank: 'HDFC Bank', tenure: '3 Years', rateGeneral: 7.25, rateSenior: 7.75, category: 'Private' },
  { bank: 'HDFC Bank', tenure: '5 Years', rateGeneral: 7.00, rateSenior: 7.75, category: 'Private' },
  { bank: 'ICICI Bank', tenure: '6 Months', rateGeneral: 5.75, rateSenior: 6.25, category: 'Private' },
  { bank: 'ICICI Bank', tenure: '1 Year', rateGeneral: 7.10, rateSenior: 7.60, category: 'Private' },
  { bank: 'ICICI Bank', tenure: '2 Years', rateGeneral: 7.10, rateSenior: 7.60, category: 'Private' },
  { bank: 'ICICI Bank', tenure: '3 Years', rateGeneral: 7.00, rateSenior: 7.50, category: 'Private' },
  { bank: 'Axis Bank', tenure: '6 Months', rateGeneral: 5.75, rateSenior: 6.25, category: 'Private' },
  { bank: 'Axis Bank', tenure: '1 Year', rateGeneral: 7.10, rateSenior: 7.75, category: 'Private' },
  { bank: 'Axis Bank', tenure: '2 Years', rateGeneral: 7.10, rateSenior: 7.75, category: 'Private' },
  { bank: 'Axis Bank', tenure: '3 Years', rateGeneral: 7.10, rateSenior: 7.75, category: 'Private' },
  { bank: 'Kotak Mahindra', tenure: '1 Year', rateGeneral: 7.10, rateSenior: 7.60, category: 'Private' },
  { bank: 'Kotak Mahindra', tenure: '2 Years', rateGeneral: 7.15, rateSenior: 7.65, category: 'Private' },
  { bank: 'Kotak Mahindra', tenure: '3 Years', rateGeneral: 7.10, rateSenior: 7.60, category: 'Private' },
  { bank: 'IndusInd Bank', tenure: '1 Year', rateGeneral: 7.50, rateSenior: 8.00, category: 'Private' },
  { bank: 'IndusInd Bank', tenure: '2 Years', rateGeneral: 7.50, rateSenior: 8.00, category: 'Private' },
  { bank: 'IndusInd Bank', tenure: '3 Years', rateGeneral: 7.50, rateSenior: 8.00, category: 'Private' },
  // Small Finance Banks
  { bank: 'AU Small Finance', tenure: '1 Year', rateGeneral: 7.75, rateSenior: 8.25, category: 'Small Finance' },
  { bank: 'AU Small Finance', tenure: '2 Years', rateGeneral: 8.00, rateSenior: 8.50, category: 'Small Finance' },
  { bank: 'AU Small Finance', tenure: '3 Years', rateGeneral: 8.00, rateSenior: 8.50, category: 'Small Finance' },
  { bank: 'Ujjivan SFB', tenure: '1 Year', rateGeneral: 8.25, rateSenior: 8.75, category: 'Small Finance' },
  { bank: 'Ujjivan SFB', tenure: '2 Years', rateGeneral: 8.25, rateSenior: 8.75, category: 'Small Finance' },
  { bank: 'Jana SFB', tenure: '1 Year', rateGeneral: 8.25, rateSenior: 8.75, category: 'Small Finance' },
  { bank: 'Jana SFB', tenure: '2 Years', rateGeneral: 8.25, rateSenior: 8.75, category: 'Small Finance' },
  { bank: 'ESAF SFB', tenure: '1 Year', rateGeneral: 8.25, rateSenior: 8.75, category: 'Small Finance' },
  { bank: 'Suryoday SFB', tenure: '1 Year', rateGeneral: 8.60, rateSenior: 9.10, category: 'Small Finance' },
  { bank: 'Suryoday SFB', tenure: '2 Years', rateGeneral: 8.51, rateSenior: 9.01, category: 'Small Finance' },
];

export const FD_DEFAULTS = {
  principal: 100000,
  interestRate: 7.5,
  years: 3,
  compounding: 4, // quarterly
};

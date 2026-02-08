/**
 * Currency configuration and conversion utilities.
 * Rates are approximate and relative to EUR (base = 1 EUR).
 */

export interface CurrencyInfo {
  code: string;
  label: string;
  symbol: string;
  /** How many units of this currency = 1 EUR */
  rateToEur: number;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'EUR', label: 'EUR (€)', symbol: '€', rateToEur: 1 },
  { code: 'USD', label: 'USD ($)', symbol: '$', rateToEur: 1.08 },
  { code: 'GBP', label: 'GBP (£)', symbol: '£', rateToEur: 0.86 },
  { code: 'XOF', label: 'XOF (FCFA)', symbol: 'FCFA', rateToEur: 655.957 },
  { code: 'IDR', label: 'IDR (Rp)', symbol: 'Rp', rateToEur: 17_200 },
];

export const CURRENCY_CODES = CURRENCIES.map(c => c.code);

export function getCurrencyInfo(code: string): CurrencyInfo {
  return CURRENCIES.find(c => c.code === code) || CURRENCIES[0];
}

/**
 * Convert an amount from one currency to another using EUR as the pivot.
 */
export function convertCurrency(amount: number, fromCode: string, toCode: string): number {
  if (fromCode === toCode || !amount) return amount;
  const from = getCurrencyInfo(fromCode);
  const to = getCurrencyInfo(toCode);
  // Convert to EUR first, then to target
  const amountInEur = amount / from.rateToEur;
  return Math.round(amountInEur * to.rateToEur);
}

/**
 * Format a price with its currency symbol.
 */
export function formatPrice(amount: number, currencyCode: string): string {
  const info = getCurrencyInfo(currencyCode);
  const formatted = new Intl.NumberFormat('fr-FR').format(amount);
  if (info.code === 'EUR') return `${formatted} €`;
  if (info.code === 'USD') return `$${formatted}`;
  if (info.code === 'GBP') return `£${formatted}`;
  return `${formatted} ${info.symbol}`;
}

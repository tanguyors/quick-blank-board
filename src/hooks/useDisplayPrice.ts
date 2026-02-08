import { useProfile } from './useProfile';
import { convertCurrency, formatPrice } from '@/lib/currencies';

/**
 * Returns a function that converts and formats a price
 * from its original currency to the user's preferred currency.
 */
export function useDisplayPrice() {
  const { profile } = useProfile();
  const preferredCurrency = profile.data?.preferred_currency || 'IDR';

  const displayPrice = (amount: number, fromCurrency: string): string => {
    const converted = convertCurrency(amount, fromCurrency, preferredCurrency);
    return formatPrice(converted, preferredCurrency);
  };

  return { displayPrice, preferredCurrency };
}

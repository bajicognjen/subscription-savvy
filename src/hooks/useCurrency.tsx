import { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Currency = 'USD' | 'EUR' | 'RSD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convert: (amount: number, fromCurrency?: Currency) => number;
  getSymbol: (currency?: Currency) => string;
  formatAmount: (amount: number, curr?: Currency) => string;
  rates: Record<Currency, number>;
  lastUpdated?: number | null;
  isRefreshing: boolean;
  refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Default fallback rates (relative to USD)
const DEFAULT_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.85,
  RSD: 99.1,
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  RSD: 'дин',
};

const RATES_CACHE_KEY = 'exchange_rates_cache_v1';

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('USD');
  const [rates, setRates] = useState<Record<Currency, number>>(DEFAULT_RATES);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load saved currency and cached rates on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('currency') as Currency | null;
    if (savedCurrency && ['USD', 'EUR', 'RSD'].includes(savedCurrency)) {
      setCurrencyState(savedCurrency);
    }

    try {
      const raw = localStorage.getItem(RATES_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.rates) {
          setRates(parsed.rates);
          setLastUpdated(parsed.timestamp || null);
          
          // Only fetch new rates if cache is older than 8 hours
          const now = Date.now();
          const cacheAge = now - (parsed.timestamp || 0);
          const EIGHT_HOURS = 8 * 60 * 60 * 1000;
          
          if (cacheAge > EIGHT_HOURS) {
            // Cache is stale, fetch new rates
            refreshRates();
          }
        }
      } else {
        // No cache at all, fetch rates
        refreshRates();
      }
    } catch (e) {
      // ignore parse errors, try to fetch fresh rates
      refreshRates();
    }

    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('currency', newCurrency);
  };

  const saveRatesToCache = (newRates: Record<Currency, number>) => {
    const payload = { rates: newRates, timestamp: Date.now() };
    try {
      localStorage.setItem(RATES_CACHE_KEY, JSON.stringify(payload));
    } catch (e) {
      // ignore localStorage errors
    }
  };

  const fetchRatesFromProvider = async (): Promise<Record<Currency, number>> => {
    // Using exchangerate.host (no API key required)
    try {
      const res = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=EUR,RSD');
      if (!res.ok) throw new Error('Failed to fetch rates');
      const json = await res.json();
      const fetched: Record<Currency, number> = {
        USD: 1,
        EUR: Number(json.rates?.EUR) || DEFAULT_RATES.EUR,
        RSD: Number(json.rates?.RSD) || DEFAULT_RATES.RSD,
      };
      return fetched;
    } catch (err) {
      return DEFAULT_RATES;
    }
  };

  const refreshRates = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const newRates = await fetchRatesFromProvider();
      setRates(newRates);
      setLastUpdated(Date.now());
      saveRatesToCache(newRates);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const convert = (amount: number, fromCurrency: Currency = 'USD'): number => {
    const fromRate = rates[fromCurrency] ?? DEFAULT_RATES[fromCurrency];
    const toRate = rates[currency] ?? DEFAULT_RATES[currency];
    const amountInUsd = amount / fromRate;
    return amountInUsd * toRate;
  };

  const getSymbol = (curr?: Currency): string => CURRENCY_SYMBOLS[curr || currency];

  const formatAmount = (amount: number, curr?: Currency): string => {
    const displayCurrency = curr || currency;
    try {
      // Create locale-aware formatter
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: displayCurrency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return formatter.format(amount);
    } catch {
      // Fallback if currency is not recognized by Intl
      const symbol = CURRENCY_SYMBOLS[displayCurrency];
      return `${symbol}${amount.toFixed(2)}`;
    }
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert, getSymbol, formatAmount, rates, lastUpdated, isRefreshing, refreshRates }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
}

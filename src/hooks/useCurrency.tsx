import { createContext, useContext, useState, useEffect } from 'react';

export type Currency = 'USD' | 'EUR' | 'RSD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convert: (amount: number, fromCurrency?: Currency) => number;
  getSymbol: (currency?: Currency) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Exchange rates (relative to USD)
const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.85,
  RSD: 99.1,
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  RSD: 'дин',
};

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('USD');
  const [mounted, setMounted] = useState(false);

  // Load saved currency from localStorage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('currency') as Currency | null;
    if (savedCurrency && ['USD', 'EUR', 'RSD'].includes(savedCurrency)) {
      setCurrencyState(savedCurrency);
    }
    setMounted(true);
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('currency', newCurrency);
  };

  const convert = (amount: number, fromCurrency: Currency = 'USD'): number => {
    // Convert from any currency to USD first, then to target currency
    const amountInUsd = amount / EXCHANGE_RATES[fromCurrency];
    return amountInUsd * EXCHANGE_RATES[currency];
  };

  const getSymbol = (curr?: Currency): string => {
    return CURRENCY_SYMBOLS[curr || currency];
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert, getSymbol }}>
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

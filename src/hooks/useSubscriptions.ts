import { useState, useEffect } from 'react';
import { Subscription } from '@/types/subscription';

const STORAGE_KEY = 'subscriptions';

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSubscriptions(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse subscriptions', e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
    }
  }, [subscriptions, isLoaded]);

  const addSubscription = (subscription: Omit<Subscription, 'id' | 'createdAt'>) => {
    const newSubscription: Subscription = {
      ...subscription,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setSubscriptions((prev) => [...prev, newSubscription]);
    return newSubscription;
  };

  const updateSubscription = (id: string, updates: Partial<Omit<Subscription, 'id' | 'createdAt'>>) => {
    setSubscriptions((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, ...updates } : sub))
    );
  };

  const deleteSubscription = (id: string) => {
    setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));
  };

  const getMonthlyEquivalent = (subscription: Subscription): number => {
    switch (subscription.billingCycle) {
      case 'weekly':
        return subscription.price * 4.33;
      case 'yearly':
        return subscription.price / 12;
      case 'monthly':
      default:
        return subscription.price;
    }
  };

  const getTotalMonthlySpend = (): number => {
    return subscriptions.reduce((total, sub) => total + getMonthlyEquivalent(sub), 0);
  };

  const getUpcomingRenewals = (days: number = 7): Subscription[] => {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    return subscriptions.filter((sub) => {
      const renewalDate = new Date(sub.renewalDate);
      return renewalDate >= now && renewalDate <= futureDate;
    }).sort((a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime());
  };

  const getCategorySpending = () => {
    const categoryTotals: Record<string, number> = {};
    
    subscriptions.forEach((sub) => {
      const monthly = getMonthlyEquivalent(sub);
      categoryTotals[sub.category] = (categoryTotals[sub.category] || 0) + monthly;
    });

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount: Math.round(amount * 100) / 100,
    }));
  };

  return {
    subscriptions,
    isLoaded,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    getMonthlyEquivalent,
    getTotalMonthlySpend,
    getUpcomingRenewals,
    getCategorySpending,
  };
}

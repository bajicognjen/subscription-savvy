import { useState, useEffect } from 'react';
import { Subscription } from '@/types/subscription';
import { supabase } from '@/supabase';
import { useToast } from './use-toast';
import { useAuth } from './useAuth';

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch subscriptions from Supabase
  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    }
  }, [user]);

  const fetchSubscriptions = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('renewal_date', { ascending: true });

      if (error) {
        console.error('Error fetching subscriptions:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch subscriptions',
          variant: 'destructive',
        });
        return;
      }

      // Transform camelCase from database
      const transformed = (data || []).map((sub) => ({
        id: sub.id,
        name: sub.name,
        category: sub.category,
        // normalized USD price
        price: Number(sub.price),
        // preserve original entered amount and currency if available
        priceOriginal: sub.price_original ? Number(sub.price_original) : undefined,
        currency: sub.currency || undefined,
        billingCycle: sub.billing_cycle,
        renewalDate: sub.renewal_date,
        paymentMethod: sub.payment_method,
        notes: sub.notes,
        status: sub.status || 'active',
        createdAt: sub.created_at,
      }));

      setSubscriptions(transformed);
      setIsLoaded(true);
    } catch (err) {
      console.error('Unexpected error fetching subscriptions:', err);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSubscription = async (subscription: Omit<Subscription, 'id' | 'createdAt'>) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to add a subscription',
        variant: 'destructive',
      });
      return null;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('subscriptions')
        .insert([
          {
            user_id: user.id,
            name: subscription.name,
            category: subscription.category,
            // store normalized USD price in `price`
            price: subscription.price,
            // store original entered amount and currency if provided
            price_original: (subscription as any).priceOriginal ?? null,
            currency: (subscription as any).currency ?? null,
            billing_cycle: subscription.billingCycle,
            renewal_date: subscription.renewalDate,
            payment_method: subscription.paymentMethod,
            notes: subscription.notes,
            status: subscription.status || 'active',
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error adding subscription:', error);
        toast({
          title: 'Error',
          description: 'Failed to add subscription',
          variant: 'destructive',
        });
        return null;
      }

      const newSubscription: Subscription = {
        id: data.id,
        name: data.name,
        category: data.category,
        price: data.price,
        priceOriginal: data.price_original ? Number(data.price_original) : undefined,
        currency: data.currency || undefined,
        billingCycle: data.billing_cycle,
        renewalDate: data.renewal_date,
        paymentMethod: data.payment_method,
        notes: data.notes,
        status: data.status || 'active',
        createdAt: data.created_at,
      };

      setSubscriptions((prev) => [...prev, newSubscription]);
      toast({
        title: 'Success',
        description: 'Subscription added successfully',
      });
      return newSubscription;
    } catch (err) {
      console.error('Unexpected error adding subscription:', err);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubscription = async (id: string, updates: Partial<Omit<Subscription, 'id' | 'createdAt'>>) => {
    try {
      setIsLoading(true);
      const updateData: Record<string, any> = {};

      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.price !== undefined) updateData.price = updates.price;
      if ((updates as any).priceOriginal !== undefined) updateData.price_original = (updates as any).priceOriginal;
      if ((updates as any).currency !== undefined) updateData.currency = (updates as any).currency;
      if (updates.billingCycle !== undefined) updateData.billing_cycle = updates.billingCycle;
      if (updates.renewalDate !== undefined) updateData.renewal_date = updates.renewalDate;
      if (updates.paymentMethod !== undefined) updateData.payment_method = updates.paymentMethod;
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      if ((updates as any).status !== undefined) updateData.status = (updates as any).status;

      const { error } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating subscription:', error);
        toast({
          title: 'Error',
          description: 'Failed to update subscription',
          variant: 'destructive',
        });
        return;
      }

      setSubscriptions((prev) =>
        prev.map((sub) => (sub.id === id ? { ...sub, ...updates } : sub))
      );
      toast({
        title: 'Success',
        description: 'Subscription updated successfully',
      });
    } catch (err) {
      console.error('Unexpected error updating subscription:', err);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSubscription = async (id: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting subscription:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete subscription',
          variant: 'destructive',
        });
        return;
      }

      setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));
      toast({
        title: 'Success',
        description: 'Subscription deleted successfully',
      });
    } catch (err) {
      console.error('Unexpected error deleting subscription:', err);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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
    isLoading,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    getMonthlyEquivalent,
    getTotalMonthlySpend,
    getUpcomingRenewals,
    getCategorySpending,
  };
}

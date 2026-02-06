import { useState, useEffect } from 'react';
import { supabase } from '@/supabase';
import { useAuth } from './useAuth';
import { useSubscriptions } from './useSubscriptions';
import { useToast } from './use-toast';
import { UserPreferences, SavingsTransaction, BudgetSummary, SavingsStats } from '@/types/savings';

export function useSalaryAndSavings() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [savingsBalance, setSavingsBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<SavingsTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { getTotalMonthlySpend } = useSubscriptions();
  const { toast } = useToast();

  // Fetch user preferences and savings data
  useEffect(() => {
    if (user) {
      fetchPreferences();
      fetchSavingsBalance();
      fetchTransactions();
    }
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching preferences:', error);
        return;
      }

      if (data) {
        setPreferences(data);
      }
    } catch (err) {
      console.error('Unexpected error fetching preferences:', err);
    }
  };

  const fetchSavingsBalance = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('savings_transactions')
        .select('balance_after')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching savings balance:', error);
        return;
      }

      setSavingsBalance(data?.balance_after || 0);
    } catch (err) {
      console.error('Unexpected error fetching savings balance:', err);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('savings_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching transactions:', error);
        return;
      }

      setTransactions(data || []);
    } catch (err) {
      console.error('Unexpected error fetching transactions:', err);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user) return null;

    try {
      setIsLoading(true);

      // Check if preferences exist
      const { data: existing, error: checkError } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let result;
      if (checkError?.code === 'PGRST116' || !existing) {
        // Create new preferences
        result = await supabase
          .from('user_preferences')
          .insert({
            user_id: user.id,
            ...updates,
          })
          .select()
          .single();
      } else {
        // Update existing preferences
        result = await supabase
          .from('user_preferences')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .select()
          .single();
      }

      if (result.error) {
        console.error('Error updating preferences:', result.error);
        toast({
          title: 'Error',
          description: 'Failed to update preferences',
          variant: 'destructive',
        });
        return null;
      }

      setPreferences(result.data);
      toast({
        title: 'Success',
        description: 'Preferences updated successfully',
      });

      return result.data;
    } catch (err) {
      console.error('Unexpected error updating preferences:', err);
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

  const addSavingsTransaction = async (
    amount: number,
    type: 'deposit' | 'withdrawal',
    description?: string
  ) => {
    if (!user || !preferences) return null;

    try {
      setIsLoading(true);

      // Calculate new balance
      const newBalance = type === 'deposit' 
        ? savingsBalance + amount 
        : savingsBalance - amount;

      const { data, error } = await supabase
        .from('savings_transactions')
        .insert({
          user_id: user.id,
          amount,
          transaction_type: type,
          description,
          balance_after: newBalance,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding transaction:', error);
        toast({
          title: 'Error',
          description: 'Failed to add transaction',
          variant: 'destructive',
        });
        return null;
      }

      setSavingsBalance(newBalance);
      setTransactions(prev => [data, ...prev]);
      toast({
        title: 'Success',
        description: `${type === 'deposit' ? 'Added to' : 'Withdrawn from'} savings`,
      });

      return data;
    } catch (err) {
      console.error('Unexpected error adding transaction:', err);
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

  const calculateBudgetSummary = (): BudgetSummary => {
    const monthlySpend = getTotalMonthlySpend();
    const savingsAmount = preferences?.monthly_salary 
      ? (preferences.monthly_salary * (preferences.savings_percentage / 100))
      : 0;
    const remainingBudget = preferences?.monthly_salary 
      ? preferences.monthly_salary - monthlySpend - savingsAmount
      : 0;

    return {
      monthly_salary: preferences?.monthly_salary || null,
      total_subscriptions: monthlySpend,
      savings_amount: savingsAmount,
      remaining_budget: remainingBudget,
      savings_percentage: preferences?.savings_percentage || 0,
      current_savings_balance: savingsBalance,
    };
  };

  const getSavingsStats = (): SavingsStats => {
    const deposits = transactions
      .filter(t => t.transaction_type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const withdrawals = transactions
      .filter(t => t.transaction_type === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0);

    const lastTransaction = transactions[0];
    const monthlySavings = preferences?.monthly_salary 
      ? (preferences.monthly_salary * (preferences.savings_percentage / 100))
      : 0;

    return {
      total_deposits: deposits,
      total_withdrawals: withdrawals,
      current_balance: savingsBalance,
      monthly_savings: monthlySavings,
      last_transaction_date: lastTransaction?.created_at || null,
    };
  };

  const autoDepositSavings = async () => {
    if (!user || !preferences?.monthly_salary) return null;

    const amount = preferences.monthly_salary * (preferences.savings_percentage / 100);
    return addSavingsTransaction(amount, 'deposit', 'Monthly automatic savings');
  };

  return {
    preferences,
    savingsBalance,
    transactions,
    isLoading,
    updatePreferences,
    addSavingsTransaction,
    calculateBudgetSummary,
    getSavingsStats,
    autoDepositSavings,
    fetchPreferences,
    fetchSavingsBalance,
    fetchTransactions,
  };
}
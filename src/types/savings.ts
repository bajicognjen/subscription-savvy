export interface UserPreferences {
  id: string;
  user_id: string;
  monthly_salary: number | null;
  savings_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface SavingsTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'deposit' | 'withdrawal';
  description?: string;
  balance_after: number;
  created_at: string;
}

export interface BudgetSummary {
  monthly_salary: number | null;
  total_subscriptions: number;
  savings_amount: number;
  remaining_budget: number;
  savings_percentage: number;
  current_savings_balance: number;
}

export interface SavingsStats {
  total_deposits: number;
  total_withdrawals: number;
  current_balance: number;
  monthly_savings: number;
  last_transaction_date: string | null;
}
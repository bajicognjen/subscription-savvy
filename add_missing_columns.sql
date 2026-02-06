-- Add missing columns to existing subscriptions table without dropping data
-- This script adds the currency, price_original, and status columns

-- Add currency column
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS currency TEXT CHECK (currency IN ('USD', 'EUR', 'RSD'));

-- Add price_original column  
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS price_original DECIMAL(10, 2);

-- Add status column with default value 'active'
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled'));

-- Update existing records to have default status if they don't have one
UPDATE subscriptions SET status = 'active' WHERE status IS NULL;

-- Set default value for future inserts
ALTER TABLE subscriptions ALTER COLUMN status SET DEFAULT 'active';

-- Refresh the schema cache (this helps with the cache issue)
NOTIFY pgrst, 'reload schema';

-- Create user preferences table for salary and savings settings
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  monthly_salary DECIMAL(12, 2),
  savings_percentage DECIMAL(5, 2) DEFAULT 10.00, -- Default 10% to savings
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create savings transactions table for tracking deposits and withdrawals
CREATE TABLE IF NOT EXISTS savings_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal')),
  description TEXT,
  balance_after DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for new tables
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_preferences
CREATE POLICY "Users can view their own preferences" 
  ON user_preferences 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" 
  ON user_preferences 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
  ON user_preferences 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policies for savings_transactions
CREATE POLICY "Users can view their own savings transactions" 
  ON savings_transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own savings transactions" 
  ON savings_transactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS user_preferences_user_id_idx ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS savings_transactions_user_id_idx ON savings_transactions(user_id);
CREATE INDEX IF NOT EXISTS savings_transactions_created_at_idx ON savings_transactions(created_at);

-- Create updated_at trigger for user_preferences
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

-- Insert default preferences for existing users (if they don't have any)
INSERT INTO user_preferences (user_id, monthly_salary, savings_percentage)
SELECT id, NULL, 10.00
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_preferences)
ON CONFLICT (user_id) DO NOTHING;

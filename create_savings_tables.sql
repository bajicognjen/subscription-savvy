-- Check if tables exist and create them if they don't
-- This script only creates tables, not policies (to avoid conflicts)

-- Create user preferences table for salary and savings settings (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_preferences') THEN
    CREATE TABLE user_preferences (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      monthly_salary DECIMAL(12, 2),
      savings_percentage DECIMAL(5, 2) DEFAULT 10.00, -- Default 10% to savings
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id)
    );
    
    -- Enable RLS
    ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
    
    -- Create indexes
    CREATE INDEX user_preferences_user_id_idx ON user_preferences(user_id);
    
    -- Create updated_at trigger function (if it doesn't exist)
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    
    -- Create updated_at trigger
    CREATE TRIGGER update_user_preferences_updated_at
      BEFORE UPDATE ON user_preferences
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    
    -- Insert default preferences for existing users
    INSERT INTO user_preferences (user_id, monthly_salary, savings_percentage)
    SELECT id, NULL, 10.00
    FROM auth.users
    WHERE id NOT IN (SELECT user_id FROM user_preferences)
    ON CONFLICT (user_id) DO NOTHING;
    
    RAISE NOTICE 'user_preferences table created successfully';
  ELSE
    RAISE NOTICE 'user_preferences table already exists';
  END IF;
END $$;

-- Create savings transactions table for tracking deposits and withdrawals (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'savings_transactions') THEN
    CREATE TABLE savings_transactions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      amount DECIMAL(12, 2) NOT NULL,
      transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal')),
      description TEXT,
      balance_after DECIMAL(12, 2) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Enable RLS
    ALTER TABLE savings_transactions ENABLE ROW LEVEL SECURITY;
    
    -- Create indexes
    CREATE INDEX savings_transactions_user_id_idx ON savings_transactions(user_id);
    CREATE INDEX savings_transactions_created_at_idx ON savings_transactions(created_at);
    
    RAISE NOTICE 'savings_transactions table created successfully';
  ELSE
    RAISE NOTICE 'savings_transactions table already exists';
  END IF;
END $$;

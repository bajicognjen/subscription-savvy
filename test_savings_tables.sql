-- Test script to verify savings tables exist and are working
-- Run this in Supabase SQL Editor to check table status

-- Check if user_preferences table exists
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_name = 'user_preferences' 
  AND table_schema = 'public';

-- Check if savings_transactions table exists  
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_name = 'savings_transactions' 
  AND table_schema = 'public';

-- Check RLS status for both tables
SELECT 
  relname as table_name,
  relrowsecurity as rls_enabled
FROM pg_class 
WHERE relname IN ('user_preferences', 'savings_transactions');

-- Check if policies exist for user_preferences
SELECT 
  polname as policy_name,
  permissive,
  cmd,
  qual,
  with_check
FROM pg_policy 
WHERE tablename = 'user_preferences';

-- Check if policies exist for savings_transactions
SELECT 
  polname as policy_name,
  permissive,
  cmd,
  qual,
  with_check
FROM pg_policy 
WHERE tablename = 'savings_transactions';

-- Test inserting a test record (replace 'your-user-id-here' with actual user ID)
-- INSERT INTO user_preferences (user_id, monthly_salary, savings_percentage)
-- VALUES ('your-user-id-here', 5000.00, 15.00);

-- Test inserting a test transaction (replace 'your-user-id-here' with actual user ID)
-- INSERT INTO savings_transactions (user_id, amount, transaction_type, description, balance_after)
-- VALUES ('your-user-id-here', 100.00, 'deposit', 'Test deposit', 100.00);

-- Check current data in tables (replace 'your-user-id-here' with actual user ID)
-- SELECT * FROM user_preferences WHERE user_id = 'your-user-id-here';
-- SELECT * FROM savings_transactions WHERE user_id = 'your-user-id-here' ORDER BY created_at DESC;
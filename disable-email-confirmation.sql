-- Run this in Supabase SQL Editor to disable email confirmation requirement
-- This allows users to sign in immediately after signup without email verification

-- Update auth.users to mark all existing users as email_confirmed
UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;

-- The email confirmation setting is in the project config
-- Go to Supabase Dashboard → Authentication → Settings
-- Toggle OFF "Email confirmations" (or set Require Email Confirmation to OFF)
-- This allows autoconfirm on signup

-- Alternative: Delete the test user and try signing up fresh
DELETE FROM auth.users WHERE email = 'ognjenbajic@devione.com';

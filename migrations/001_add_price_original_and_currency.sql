-- Migration: add price_original and currency columns to subscriptions

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS price_original numeric(10,2),
  ADD COLUMN IF NOT EXISTS currency text;

-- Backfill existing rows: assume existing `price` stored in USD
UPDATE subscriptions
SET price_original = price,
    currency = 'USD'
WHERE price_original IS NULL OR currency IS NULL;

-- Optional index for faster queries by currency
CREATE INDEX IF NOT EXISTS subscriptions_currency_idx ON subscriptions(currency);

-- Ensure new columns are allowed by RLS (existing policies use user_id so no change needed)

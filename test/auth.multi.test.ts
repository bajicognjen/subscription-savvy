import { describe, it, expect } from 'vitest';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const TEST_EMAIL = process.env.TEST_EMAIL;
const TEST_PASSWORD = process.env.TEST_PASSWORD;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env');
}

describe('Supabase multi-device sign-in', () => {
  it('should allow two active sessions for same confirmed credentials', async () => {
    if (!TEST_EMAIL || !TEST_PASSWORD) {
      console.warn('Skipping test: set TEST_EMAIL and TEST_PASSWORD in .env to run this test');
      return;
    }

    console.log('Testing multi-device signin with:', TEST_EMAIL);

    const clientA = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const clientB = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Sign in on client A
    const { data: dataA, error: errorA } = await clientA.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    console.log('Sign in A result:', errorA ? `error: ${errorA.message}` : 'success');

    // For this test to pass, the user must already exist and be email-confirmed
    // If you get email_not_confirmed, run the SQL in disable-email-confirmation.sql first
    if (errorA?.code === 'email_not_confirmed') {
      console.error('ERROR: User exists but email is not confirmed.');
      console.error('FIX: Run this SQL in Supabase SQL Editor:');
      console.error("  UPDATE auth.users SET email_confirmed_at = now() WHERE email = '" + TEST_EMAIL + "';");
      console.error('OR disable email confirmation globally:');
      console.error('  Dashboard → Authentication → Settings → Toggle OFF "Require email confirmation"');
      throw errorA;
    }

    if (errorA?.code === 'invalid_credentials') {
      console.error('ERROR: Invalid email or password.');
      console.error('FIX: Create the user first by signing up in the app, or use the Supabase dashboard');
      throw errorA;
    }

    expect(errorA).toBeNull();
    const tokenA = dataA?.session?.access_token;
    expect(tokenA).toBeDefined();

    // Sign in on client B
    const { data: dataB, error: errorB } = await clientB.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    console.log('Sign in B result:', errorB ? `error: ${errorB.message}` : 'success');

    expect(errorB).toBeNull();
    const tokenB = dataB?.session?.access_token;
    expect(tokenB).toBeDefined();

    // Validate both tokens
    const validate = async (token: string | undefined) => {
      if (!token) return null;
      const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: SUPABASE_ANON_KEY,
        },
      });
      const body = await res.json().catch(() => null);
      return { status: res.status, body };
    };

    const aCheck = await validate(tokenA);
    const bCheck = await validate(tokenB);

    console.log('tokenA validation:', aCheck?.status);
    console.log('tokenB validation:', bCheck?.status);

    const aValid = aCheck?.status === 200;
    const bValid = bCheck?.status === 200;

    // Both tokens should be valid if multiple sessions are allowed
    expect(aValid).toBe(true);
    expect(bValid).toBe(true);

    console.log('✓ Multi-device sign-in test PASSED');
  }, 20000);
});

# Supabase Setup Checklist

Complete these steps to get your app working with Supabase:

## Step 1: Create Supabase Project ✓
- [ ] Go to https://supabase.com
- [ ] Click "New Project"
- [ ] Choose a name and password
- [ ] Select your region
- [ ] Wait for project to be created (2-3 minutes)

## Step 2: Get Credentials ✓
- [ ] In Supabase dashboard, go to "Settings" → "API"
- [ ] Copy "Project URL" (looks like `https://xxxxx.supabase.co`)
- [ ] Copy "Anon Key" (a long string starting with `eyJ...`)
- [ ] Keep these safe!

## Step 3: Configure Environment ✓
- [ ] Open `.env` file in your project root
- [ ] Replace `https://your-project.supabase.co` with your Project URL
- [ ] Replace `your-anon-key-here` with your Anon Key
- [ ] Save the file

Example:
```
VITE_SUPABASE_URL=https://abc123xyz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 4: Set Up Database ✓
- [ ] In Supabase dashboard, go to "SQL Editor"
- [ ] Click "New Query"
- [ ] Open `supabase-schema.sql` file in this project
- [ ] Copy all the SQL code
- [ ] Paste it into the Supabase SQL Editor
- [ ] Click "Run" (or Cmd+Enter)
- [ ] Wait for success message

## Step 5: Enable Email Auth ✓
- [ ] In Supabase, go to "Authentication" → "Providers"
- [ ] Make sure "Email" is enabled (toggle ON)
- [ ] Go to "Authentication" → "Email Templates"
- [ ] Review the default templates (optional customization)

## Step 6: Install Dependencies ✓
```bash
cd "/home/ognjen/Documents/subscription app/subscription-savvy"
bun install
# or: npm install
```

## Step 7: Run Development Server ✓
```bash
bun run dev
# or: npm run dev
```

You should see:
```
  VITE v... ready in ... ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

## Step 8: Test the App ✓

### Create Account
- [ ] Open http://localhost:5173
- [ ] You should see login page
- [ ] Click "Sign up"
- [ ] Enter email (e.g., test@example.com)
- [ ] Enter password
- [ ] Click "Create Account"
- [ ] You should see success message

### Verify Email (if required)
- [ ] Check your email for verification link
- [ ] Click the link to verify
- [ ] Return to app and sign in

### Add First Subscription
- [ ] Click "Add Subscription" button
- [ ] Fill in the form:
  - Name: Netflix
  - Category: Streaming
  - Price: 15.99
  - Billing: Monthly
  - Renewal Date: [Pick a date]
- [ ] Click "Save"
- [ ] You should see the subscription card

### Check Database
- [ ] Go to Supabase dashboard
- [ ] Click "Table Editor"
- [ ] Click "subscriptions" table
- [ ] You should see your Netflix subscription!

### Test Edit
- [ ] Click "Edit" on the subscription
- [ ] Change the price to 16.99
- [ ] Click "Save"
- [ ] Price should update both in UI and database

### Test Delete
- [ ] Click trash icon on a subscription
- [ ] Confirm deletion
- [ ] Subscription should disappear
- [ ] Check Supabase - it should be gone

### Test Sign Out
- [ ] Click "Sign Out" button
- [ ] Should return to login page
- [ ] Click "Sign in"
- [ ] Use same email/password
- [ ] Your subscriptions should still be there!

## Step 9: Build for Production (Optional) ✓
```bash
bun run build
# or: npm run build
```

You should see:
```
vite v... building for production...
✓ ... files built in ...
```

## Common Issues & Solutions

### ❌ "VITE_SUPABASE_URL is not defined"
**Solution:** Check that `.env` file exists and has correct variable names

### ❌ "Cannot connect to Supabase"
**Solution:** 
- Check URL and key in `.env` are correct
- Verify they're from the right Supabase project
- Check you have internet connection

### ❌ "subscriptions table does not exist"
**Solution:** Run the SQL schema from `supabase-schema.sql`

### ❌ "Email not verified"
**Solution:** 
- Check spam folder for verification email
- Resend verification email from Supabase Auth dashboard

### ❌ "User can see other users' data"
**Solution:** Make sure you ran ALL the SQL from `supabase-schema.sql` including RLS policies

### ❌ App shows "Loading..." indefinitely
**Solution:**
- Check browser console (F12) for errors
- Verify `.env` credentials are correct
- Try refreshing the page

## Next Steps After Setup

1. ✅ Customize the app colors/branding
2. ✅ Add more categories or features
3. ✅ Share with friends and family
4. ✅ Deploy to production (Vercel, Netlify, etc.)
5. ✅ Set up email notifications (Supabase Functions)

## Support Files

These files have all the information you need:

- **SUPABASE_SETUP.md** - Detailed setup guide
- **MIGRATION_GUIDE.md** - What changed from old version
- **SUPABASE_INTEGRATION_SUMMARY.md** - Technical overview
- **supabase-schema.sql** - Database schema
- **README.md** - General project info

Good luck! 🚀

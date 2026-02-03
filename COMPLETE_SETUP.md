# Complete Supabase Setup Guide

You already have your Supabase project and credentials set up! ✅

Now let's finish the setup step by step.

## Current Status

✅ Supabase project created  
✅ Credentials in `.env`  
❌ Database schema not yet created  
❌ App not tested yet  

## Step 1: Set Up the Database Schema (5 minutes)

### 1.1 Go to Your Supabase Project
1. Open https://app.supabase.com
2. Click on your project (tatppnndgfqbbxpjckqm)
3. In the left menu, click **"SQL Editor"**
4. Click the **"+" button** to create a new query

### 1.2 Copy and Paste the Schema
1. Open the file: `supabase-schema.sql` (in your project root)
2. Copy **ALL** the SQL code
3. Paste it into the Supabase SQL Editor
4. Click the **"Run"** button (or press Ctrl+Enter / Cmd+Enter)

**Expected Result:**
- You should see: "Success. No rows returned."
- The database table is now created

### 1.3 Verify the Table Was Created
1. In the left menu, click **"Table Editor"**
2. You should see a table called **"subscriptions"** in the list
3. Click on it to view its structure

**If the table appears, you're good! ✅**

---

## Step 2: Install Dependencies (2 minutes)

Open a terminal in your project directory and run:

```bash
cd "/home/ognjen/Documents/subscription app/subscription-savvy"
bun install
```

Or if you use npm:
```bash
npm install
```

Wait for it to complete. You should see no errors.

---

## Step 3: Start the Development Server (1 minute)

```bash
bun run dev
```

You should see:
```
  VITE v... ready in ... ms

  ➜  Local:   http://localhost:5173/
```

**Keep this terminal open!**

---

## Step 4: Test the App (5 minutes)

Open http://localhost:5173 in your browser.

### 4.1 Create an Account
- You should see a login page
- Click **"Sign up"**
- Enter:
  - Email: `test@example.com`
  - Password: `password123`
- Click **"Create Account"**

**Expected:** You should be logged in and see the dashboard!

### 4.2 Add Your First Subscription
- Click **"Add Subscription"** button
- Fill in the form:
  - Name: `Netflix`
  - Category: `Streaming`
  - Price: `15.99`
  - Billing Cycle: `Monthly`
  - Renewal Date: Pick today or any date
- Click **"Save"**

**Expected:** Subscription appears in the list!

### 4.3 Verify Data Was Saved to Database
1. Go back to Supabase dashboard
2. Click **"Table Editor"**
3. Click **"subscriptions"** table
4. You should see your Netflix subscription with all the data!

**This confirms everything is working! ✅**

### 4.4 Test Other Features
- **Edit:** Click edit on a subscription and change something
- **Delete:** Click delete and confirm
- **Sign Out:** Click the "Sign Out" button
- **Sign Back In:** Use the same email/password

---

## Step 5: Troubleshooting

### ❌ "Table 'subscriptions' does not exist"
- **Solution:** Go back to Step 1.2 and make sure you ran ALL the SQL code
- Check that no errors appeared when you clicked "Run"

### ❌ "Cannot connect to Supabase"
- **Solution:** Check your `.env` file has correct credentials
- Make sure URL starts with `https://` and key is long

### ❌ "Email/password error when signing up"
- **Solution:** Try a different email or check Supabase Auth settings
- Go to Supabase → Authentication → Settings
- Make sure "Email/Password" is enabled

### ❌ "RLS policy error" 
- **Solution:** This means Row Level Security isn't working
- Make sure you ran the complete SQL schema including the RLS policies
- Try deleting the table and running the SQL again

### ❌ App shows blank page or 404
- **Solution:** Clear browser cache (Ctrl+Shift+Delete)
- Restart the dev server (Ctrl+C in terminal, then `bun run dev`)

---

## Quick Reference

| What | Where |
|------|-------|
| Supabase Dashboard | https://app.supabase.com |
| SQL Editor | Dashboard → SQL Editor |
| Table Editor | Dashboard → Table Editor |
| Your Project | tatppnndgfqbbxpjckqm |
| Database Schema File | `supabase-schema.sql` |
| Credentials | `.env` file |
| App | http://localhost:5173 |

---

## What Each Component Does

### Database (Supabase)
- Stores all your subscription data
- Users can only see their own data (RLS)
- Auto-backup and scaling

### Authentication (Supabase Auth)
- Email/password login
- No email confirmation needed (auto-login on signup)
- Session management

### Frontend (Your React App)
- Beautiful UI for managing subscriptions
- Shows charts and stats
- Real-time sync with database

---

## Success Checklist

- [ ] SQL schema executed in Supabase
- [ ] Table "subscriptions" appears in Table Editor
- [ ] Dev server running on localhost:5173
- [ ] Can sign up and see dashboard
- [ ] Can add subscription
- [ ] Subscription appears in Supabase Table Editor
- [ ] Can edit subscription
- [ ] Can delete subscription
- [ ] Can sign out and back in

**If all checked, you're fully set up! 🎉**

---

## Next Steps

Once everything is working:

1. **Explore the app** - Try all features
2. **Add real subscriptions** - Start tracking your real subscriptions
3. **Check dashboard** - View monthly spending and charts
4. **Customize** - Change colors, add categories, etc.
5. **Deploy** - Share with others (Vercel, Netlify, etc.)

---

## Need More Help?

Check these files:
- **SUPABASE_CHECKLIST.md** - Detailed step-by-step guide
- **SUPABASE_SETUP.md** - In-depth troubleshooting
- **MIGRATION_GUIDE.md** - Technical details

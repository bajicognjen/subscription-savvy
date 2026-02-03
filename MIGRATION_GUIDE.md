# Migration Guide: From Local Storage to Supabase

This document outlines all the changes made to integrate Supabase into your subscription app.

## Files Created

### New Files
1. **`supabase-schema.sql`** - Database schema setup
2. **`SUPABASE_SETUP.md`** - Comprehensive setup guide
3. **`src/hooks/useAuth.tsx`** - Authentication context and hook
4. **`src/pages/Auth.tsx`** - Authentication UI (login/sign-up)

## Files Modified

### 1. `src/hooks/useSubscriptions.ts`
**Changes:**
- Removed localStorage references
- Added Supabase client integration
- Added `useAuth` hook to get current user
- All CRUD operations now async (return Promises)
- Added `isLoading` state for loading indicators
- Snake_case database fields are converted to camelCase
- Added toast notifications for user feedback

**Before:**
```typescript
const addSubscription = (subscription: Omit<Subscription, 'id' | 'createdAt'>) => {
  const newSubscription: Subscription = { ...subscription, id: crypto.randomUUID(), ... };
  setSubscriptions((prev) => [...prev, newSubscription]);
  return newSubscription;
};
```

**After:**
```typescript
const addSubscription = async (subscription: Omit<Subscription, 'id' | 'createdAt'>) => {
  // Calls Supabase API
  const { data, error } = await supabase.from('subscriptions').insert([...]);
  // Returns null on error
  return newSubscription;
};
```

### 2. `src/App.tsx`
**Changes:**
- Added `AuthProvider` wrapper for authentication context
- Imported `useAuth` hook
- Created `ProtectedRoute` component for protected pages
- Added `/auth` route for login/sign-up
- Main route `/` now protected - redirects to `/auth` if not authenticated

**Structure:**
```
App
├── AuthProvider
│   └── AppRoutes
│       ├── /auth → Auth page (redirects to / if already logged in)
│       ├── / → ProtectedRoute → Index page
│       └── * → NotFound page
```

### 3. `src/pages/Index.tsx`
**Changes:**
- Added `useAuth` hook to access user and signOut function
- Made `addSubscription` and `updateSubscription` async with await
- Added "Sign Out" button in header
- Added `handleSignOut` function
- Added loading state check for `isLoading` from hook
- Dialog closes automatically after save

### 4. `.env`
**Changes:**
- Updated with proper instructions for Supabase credentials
- Changed placeholder values to `your-project.supabase.co` and `your-anon-key-here`

## API Changes

### Subscription Hook Methods - Now Async

All methods that modify data now return Promises:

```typescript
// Before (synchronous)
addSubscription(data);
updateSubscription(id, data);
deleteSubscription(id);

// After (asynchronous)
await addSubscription(data);
await updateSubscription(id, data);
await deleteSubscription(id);
```

## Authentication Flow

1. **User visits app** → Checks if authenticated
2. **Not authenticated** → Redirected to `/auth` page
3. **Sign up/Sign in** → Supabase handles authentication
4. **Email verification** → Supabase sends verification email
5. **Authenticated** → Can access `/` and see subscriptions
6. **Sign out** → Clears auth session, redirects to `/auth`

## Database Schema

### subscriptions table

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| user_id | UUID | NOT NULL, REFERENCES auth.users(id) ON DELETE CASCADE |
| name | TEXT | NOT NULL |
| category | TEXT | NOT NULL, CHECK (category IN (...)) |
| price | DECIMAL | NOT NULL |
| billing_cycle | TEXT | NOT NULL, CHECK (billing_cycle IN (...)) |
| renewal_date | TIMESTAMPTZ | NOT NULL |
| payment_method | TEXT | OPTIONAL |
| notes | TEXT | OPTIONAL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

### Indexes
- `subscriptions_user_id_idx` - For filtering by user
- `subscriptions_renewal_date_idx` - For sorting by renewal date

### Row Level Security (RLS)
Users can only see, insert, update, and delete their own subscriptions.

## Error Handling

All operations now include error handling with user-friendly toast notifications:

```typescript
try {
  // Perform operation
} catch (error) {
  toast({
    title: 'Error',
    description: 'User-friendly error message',
    variant: 'destructive',
  });
}
```

## State Management

### New States
- `isLoading` - Tracks async operations
- `user` - Current authenticated user (from useAuth)

### Updated States
- `isLoaded` - Still tracks initial data load
- `subscriptions` - Syncs with Supabase

## Testing the Integration

1. **Sign up** with a test email
2. **Add a subscription** - Check Supabase dashboard to verify it's stored
3. **Edit a subscription** - Verify changes in Supabase
4. **Delete a subscription** - Verify deletion in Supabase
5. **Refresh page** - Data should persist
6. **Sign out** - Should return to login page
7. **Sign in again** - Should see your subscriptions

## Important Notes

- ⚠️ Make sure to set up Row Level Security properly in Supabase
- ⚠️ Always validate VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
- ⚠️ Run the SQL schema setup before using the app
- 💡 The app now requires internet connection for all operations
- 💡 Supabase handles data persistence and backups automatically

## Next Steps

1. Set up Supabase project
2. Run the SQL schema
3. Add environment variables
4. Test authentication flow
5. Test CRUD operations
6. Deploy to production

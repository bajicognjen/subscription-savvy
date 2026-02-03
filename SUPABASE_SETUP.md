# SubTracker - Subscription Management App with Supabase

A modern, responsive subscription tracker built with React, TypeScript, and Supabase for secure cloud-based data storage.

## Features

- 🔐 User authentication with Supabase Auth
- 📊 Track all your subscriptions in one place
- 💰 Calculate monthly spending across all subscriptions
- 📈 Visualize spending by category with interactive charts
- 🔔 Get notified about upcoming renewals
- 🎨 Modern, responsive UI with dark mode support

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Copy your **Project URL** and **Anon Key** from the API settings

### 2. Set Up Database Schema

1. In Supabase, go to the SQL Editor
2. Create a new query and copy the contents of `supabase-schema.sql`
3. Execute the SQL to create the `subscriptions` table and set up Row Level Security

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace the values with your actual Supabase credentials.

### 4. Install Dependencies

```bash
bun install
# or
npm install
```

### 5. Run the Development Server

```bash
bun run dev
# or
npm run dev
```

The app will open at `http://localhost:5173`

## Project Structure

```
src/
├── components/          # React components
├── hooks/
│   ├── useAuth.tsx     # Authentication context and hook
│   └── useSubscriptions.ts  # Supabase data management
├── pages/
│   ├── Index.tsx       # Main dashboard
│   ├── Auth.tsx        # Login/Sign up page
│   └── NotFound.tsx    # 404 page
├── types/
│   └── subscription.ts # TypeScript interfaces
├── supabase.ts         # Supabase client initialization
└── main.tsx           # App entry point
```

## Key Changes from Local Storage Version

### Database Structure

Subscriptions are now stored in Supabase with the following fields:

- `id` - UUID (Primary Key)
- `user_id` - UUID (Foreign Key to auth.users)
- `name` - Text
- `category` - Text (Streaming, Software, Fitness, Gaming, Other)
- `price` - Decimal
- `billing_cycle` - Text (weekly, monthly, yearly)
- `renewal_date` - Timestamp
- `payment_method` - Text (optional)
- `notes` - Text (optional)
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Authentication

- Users must sign up / sign in before using the app
- Each user can only see and manage their own subscriptions (enforced by Row Level Security)
- Authentication state is automatically preserved across page reloads

### API Integration

All CRUD operations now use Supabase:

- ✅ Real-time data syncing
- ✅ Secure authentication
- ✅ Automatic data backup
- ✅ Row Level Security (RLS) for data privacy

## Building for Production

```bash
bun run build
# or
npm run build
```

The production build will be in the `dist/` directory.

## Troubleshooting

### "VITE_SUPABASE_URL not found"

Make sure your `.env` file is in the project root with the correct variable names.

### "User is not authenticated"

Ensure you've signed up and verified your email. Check the Supabase Auth dashboard for any errors.

### Data not syncing

1. Check that Row Level Security policies are enabled in Supabase
2. Verify the `user_id` in the subscriptions table matches your auth user ID
3. Check browser console for error messages

## Technologies Used

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: React Hooks + React Query
- **UI Components**: shadcn/ui (Radix UI + Tailwind)

## License

MIT

export type BillingCycle = 'weekly' | 'monthly' | 'yearly';

export type Category = 'Streaming' | 'Software' | 'Fitness' | 'Gaming' | 'Other';

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

export interface Subscription {
  id: string;
  name: string;
  category: Category;
  // price is stored normalized in USD
  price: number;
  // original price entered by user and its currency
  priceOriginal?: number;
  currency?: 'USD' | 'EUR' | 'RSD';
  billingCycle: BillingCycle;
  renewalDate: string;
  paymentMethod?: string;
  notes?: string;
  status: SubscriptionStatus;
  createdAt: string;
}

export const CATEGORIES: Category[] = ['Streaming', 'Software', 'Fitness', 'Gaming', 'Other'];

export const CATEGORY_COLORS: Record<Category, string> = {
  Streaming: 'hsl(var(--chart-streaming))',
  Software: 'hsl(var(--chart-software))',
  Fitness: 'hsl(var(--chart-fitness))',
  Gaming: 'hsl(var(--chart-gaming))',
  Other: 'hsl(var(--chart-other))',
};

export const CATEGORY_TAILWIND_COLORS: Record<Category, { bg: string; text: string; border: string }> = {
  Streaming: { bg: 'bg-blue-500/10', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-500/30' },
  Software: { bg: 'bg-purple-500/10', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-500/30' },
  Fitness: { bg: 'bg-red-500/10', text: 'text-red-700 dark:text-red-400', border: 'border-red-500/30' },
  Gaming: { bg: 'bg-orange-500/10', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-500/30' },
  Other: { bg: 'bg-gray-500/10', text: 'text-gray-700 dark:text-gray-400', border: 'border-gray-500/30' },
};

export const CATEGORY_ICONS: Record<Category, string> = {
  Streaming: '🎬',
  Software: '💻',
  Fitness: '💪',
  Gaming: '🎮',
  Other: '📦',
};

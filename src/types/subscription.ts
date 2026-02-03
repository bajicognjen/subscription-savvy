export type BillingCycle = 'weekly' | 'monthly' | 'yearly';

export type Category = 'Streaming' | 'Software' | 'Fitness' | 'Gaming' | 'Other';

export interface Subscription {
  id: string;
  name: string;
  category: Category;
  price: number;
  billingCycle: BillingCycle;
  renewalDate: string;
  paymentMethod?: string;
  notes?: string;
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

export const CATEGORY_ICONS: Record<Category, string> = {
  Streaming: '🎬',
  Software: '💻',
  Fitness: '💪',
  Gaming: '🎮',
  Other: '📦',
};

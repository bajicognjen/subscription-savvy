import { Category } from './subscription';

export interface SpendingTrend {
  month: string; // "2024-01"
  total: number;
  subscriptions: number;
  categories: Record<Category, number>;
  year: number;
  monthNumber: number;
}

export interface AnalyticsData {
  trends: SpendingTrend[];
  predictions: {
    nextMonth: number;
    nextYear: number;
    confidence: number; // 0-1
  };
  insights: string[];
  categoryBreakdown: CategoryBreakdown[];
  topSubscriptions: TopSubscription[];
}

export interface CategoryBreakdown {
  category: Category;
  amount: number;
  percentage: number;
  change: number; // percentage change from previous period
  subscriptions: number;
}

export interface TopSubscription {
  id: string;
  name: string;
  category: Category;
  monthlyCost: number;
  percentageOfTotal: number;
}

export interface ROICalculation {
  subscriptionId: string;
  name: string;
  monthlyCost: number;
  estimatedValue: number;
  roiPercentage: number;
  recommendation: 'Keep' | 'Review' | 'Cancel';
  usageScore?: number; // 1-10
  valueScore?: number; // 1-10
}

export interface BudgetForecast {
  currentMonth: {
    actual: number;
    budget: number;
    remaining: number;
    percentage: number;
    monthProgress: number;
  };
  nextMonth: {
    predicted: number;
    renewals: number;
    newSubscriptions: number;
    cancellations: number;
  };
  next3Months: {
    month: string;
    predicted: number;
  }[];
}

export interface AnalyticsFilters {
  startDate: Date;
  endDate: Date;
  categories: Category[];
  includeInactive: boolean;
}

export interface Notification {
  id: string;
  type: 'renewal' | 'budget' | 'price_change' | 'recommendation' | 'insight';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  action?: {
    label: string;
    action: () => void;
    url?: string;
  };
  subscriptionId?: string;
}
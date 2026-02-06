import { useState, useEffect, useMemo } from 'react';
import { Subscription, Category } from '@/types/subscription';
import { 
  AnalyticsData, 
  SpendingTrend, 
  CategoryBreakdown, 
  TopSubscription, 
  ROICalculation, 
  BudgetForecast,
  AnalyticsFilters 
} from '@/types/analytics';
import { useSubscriptions } from './useSubscriptions';
import { useCurrency } from './useCurrency';
import { useSalaryAndSavings } from './useSalaryAndSavings';

export function useAnalytics() {
  const { subscriptions, isLoaded } = useSubscriptions();
  const { convert } = useCurrency();
  const { preferences } = useSalaryAndSavings();
  
  const [filters, setFilters] = useState<AnalyticsFilters>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1), // 6 months ago
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 6, 0), // 6 months from now
    categories: ['Streaming', 'Software', 'Fitness', 'Gaming', 'Other'],
    includeInactive: false,
  });

  // Filter subscriptions based on current filters
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => {
      // Filter by status
      if (!filters.includeInactive && sub.status !== 'active') {
        return false;
      }
      
      // Filter by categories
      if (filters.categories.length > 0 && !filters.categories.includes(sub.category)) {
        return false;
      }
      
      // Filter by date range
      const renewalDate = new Date(sub.renewalDate);
      if (renewalDate < filters.startDate || renewalDate > filters.endDate) {
        return false;
      }
      
      return true;
    });
  }, [subscriptions, filters]);

  // Calculate monthly spending trends
  const spendingTrends = useMemo(() => {
    if (!isLoaded || filteredSubscriptions.length === 0) {
      return [];
    }

    // Group subscriptions by month
    const monthlyData = new Map<string, {
      total: number;
      subscriptions: number;
      categories: Record<Category, number>;
    }>();

    filteredSubscriptions.forEach(sub => {
      const renewalDate = new Date(sub.renewalDate);
      const monthKey = `${renewalDate.getFullYear()}-${String(renewalDate.getMonth() + 1).padStart(2, '0')}`;
      const monthlyCost = getMonthlyEquivalent(sub);

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          total: 0,
          subscriptions: 0,
          categories: {
            Streaming: 0,
            Software: 0,
            Fitness: 0,
            Gaming: 0,
            Other: 0,
          }
        });
      }

      const data = monthlyData.get(monthKey)!;
      data.total += monthlyCost;
      data.subscriptions += 1;
      data.categories[sub.category] += monthlyCost;
    });

    // Convert to array and sort by date
    const trends: SpendingTrend[] = Array.from(monthlyData.entries())
      .map(([month, data]) => {
        const [year, monthNum] = month.split('-').map(Number);
        return {
          month,
          total: Math.round(data.total * 100) / 100,
          subscriptions: data.subscriptions,
          categories: data.categories,
          year,
          monthNumber: monthNum,
        };
      })
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.monthNumber - b.monthNumber;
      });

    return trends;
  }, [filteredSubscriptions, isLoaded]);

  // Calculate category breakdown
  const categoryBreakdown = useMemo(() => {
    if (!isLoaded || filteredSubscriptions.length === 0) {
      return [];
    }

    const categoryTotals: Record<Category, number> = {
      Streaming: 0,
      Software: 0,
      Fitness: 0,
      Gaming: 0,
      Other: 0,
    };

    let totalAmount = 0;

    filteredSubscriptions.forEach(sub => {
      const monthlyCost = getMonthlyEquivalent(sub);
      categoryTotals[sub.category] += monthlyCost;
      totalAmount += monthlyCost;
    });

    const breakdown: CategoryBreakdown[] = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category: category as Category,
        amount: Math.round(amount * 100) / 100,
        percentage: totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0,
        change: 0, // Would need historical data to calculate
        subscriptions: filteredSubscriptions.filter(s => s.category === category).length,
      }))
      .filter(item => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    return breakdown;
  }, [filteredSubscriptions, isLoaded]);

  // Get top subscriptions by cost
  const topSubscriptions = useMemo(() => {
    if (!isLoaded || filteredSubscriptions.length === 0) {
      return [];
    }

    const totalMonthlySpend = filteredSubscriptions.reduce((sum, sub) => sum + getMonthlyEquivalent(sub), 0);

    const topSubs: TopSubscription[] = filteredSubscriptions
      .map(sub => ({
        id: sub.id,
        name: sub.name,
        category: sub.category,
        monthlyCost: getMonthlyEquivalent(sub),
        percentageOfTotal: totalMonthlySpend > 0 ? (getMonthlyEquivalent(sub) / totalMonthlySpend) * 100 : 0,
      }))
      .sort((a, b) => b.monthlyCost - a.monthlyCost)
      .slice(0, 10); // Top 10

    return topSubs;
  }, [filteredSubscriptions, isLoaded]);

  // Calculate predictions
  const predictions = useMemo(() => {
    if (spendingTrends.length < 2) {
      return {
        nextMonth: 0,
        nextYear: 0,
        confidence: 0,
      };
    }

    // Simple linear regression for next month prediction
    const n = spendingTrends.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = spendingTrends.reduce((sum, trend) => sum + trend.total, 0);
    const sumXY = spendingTrends.reduce((sum, trend, index) => sum + index * trend.total, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const nextMonth = Math.max(0, intercept + slope * n);
    const nextYear = Math.max(0, intercept + slope * (n + 11)); // 12 months from now

    // Calculate confidence based on variance
    const variance = spendingTrends.reduce((sum, trend, index) => {
      const predicted = intercept + slope * index;
      return sum + Math.pow(trend.total - predicted, 2);
    }, 0);
    
    const confidence = Math.max(0, Math.min(1, 1 - (variance / sumY)));

    return {
      nextMonth: Math.round(nextMonth * 100) / 100,
      nextYear: Math.round(nextYear * 100) / 100,
      confidence,
    };
  }, [spendingTrends]);

  // Generate insights
  const insights = useMemo(() => {
    const insights: string[] = [];

    if (spendingTrends.length === 0) {
      return ['Start adding subscriptions to see insights'];
    }

    const currentMonth = spendingTrends[spendingTrends.length - 1];
    const previousMonth = spendingTrends.length > 1 ? spendingTrends[spendingTrends.length - 2] : null;

    // Trend insights
    if (previousMonth) {
      const change = currentMonth.total - previousMonth.total;
      const changePercent = previousMonth.total > 0 ? (change / previousMonth.total) * 100 : 0;

      if (change > 0) {
        insights.push(`Spending increased by ${formatCurrency(Math.abs(change))} (${Math.abs(changePercent).toFixed(1)}%) compared to last month`);
      } else if (change < 0) {
        insights.push(`Spending decreased by ${formatCurrency(Math.abs(change))} (${Math.abs(changePercent).toFixed(1)}%) compared to last month`);
      } else {
        insights.push('Spending remained stable compared to last month');
      }
    }

    // Category insights
    const topCategory = categoryBreakdown[0];
    if (topCategory) {
      insights.push(`${topCategory.category} is your largest expense category at ${topCategory.percentage}% of total spending`);
    }

    // Budget insights - get budget from localStorage (SettingsPanel)
    const monthlyBudget = getMonthlyBudget();
    if (monthlyBudget) {
      const budgetRemaining = monthlyBudget - currentMonth.total;
      if (budgetRemaining < 0) {
        insights.push(`⚠️ You're over budget by ${formatCurrency(Math.abs(budgetRemaining))}`);
      } else if (budgetRemaining < monthlyBudget * 0.1) {
        insights.push(`💡 You have only ${formatCurrency(budgetRemaining)} remaining in your monthly budget`);
      }
    }

    // Subscription count insights
    if (currentMonth.subscriptions > 10) {
      insights.push(`You have ${currentMonth.subscriptions} active subscriptions. Consider reviewing for potential savings`);
    }

    return insights.slice(0, 5); // Limit to 5 insights
  }, [spendingTrends, categoryBreakdown]);

  // Helper function to get monthly budget from localStorage
  function getMonthlyBudget(): number | null {
    const saved = localStorage.getItem('monthlyBudget');
    return saved ? parseFloat(saved) : null;
  }

  // Calculate budget forecast
  const budgetForecast = useMemo((): BudgetForecast => {
    const currentMonth = new Date();
    const currentMonthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
    const currentTrend = spendingTrends.find(t => t.month === currentMonthKey);

    const actual = currentTrend?.total || 0;
    const budget = getMonthlyBudget() || 0;
    
    // For budget calculation, we only consider actual monthly costs, not annualized costs
    // This means annual subscriptions that cost $120/year should only count as $10/month toward budget
    const monthlySpend = actual;
    const remaining = budget - monthlySpend;

    // Calculate renewals for next month (only monthly/weekly renewals, not annual)
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const renewals = filteredSubscriptions
      .filter(sub => {
        const renewalDate = new Date(sub.renewalDate);
        // Only include monthly and weekly subscriptions for next month renewals
        // Annual subscriptions don't renew monthly
        return (sub.billingCycle === 'monthly' || sub.billingCycle === 'weekly') &&
               renewalDate.getMonth() === nextMonth.getMonth() && 
               renewalDate.getFullYear() === nextMonth.getFullYear();
      })
      .reduce((sum, sub) => sum + getMonthlyEquivalent(sub), 0);

    return {
      currentMonth: {
        actual: Math.round(actual * 100) / 100,
        budget: Math.round(budget * 100) / 100,
        remaining: Math.round(remaining * 100) / 100,
        percentage: budget > 0 ? Math.round((monthlySpend / budget) * 100) : 0,
        monthProgress: 100, // For monthly subscriptions, we consider the full month
      },
      nextMonth: {
        predicted: Math.round((monthlySpend + renewals) * 100) / 100,
        renewals: Math.round(renewals * 100) / 100,
        newSubscriptions: 0, // Would need user input
        cancellations: 0, // Would need user input
      },
      next3Months: [],
    };
  }, [spendingTrends, filteredSubscriptions]);

  // Helper functions
  function getMonthlyEquivalent(subscription: Subscription): number {
    switch (subscription.billingCycle) {
      case 'weekly':
        // Weekly price * 52 weeks / 12 months = weekly price * 4.33
        return subscription.price * 52 / 12;
      case 'monthly':
        // Monthly price is already monthly
        return subscription.price;
      case 'yearly':
        // Yearly price / 12 months
        return subscription.price / 12;
      default:
        return subscription.price;
    }
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  }

  // Calculate ROI for a subscription
  function calculateROI(subscription: Subscription, estimatedValue: number, usageScore: number = 5): ROICalculation {
    const monthlyCost = getMonthlyEquivalent(subscription);
    const roiPercentage = estimatedValue > 0 ? ((estimatedValue - monthlyCost) / monthlyCost) * 100 : 0;
    
    let recommendation: 'Keep' | 'Review' | 'Cancel' = 'Keep';
    if (roiPercentage < -20 || usageScore < 3) {
      recommendation = 'Cancel';
    } else if (roiPercentage < 0 || usageScore < 6) {
      recommendation = 'Review';
    }

    return {
      subscriptionId: subscription.id,
      name: subscription.name,
      monthlyCost,
      estimatedValue,
      roiPercentage: Math.round(roiPercentage * 100) / 100,
      recommendation,
      usageScore,
      valueScore: Math.round((estimatedValue / monthlyCost) * 10),
    };
  }

  const analyticsData: AnalyticsData = {
    trends: spendingTrends,
    predictions,
    insights,
    categoryBreakdown,
    topSubscriptions,
  };

  return {
    analyticsData,
    budgetForecast,
    filters,
    setFilters,
    calculateROI,
    isLoading: !isLoaded,
  };
}
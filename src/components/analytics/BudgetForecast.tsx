import React from 'react';
import { BudgetForecast } from '@/types/analytics';
import { useCurrency } from '@/hooks/useCurrency';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  AlertTriangle,
  CheckCircle 
} from 'lucide-react';

interface BudgetForecastProps {
  data: BudgetForecast;
}

export function BudgetForecastComponent({ data }: BudgetForecastProps) {
  const { formatAmount, convert } = useCurrency();
  
  const currentMonth = data.currentMonth;
  const nextMonth = data.nextMonth;
  
  // Calculate budget health
  const budgetHealth = currentMonth.budget > 0 ? (currentMonth.actual / currentMonth.budget) * 100 : 0;
  const isOverBudget = budgetHealth > 100;
  const isNearBudget = budgetHealth > 90 && budgetHealth <= 100;
  
  // Calculate next month trend
  const nextMonthTrend = nextMonth.predicted - currentMonth.actual;
  const nextMonthTrendPercent = currentMonth.actual > 0 ? (nextMonthTrend / currentMonth.actual) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Budget Forecast</h3>
        <p className="text-sm text-muted-foreground">
          Predict your spending and stay within budget
        </p>
      </div>

      {/* Current Month Status */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-card rounded-lg border border-border/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Current Month</h4>
                <p className="text-sm text-muted-foreground">Actual vs Budget</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className={`text-lg font-bold ${currentMonth.remaining < 0 ? 'text-red-600' : currentMonth.remaining < currentMonth.budget * 0.1 ? 'text-yellow-600' : 'text-green-600'}`}>
                {formatAmount(convert(currentMonth.remaining))}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Budget</span>
              <span className="font-medium">{formatAmount(convert(currentMonth.budget))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Spent</span>
              <span className="font-medium">{formatAmount(convert(currentMonth.actual))}</span>
            </div>
          </div>

          <div className="mt-4">
            <Progress 
              value={Math.min(budgetHealth, 100)} 
              className={`h-2 ${isOverBudget ? 'bg-red-500/20' : isNearBudget ? 'bg-yellow-500/20' : 'bg-primary/20'}`}
            />
            <p className={`text-xs mt-1 ${isOverBudget ? 'text-red-600' : isNearBudget ? 'text-yellow-600' : 'text-muted-foreground'}`}>
              {isOverBudget ? '⚠️ Over budget' : isNearBudget ? '⚠️ Budget limit approaching' : 'On track'}
            </p>
          </div>
        </div>

        {/* Next Month Prediction */}
        <div className="bg-card rounded-lg border border-border/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold">Next Month</h4>
                <p className="text-sm text-muted-foreground">Predicted spending</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Predicted</p>
              <p className="text-lg font-bold">{formatAmount(convert(nextMonth.predicted))}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Renewals</span>
              <span className="font-medium">{formatAmount(convert(nextMonth.renewals))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">New Subscriptions</span>
              <span className="font-medium">{formatAmount(convert(nextMonth.newSubscriptions))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cancellations</span>
              <span className="font-medium">-{formatAmount(convert(nextMonth.cancellations))}</span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            {nextMonthTrend > 0 ? (
              <TrendingUp className="h-4 w-4 text-red-600" />
            ) : nextMonthTrend < 0 ? (
              <TrendingDown className="h-4 w-4 text-green-600" />
            ) : (
              <CheckCircle className="h-4 w-4 text-blue-600" />
            )}
            <span className={`text-sm font-medium ${nextMonthTrend > 0 ? 'text-red-600' : nextMonthTrend < 0 ? 'text-green-600' : 'text-blue-600'}`}>
              {nextMonthTrend > 0 ? '↑' : nextMonthTrend < 0 ? '↓' : '→'} {formatAmount(Math.abs(nextMonthTrend))} ({nextMonthTrendPercent > 0 ? '+' : ''}{nextMonthTrendPercent.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Forecast Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-green-700 dark:text-green-400">Under Budget</p>
              <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                You're spending {formatAmount(convert(currentMonth.budget - currentMonth.actual))} less than your budget
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-700 dark:text-blue-400">Next Month Trend</p>
              <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                {nextMonthTrend > 0 ? 'Spending may increase' : nextMonthTrend < 0 ? 'Spending may decrease' : 'Spending stable'}
              </p>
            </div>
            <TrendingUp className={`h-8 w-8 ${nextMonthTrend > 0 ? 'text-red-600' : nextMonthTrend < 0 ? 'text-green-600' : 'text-blue-600'}`} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-orange-700 dark:text-orange-400">Action Items</p>
              <p className="text-sm text-orange-600 dark:text-orange-300 mt-1">
                {isOverBudget ? 'Review subscriptions to reduce costs' : 'Consider saving excess budget'}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-card rounded-lg border border-border/50 p-6">
        <h4 className="font-semibold mb-3">Recommendations</h4>
        <div className="grid gap-3">
          {isOverBudget && (
            <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-700 dark:text-red-400">Reduce Spending</p>
                <p className="text-sm text-red-600 dark:text-red-300">
                  You're over budget by {formatAmount(convert(Math.abs(currentMonth.remaining)))}. Consider pausing or canceling non-essential subscriptions.
                </p>
              </div>
            </div>
          )}
          
          {nextMonthTrend > 0 && (
            <div className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-700 dark:text-yellow-400">Prepare for Increase</p>
                <p className="text-sm text-yellow-600 dark:text-yellow-300">
                  Next month spending may increase by {formatAmount(convert(nextMonthTrend))}. Review upcoming renewals.
                </p>
              </div>
            </div>
          )}

          {!isOverBudget && nextMonthTrend <= 0 && (
            <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-700 dark:text-green-400">Great Job!</p>
                <p className="text-sm text-green-600 dark:text-green-300">
                  You're staying within budget. Consider allocating excess to savings or investments.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
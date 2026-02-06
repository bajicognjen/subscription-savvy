import React from 'react';
import { TopSubscription } from '@/types/analytics';
import { useCurrency } from '@/hooks/useCurrency';
import { CATEGORY_COLORS } from '@/types/subscription';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent, 
  BarChart3 
} from 'lucide-react';

interface TopSubscriptionsProps {
  subscriptions: TopSubscription[];
}

export function TopSubscriptions({ subscriptions }: TopSubscriptionsProps) {
  const { formatAmount, convert } = useCurrency();

  if (subscriptions.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border/50 p-6">
        <h3 className="text-lg font-semibold mb-4">Top Subscriptions</h3>
        <p className="text-muted-foreground">Add subscriptions to see your top spenders</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Top Subscriptions</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BarChart3 className="h-4 w-4" />
          <span>By monthly cost</span>
        </div>
      </div>

      <div className="space-y-3">
        {subscriptions.slice(0, 5).map((sub, index) => (
          <div
            key={sub.id}
            className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/75 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full flex items-center justify-center"
                     style={{ backgroundColor: CATEGORY_COLORS[sub.category] + '20', color: CATEGORY_COLORS[sub.category] }}>
                  <DollarSign className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">{sub.name}</p>
                  <p className="text-sm text-muted-foreground">{sub.category}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="font-semibold">{formatAmount(convert(sub.monthlyCost))}</p>
                <p className="text-sm text-muted-foreground">{sub.percentageOfTotal.toFixed(1)}% of total</p>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div 
                    className="h-2 bg-primary rounded-full"
                    style={{ width: `${sub.percentageOfTotal}%` }}
                  />
                </div>
                <span>{sub.percentageOfTotal.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-sm text-muted-foreground">Average Cost</p>
          <p className="text-lg font-semibold">
            {formatAmount(convert(subscriptions.reduce((sum, s) => sum + s.monthlyCost, 0) / subscriptions.length))}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total Top 5</p>
          <p className="text-lg font-semibold">
            {formatAmount(convert(subscriptions.slice(0, 5).reduce((sum, s) => sum + s.monthlyCost, 0)))}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total All</p>
          <p className="text-lg font-semibold">
            {formatAmount(convert(subscriptions.reduce((sum, s) => sum + s.monthlyCost, 0)))}
          </p>
        </div>
      </div>

      {/* Insights */}
      {subscriptions.length > 0 && (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg">
          <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">Insights</h4>
          <div className="grid gap-2 text-sm text-blue-600 dark:text-blue-300">
            <p>• {subscriptions[0].name} is your most expensive subscription</p>
            <p>• Top 5 subscriptions make up {subscriptions.slice(0, 5).reduce((sum, s) => sum + s.percentageOfTotal, 0).toFixed(1)}% of your total spending</p>
            <p>• Consider reviewing subscriptions that exceed {formatAmount(convert(subscriptions[0].monthlyCost * 0.3))} monthly</p>
          </div>
        </div>
      )}
    </div>
  );
}
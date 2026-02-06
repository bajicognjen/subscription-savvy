import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

interface MonthlyTotalCardProps {
  total: number;
  subscriptionCount: number;
  monthlyBudget?: number;
}

export function MonthlyTotalCard({ total, subscriptionCount, monthlyBudget }: MonthlyTotalCardProps) {
  const { convert, formatAmount } = useCurrency();
  const convertedTotal = convert(total);
  const budgetPercentage = monthlyBudget ? (convertedTotal / monthlyBudget) * 100 : 0;
  const isOverBudget = monthlyBudget && convertedTotal > monthlyBudget;

  return (
    <Card className="relative overflow-hidden gradient-primary shadow-card border-0">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
      <CardContent className="p-6 relative">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-primary-foreground/80 text-sm font-medium mb-1">
              Monthly Spending
            </p>
            <p className={`text-4xl font-bold tracking-tight ${isOverBudget ? 'text-red-400' : 'text-primary-foreground'}`}>
              {formatAmount(convertedTotal)}
            </p>
            <p className="text-primary-foreground/70 text-sm mt-2">
              {subscriptionCount} active subscription{subscriptionCount !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="h-16 w-16 rounded-2xl bg-primary-foreground/20 backdrop-blur flex items-center justify-center">
            <DollarSign className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>

        {monthlyBudget && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-primary-foreground/70">Budget</span>
              <span className={isOverBudget ? 'text-red-400 font-semibold' : 'text-primary-foreground/80'}>
                {formatAmount(convertedTotal)} / {formatAmount(monthlyBudget)}
              </span>
            </div>
            <Progress 
              value={Math.min(budgetPercentage, 100)} 
              className="h-2 bg-primary-foreground/20"
            />
            {isOverBudget && (
              <div className="flex items-center gap-2 mt-2 text-red-400 text-xs">
                <AlertCircle className="h-3 w-3" />
                <span>Over budget by {formatAmount(convertedTotal - monthlyBudget)}</span>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 text-primary-foreground/80 text-sm">
          <TrendingUp className="h-4 w-4" />
          <span>Track and optimize your spending</span>
        </div>
      </CardContent>
    </Card>
  );
}

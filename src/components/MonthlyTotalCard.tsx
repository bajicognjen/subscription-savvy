import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, DollarSign } from 'lucide-react';

interface MonthlyTotalCardProps {
  total: number;
  subscriptionCount: number;
}

export function MonthlyTotalCard({ total, subscriptionCount }: MonthlyTotalCardProps) {
  return (
    <Card className="relative overflow-hidden gradient-primary shadow-card border-0">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
      <CardContent className="p-6 relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-foreground/80 text-sm font-medium mb-1">
              Monthly Spending
            </p>
            <p className="text-4xl font-bold text-primary-foreground tracking-tight">
              ${total.toFixed(2)}
            </p>
            <p className="text-primary-foreground/70 text-sm mt-2">
              {subscriptionCount} active subscription{subscriptionCount !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="h-16 w-16 rounded-2xl bg-primary-foreground/20 backdrop-blur flex items-center justify-center">
            <DollarSign className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-primary-foreground/80 text-sm">
          <TrendingUp className="h-4 w-4" />
          <span>Track and optimize your spending</span>
        </div>
      </CardContent>
    </Card>
  );
}

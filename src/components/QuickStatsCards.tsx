import { Card, CardContent } from '@/components/ui/card';
import { Subscription } from '@/types/subscription';
import { useCurrency } from '@/hooks/useCurrency';
import { TrendingUp, Clock, BarChart3 } from 'lucide-react';
import { differenceInDays } from 'date-fns';

interface QuickStatsCardsProps {
  subscriptions: Subscription[];
}

export function QuickStatsCards({ subscriptions }: QuickStatsCardsProps) {
  const { convert, formatAmount } = useCurrency();

  // Most expensive subscription
  const mostExpensive = subscriptions.length > 0 ? subscriptions.reduce((max, sub) => {
    const subAnnual = sub.price * (sub.billingCycle === 'weekly' ? 52 : sub.billingCycle === 'yearly' ? 1 : 12);
    const maxAnnual = max.price * (max.billingCycle === 'weekly' ? 52 : max.billingCycle === 'yearly' ? 1 : 12);
    return subAnnual > maxAnnual ? sub : max;
  }) : null;

  // Renewing soonest
  const renewingSoon = subscriptions
    .filter((s) => s.status === 'active')
    .sort((a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime())[0];

  // Total annual cost
  const totalAnnual = subscriptions
    .filter((s) => s.status === 'active')
    .reduce((sum, sub) => {
      const annual = sub.price * (sub.billingCycle === 'weekly' ? 52 : sub.billingCycle === 'yearly' ? 1 : 12);
      return sum + annual;
    }, 0);

  const daysUntilRenewal = renewingSoon ? differenceInDays(new Date(renewingSoon.renewalDate), new Date()) : 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Most Expensive (Annual)</p>
              <p className="text-lg font-bold text-foreground">
                {mostExpensive ? formatAmount(convert(mostExpensive.price * (mostExpensive.billingCycle === 'weekly' ? 52 : mostExpensive.billingCycle === 'yearly' ? 1 : 12), 'USD')) : 'N/A'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{mostExpensive?.name || 'None'}</p>
            </div>
            <TrendingUp className="h-5 w-5 text-accent" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Renewing Soonest</p>
              <p className="text-lg font-bold text-foreground">{daysUntilRenewal}d</p>
              <p className="text-xs text-muted-foreground mt-1">{renewingSoon?.name || 'None'}</p>
            </div>
            <Clock className="h-5 w-5 text-primary" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Annual Cost</p>
              <p className="text-lg font-bold text-foreground">
                {formatAmount(convert(totalAnnual, 'USD'))}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Active only</p>
            </div>
            <BarChart3 className="h-5 w-5 text-secondary" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Subscription, CATEGORY_ICONS } from '@/types/subscription';
import { AlertTriangle, CalendarClock } from 'lucide-react';
import { format, isToday, isTomorrow, differenceInDays } from 'date-fns';

interface UpcomingRenewalsProps {
  subscriptions: Subscription[];
}

function getRenewalText(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  const days = differenceInDays(date, new Date());
  return `In ${days} day${days !== 1 ? 's' : ''}`;
}

export function UpcomingRenewals({ subscriptions }: UpcomingRenewalsProps) {
  if (subscriptions.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" />
            Upcoming Renewals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No renewals in the next 7 days 🎉
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-accent/30 bg-accent/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-accent" />
          Upcoming Renewals
          <span className="ml-auto text-sm font-normal text-accent">
            {subscriptions.length} this week
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {subscriptions.map((sub) => {
          const renewalDate = new Date(sub.renewalDate);
          return (
            <div
              key={sub.id}
              className="flex items-center gap-3 p-2 rounded-lg bg-card/80"
            >
              <span className="text-lg">{CATEGORY_ICONS[sub.category]}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{sub.name}</p>
                <p className="text-xs text-muted-foreground">
                  ${sub.price.toFixed(2)}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-accent">
                  {getRenewalText(renewalDate)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(renewalDate, 'MMM d')}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

import { Subscription } from '@/types/subscription';

interface SubscriptionStatsProps {
  subscriptions: Subscription[];
}

export function SubscriptionStats({ subscriptions }: SubscriptionStatsProps) {
  const activeCount = subscriptions.filter((s) => s.status === 'active').length;
  const pausedCount = subscriptions.filter((s) => s.status === 'paused').length;
  const cancelledCount = subscriptions.filter((s) => s.status === 'cancelled').length;

  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      <div>
        <span className="font-medium text-green-600 dark:text-green-400">{activeCount}</span>
        <span> Active</span>
      </div>
      <span>•</span>
      <div>
        <span className="font-medium text-yellow-600 dark:text-yellow-400">{pausedCount}</span>
        <span> Paused</span>
      </div>
      <span>•</span>
      <div>
        <span className="font-medium text-red-600 dark:text-red-400">{cancelledCount}</span>
        <span> Cancelled</span>
      </div>
    </div>
  );
}

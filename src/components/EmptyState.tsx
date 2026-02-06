import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles, Zap, TrendingDown } from 'lucide-react';

interface EmptyStateProps {
  onAdd: () => void;
}

export function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="space-y-6">
      <Card className="border-dashed border-2 border-border">
        <CardContent className="py-12 flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Start tracking subscriptions</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Add your first subscription to get insights on your spending and manage renewals.
          </p>
          <Button onClick={onAdd} className="gap-2 mb-4">
            <Plus className="h-4 w-4" />
            Add Your First Subscription
          </Button>
          <p className="text-xs text-muted-foreground">e.g., Netflix, Spotify, Adobe Creative Cloud, etc.</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <h4 className="font-medium text-sm mb-1">Track Spending</h4>
                <p className="text-xs text-muted-foreground">See your monthly & annual spending at a glance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0">
                <h4 className="font-medium text-sm mb-1">Optimize Budget</h4>
                <p className="text-xs text-muted-foreground">Get alerts when you exceed your budget</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Plus className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0">
                <h4 className="font-medium text-sm mb-1">Manage Renewals</h4>
                <p className="text-xs text-muted-foreground">Get notified before your subscriptions renew</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

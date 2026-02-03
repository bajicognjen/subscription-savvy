import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  onAdd: () => void;
}

export function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <Card className="border-dashed border-2 border-border">
      <CardContent className="py-12 flex flex-col items-center text-center">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No subscriptions yet</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Start tracking your subscriptions to see how much you're spending each month.
        </p>
        <Button onClick={onAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Your First Subscription
        </Button>
      </CardContent>
    </Card>
  );
}

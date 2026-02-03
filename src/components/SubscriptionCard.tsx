import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Subscription, CATEGORY_ICONS, BillingCycle } from '@/types/subscription';
import { CalendarDays, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, differenceInDays, isToday, isTomorrow } from 'date-fns';

interface SubscriptionCardProps {
  subscription: Subscription;
  monthlyEquivalent: number;
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
}

function formatBillingCycle(cycle: BillingCycle): string {
  switch (cycle) {
    case 'weekly':
      return '/week';
    case 'yearly':
      return '/year';
    case 'monthly':
    default:
      return '/month';
  }
}

function getRenewalLabel(date: Date): { label: string; urgent: boolean } {
  if (isToday(date)) {
    return { label: 'Renews today', urgent: true };
  }
  if (isTomorrow(date)) {
    return { label: 'Renews tomorrow', urgent: true };
  }
  
  const daysUntil = differenceInDays(date, new Date());
  
  if (daysUntil < 0) {
    return { label: `Overdue by ${Math.abs(daysUntil)} days`, urgent: true };
  }
  if (daysUntil <= 7) {
    return { label: `Renews in ${daysUntil} days`, urgent: true };
  }
  
  return { label: format(date, 'MMM d, yyyy'), urgent: false };
}

export function SubscriptionCard({
  subscription,
  monthlyEquivalent,
  onEdit,
  onDelete,
}: SubscriptionCardProps) {
  const renewalDate = new Date(subscription.renewalDate);
  const { label: renewalLabel, urgent } = getRenewalLabel(renewalDate);

  return (
    <Card className="group transition-all duration-200 hover:shadow-card animate-slide-up border-border/50 hover:border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center text-2xl shrink-0">
              {CATEGORY_ICONS[subscription.category]}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {subscription.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs font-normal">
                  {subscription.category}
                </Badge>
                {subscription.billingCycle !== 'monthly' && (
                  <span className="text-xs text-muted-foreground">
                    ≈ ${monthlyEquivalent.toFixed(2)}/mo
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-2 shrink-0">
            <div className="text-right">
              <p className="font-bold text-foreground">
                ${subscription.price.toFixed(2)}
                <span className="text-sm font-normal text-muted-foreground">
                  {formatBillingCycle(subscription.billingCycle)}
                </span>
              </p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(subscription)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(subscription.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2">
          <CalendarDays className={`h-4 w-4 ${urgent ? 'text-accent' : 'text-muted-foreground'}`} />
          <span className={`text-sm ${urgent ? 'text-accent font-medium' : 'text-muted-foreground'}`}>
            {renewalLabel}
          </span>
        </div>
        
        {subscription.notes && (
          <p className="mt-2 text-xs text-muted-foreground line-clamp-1">
            {subscription.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

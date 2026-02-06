import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Subscription, CATEGORY_ICONS, BillingCycle, CATEGORY_TAILWIND_COLORS, SubscriptionStatus } from '@/types/subscription';
import { CalendarDays, MoreHorizontal, Pencil, Trash2, Pause, Play, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, differenceInDays, isToday, isTomorrow } from 'date-fns';
import { useCurrency } from '@/hooks/useCurrency';

interface SubscriptionCardProps {
  subscription: Subscription;
  monthlyEquivalent: number;
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, status: SubscriptionStatus) => void;
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

function calculateAnnualCost(monthlyAmount: number, cycle: BillingCycle): number {
  switch (cycle) {
    case 'weekly':
      return monthlyAmount * 52;
    case 'yearly':
      return monthlyAmount;
    case 'monthly':
    default:
      return monthlyAmount * 12;
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'paused':
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    case 'cancelled':
      return 'bg-red-500/10 text-red-600 border-red-500/20';
    default:
      return 'bg-muted text-muted-foreground border-border';
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
    // For automatic payments, advance to next month instead of showing overdue
    const nextMonthDate = new Date(date);
    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
    return { label: `Renews ${format(nextMonthDate, 'MMM d, yyyy')}`, urgent: false };
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
  onStatusChange,
}: SubscriptionCardProps) {
  const renewalDate = new Date(subscription.renewalDate);
  const { label: renewalLabel, urgent } = getRenewalLabel(renewalDate);
  const { convert, getSymbol, formatAmount } = useCurrency();
  const categoryColor = CATEGORY_TAILWIND_COLORS[subscription.category];
  const daysUntilRenewal = differenceInDays(renewalDate, new Date());

  return (
    <Card className="group transition-all duration-200 hover:shadow-lg hover:border-primary/30 border-border/50">
      <CardContent className="p-4">
        {/* Header with Icon, Title, and Badges */}
        <div className="flex items-start gap-4 mb-4">
          <div className="h-14 w-14 rounded-xl bg-secondary flex items-center justify-center text-2xl shrink-0">
            {CATEGORY_ICONS[subscription.category]}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-base mb-2">
              {subscription.name}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge 
                variant="outline" 
                className={`text-xs font-normal border ${categoryColor.bg} ${categoryColor.text} ${categoryColor.border}`}
              >
                {subscription.category}
              </Badge>
              <Badge 
                variant="outline" 
                className={`text-xs font-normal border ${getStatusColor(subscription.status)}`}
              >
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </Badge>
              {daysUntilRenewal <= 7 && daysUntilRenewal >= 0 && (
                <Badge variant="secondary" className="text-xs font-normal bg-orange-500/10 text-orange-700 dark:text-orange-400">
                  🔔 Renews in {daysUntilRenewal}d
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Price Section */}
        <div className="mb-4 pb-4 border-b border-border/30">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Price</p>
              <p className="text-2xl font-bold text-foreground">
                {formatAmount(convert(subscription.price, 'USD'))}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatBillingCycle(subscription.billingCycle)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Annual Cost</p>
              <p className="text-lg font-semibold text-foreground">
                {formatAmount(convert(calculateAnnualCost(subscription.price, subscription.billingCycle), 'USD'))}
              </p>
            </div>
          </div>

          {subscription.priceOriginal && subscription.currency && (
            <p className="text-xs text-muted-foreground mt-3">
              <span className="font-medium">{subscription.currency}</span> {subscription.priceOriginal.toFixed(2)}
              <span className="mx-2">≈</span>
              {formatAmount(convert(subscription.priceOriginal, subscription.currency as any))}
            </p>
          )}
        </div>

        {/* Renewal Info */}
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays className={`h-4 w-4 ${urgent ? 'text-accent' : 'text-muted-foreground'}`} />
          <span className={`text-sm ${urgent ? 'text-accent font-medium' : 'text-muted-foreground'}`}>
            {renewalLabel}
          </span>
        </div>

        {subscription.notes && (
          <p className="mb-4 text-xs text-muted-foreground line-clamp-2">
            {subscription.notes}
          </p>
        )}

        {/* Quick Status Toggles */}
        <div className="flex gap-2 mb-3">
          {subscription.status !== 'active' && (
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 h-8 text-primary hover:text-primary/90 hover:bg-primary/10 transition-colors"
              onClick={() => onStatusChange?.(subscription.id, 'active')}
              title="Mark as active"
            >
              <Play className="h-3.5 w-3.5 mr-1" />
              Activate
            </Button>
          )}
          {subscription.status !== 'paused' && (
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 h-8 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-500/10 transition-colors"
              onClick={() => onStatusChange?.(subscription.id, 'paused')}
              title="Mark as paused"
            >
              <Pause className="h-3.5 w-3.5 mr-1" />
              Pause
            </Button>
          )}
          {subscription.status !== 'cancelled' && (
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 h-8 text-red-600 hover:text-red-700 hover:bg-red-500/10 transition-colors"
              onClick={() => onStatusChange?.(subscription.id, 'cancelled')}
              title="Mark as cancelled"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Cancel
            </Button>
          )}
        </div>

        {/* Edit and More Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="flex-1 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            onClick={() => onEdit(subscription)}
          >
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="px-3 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
      </CardContent>
    </Card>
  );
}

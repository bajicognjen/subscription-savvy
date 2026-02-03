import { useState } from 'react';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useAuth } from '@/hooks/useAuth';
import { Subscription } from '@/types/subscription';
import { MonthlyTotalCard } from '@/components/MonthlyTotalCard';
import { SubscriptionCard } from '@/components/SubscriptionCard';
import { CategoryChart } from '@/components/CategoryChart';
import { UpcomingRenewals } from '@/components/UpcomingRenewals';
import { SubscriptionDialog } from '@/components/SubscriptionDialog';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Plus, CreditCard, LogOut } from 'lucide-react';
import SessionInspector from '@/components/SessionInspector';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CurrencySelector } from '@/components/CurrencySelector';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const {
    subscriptions,
    isLoaded,
    isLoading,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    getMonthlyEquivalent,
    getTotalMonthlySpend,
    getUpcomingRenewals,
    getCategorySpending,
  } = useSubscriptions();

  const { signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  const handleAddClick = () => {
    setEditingSubscription(null);
    setDialogOpen(true);
  };

  const handleEditClick = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setDialogOpen(true);
  };

  const handleSave = async (data: Omit<Subscription, 'id' | 'createdAt'>) => {
    if (editingSubscription) {
      await updateSubscription(editingSubscription.id, data);
    } else {
      await addSubscription(data);
    }
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteSubscription(id);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
      toast({
        title: 'Success',
        description: 'You have been signed out',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign out',
        variant: 'destructive',
      });
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const monthlyTotal = getTotalMonthlySpend();
  const upcomingRenewals = getUpcomingRenewals(7);
  const categorySpending = getCategorySpending();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">SubTracker</h1>
          </div>
          <div className="flex items-center gap-2">
            <CurrencySelector />
            <Button onClick={handleAddClick} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Subscription</span>
            </Button>
            <ThemeToggle />
            <Button 
              onClick={handleSignOut} 
              size="sm" 
              variant="ghost"
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
            <div className="hidden sm:block">
              <SessionInspector />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6 space-y-6">
        {subscriptions.length === 0 ? (
          <EmptyState onAdd={handleAddClick} />
        ) : (
          <>
            {/* Monthly Total */}
            <MonthlyTotalCard
              total={monthlyTotal}
              subscriptionCount={subscriptions.length}
            />

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              <UpcomingRenewals subscriptions={upcomingRenewals} />
              <CategoryChart data={categorySpending} />
            </div>

            {/* Subscriptions List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">All Subscriptions</h2>
                <span className="text-sm text-muted-foreground">
                  {subscriptions.length} total
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {subscriptions
                  .sort((a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime())
                  .map((subscription) => (
                    <SubscriptionCard
                      key={subscription.id}
                      subscription={subscription}
                      monthlyEquivalent={getMonthlyEquivalent(subscription)}
                      onEdit={handleEditClick}
                      onDelete={handleDelete}
                    />
                  ))}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Add/Edit Dialog */}
      <SubscriptionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        subscription={editingSubscription}
        onSave={handleSave}
      />
    </div>
  );
};

export default Index;

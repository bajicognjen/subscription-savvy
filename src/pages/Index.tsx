import { useState, useMemo } from 'react';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useAuth } from '@/hooks/useAuth';
import { useSalaryAndSavings } from '@/hooks/useSalaryAndSavings';
import { Subscription } from '@/types/subscription';
import { MonthlyTotalCard } from '@/components/MonthlyTotalCard';
import { SubscriptionCard } from '@/components/SubscriptionCard';
import { CategoryChart } from '@/components/CategoryChart';
import { UpcomingRenewals } from '@/components/UpcomingRenewals';
import { SubscriptionDialog } from '@/components/SubscriptionDialog';
import { SavingsDashboard } from '@/components/SavingsDashboard';
import { SalarySettings } from '@/components/SalarySettings';
import { EmptyState } from '@/components/EmptyState';
import { SearchBar } from '@/components/SearchBar';
import { SubscriptionStats } from '@/components/SubscriptionStats';
import { QuickStatsCards } from '@/components/QuickStatsCards';
import { SkeletonCard } from '@/components/SkeletonCard';
import { SettingsPanel } from '@/components/SettingsPanel';
import { Button } from '@/components/ui/button';
import { Plus, CreditCard, LogOut, PiggyBank, BarChart3 } from 'lucide-react';
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
  const [monthlyBudget, setMonthlyBudget] = useState<number | undefined>(() => {
    const saved = localStorage.getItem('monthlyBudget');
    return saved ? parseFloat(saved) : undefined;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'cancelled'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'Streaming' | 'Software' | 'Fitness' | 'Gaming' | 'Other'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'renewal' | 'category' | 'status'>('name');
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'savings'>('subscriptions');
  const [salarySettingsOpen, setSalarySettingsOpen] = useState(false);

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

  const handleStatusChange = async (id: string, status: 'active' | 'paused' | 'cancelled') => {
    try {
      await updateSubscription(id, { status });
    } catch (error) {
      console.error('Error updating subscription status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update subscription status',
        variant: 'destructive',
      });
    }
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

  // Filter and sort subscriptions
  const filteredSubscriptions = useMemo(() => {
    let filtered = subscriptions.filter((sub) => {
      const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
      const matchesCategory = filterCategory === 'all' || sub.category === filterCategory;
      return matchesSearch && matchesStatus && matchesCategory;
    });

    // Sort
    switch (sortBy) {
      case 'price':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'renewal':
        filtered.sort((a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime());
        break;
      case 'category':
        filtered.sort((a, b) => a.category.localeCompare(b.category));
        break;
      case 'status':
        const statusOrder = { active: 0, paused: 1, cancelled: 2 };
        filtered.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
        break;
      default: // name
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [subscriptions, searchQuery, filterStatus, filterCategory, sortBy]);

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
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Wallet</h1>
              <p className="text-xs text-muted-foreground">Subscription Manager</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={handleAddClick} size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 font-medium">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add</span>
            </Button>
            <div className="flex items-center gap-1">
              <CurrencySelector />
              <ThemeToggle />
              <SettingsPanel monthlyBudget={monthlyBudget} onBudgetChange={setMonthlyBudget} />
            </div>
            <Button 
              onClick={handleSignOut} 
              size="sm" 
              variant="ghost"
              className="gap-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="container">
        <div className="flex border-b border-border/50">
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'subscriptions'
                ? 'text-foreground border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Subscriptions
          </button>
          <button
            onClick={() => setActiveTab('savings')}
            className={`px-4 py-2 font-medium text-sm transition-colors flex items-center gap-2 ${
              activeTab === 'savings'
                ? 'text-foreground border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <PiggyBank className="h-4 w-4" />
            Savings
          </button>
          <button
            onClick={() => navigate('/analytics')}
            className={`px-4 py-2 font-medium text-sm transition-colors flex items-center gap-2 ${
              window.location.pathname === '/analytics'
                ? 'text-foreground border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="container py-4 space-y-4">
        {activeTab === 'subscriptions' ? (
          subscriptions.length === 0 ? (
            <EmptyState onAdd={handleAddClick} />
          ) : (
            <>
              {/* Monthly Total */}
              <MonthlyTotalCard
                total={monthlyTotal}
                subscriptionCount={subscriptions.length}
                monthlyBudget={monthlyBudget}
              />

              {/* Quick Stats */}
              <QuickStatsCards subscriptions={subscriptions.filter((s) => s.status === 'active')} />

              {/* Stats Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                <UpcomingRenewals subscriptions={upcomingRenewals} />
                <CategoryChart data={categorySpending} />
              </div>

              {/* Search & Filters */}
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filterStatus={filterStatus}
                onFilterStatusChange={setFilterStatus as any}
                filterCategory={filterCategory}
                onFilterCategoryChange={setFilterCategory as any}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />

              {/* Subscription Stats */}
              <SubscriptionStats subscriptions={subscriptions} />

              {/* Subscriptions List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Subscriptions</h2>
                  <span className="text-sm text-muted-foreground">
                    {filteredSubscriptions.length} of {subscriptions.length}
                  </span>
                </div>
                {isLoading ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <SkeletonCard count={2} />
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {filteredSubscriptions.map((subscription) => (
                      <SubscriptionCard
                        key={subscription.id}
                        subscription={subscription}
                        monthlyEquivalent={getMonthlyEquivalent(subscription)}
                        onEdit={handleEditClick}
                        onDelete={handleDelete}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )
        ) : (
          <SavingsDashboard onOpenSettings={() => setSalarySettingsOpen(true)} />
        )}
      </main>

      {/* Add/Edit Dialog */}
      <SubscriptionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        subscription={editingSubscription}
        existingSubscriptions={subscriptions}
        onSave={handleSave}
      />

      {/* Salary Settings Dialog */}
      <SalarySettings
        open={salarySettingsOpen}
        onOpenChange={setSalarySettingsOpen}
      />
    </div>
  );
};

export default Index;

import React, { useState } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useCurrency } from '@/hooks/useCurrency';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  PieChart, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Calendar,
  Filter,
  RefreshCw,
  Download,
  Share2,
  Home,
  ArrowLeft
} from 'lucide-react';
import { SpendingTrendsChart } from '@/components/analytics/SpendingTrendsChart';
import { CategoryAnalysis } from '@/components/analytics/CategoryAnalysis';
import { BudgetForecastComponent } from '@/components/analytics/BudgetForecast';
import { TopSubscriptions } from '@/components/analytics/TopSubscriptions';
import { InsightsList } from '@/components/analytics/InsightsList';
import { AnalyticsFilters } from '@/components/analytics/AnalyticsFilters';

export default function Analytics() {
  const { analyticsData, budgetForecast, filters, setFilters, isLoading } = useAnalytics();
  const { formatAmount, convert } = useCurrency();
  const { subscriptions } = useSubscriptions();
  const { user } = useAuth();
  const navigate = useNavigate();
  type TabId = 'overview' | 'trends' | 'categories' | 'forecast';
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LineChart },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'categories', label: 'Categories', icon: PieChart },
    { id: 'forecast', label: 'Forecast', icon: Calendar },
  ];

  const handleRefresh = () => {
    // Trigger data refresh by updating filters (even if unchanged)
    setFilters({ ...filters });
  };

  const handleExport = () => {
    // Export analytics data to CSV
    const csvContent = [
      'Month,Total,Subscriptions,Streaming,Software,Fitness,Gaming,Other',
      ...analyticsData.trends.map(t => 
        `${t.month},${t.total},${t.subscriptions},${t.categories.Streaming},${t.categories.Software},${t.categories.Fitness},${t.categories.Gaming},${t.categories.Other}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    try {
      const shareData = {
        title: 'Subscription Analytics',
        text: `My subscription spending analytics: ${analyticsData.trends.length} months tracked, ${subscriptions.length} subscriptions managed.`,
        url: window.location.href,
      };
      await navigator.share(shareData);
    } catch (err) {
      console.log('Share failed:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Analytics</h1>
              <p className="text-xs text-muted-foreground">Subscription insights</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleRefresh} className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
              <RefreshCw className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleExport} className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            {navigator.share && (
              <Button variant="ghost" size="sm" onClick={handleShare} className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
                <Share2 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Share</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="container py-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
          
          <AnalyticsFilters filters={filters} onFiltersChange={setFilters} />
        </div>
      </nav>

      {/* Main Content */}
      <main className="container pb-4 space-y-4">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Subscriptions</p>
                      <p className="text-2xl font-bold">{subscriptions.length}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Monthly Average</p>
                      <p className="text-2xl font-bold">
                        {analyticsData.trends.length > 0 
                          ? formatAmount(convert(analyticsData.trends.reduce((sum, t) => sum + t.total, 0) / analyticsData.trends.length))
                          : formatAmount(convert(0))
                        }
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Budget Health</p>
                      <p className={`text-2xl font-bold ${budgetForecast.currentMonth.percentage > 100 ? 'text-red-600' : budgetForecast.currentMonth.percentage > 90 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {budgetForecast.currentMonth.percentage}%
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Next Month</p>
                      <p className="text-2xl font-bold">
                        {formatAmount(convert(budgetForecast.nextMonth.predicted))}
                      </p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Debug Info - Remove after fixing */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <h4 className="font-medium text-red-700 mb-2">Debug Info (Charts)</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Spending Trends:</p>
                  <p>Total across all months: {formatAmount(convert(analyticsData.trends.reduce((sum, t) => sum + t.total, 0)))}</p>
                  <p>Current month (Jan): {analyticsData.trends.find(t => t.month === '2024-01') ? formatAmount(convert(analyticsData.trends.find(t => t.month === '2024-01')!.total)) : 'N/A'}</p>
                  <p>Number of months: {analyticsData.trends.length}</p>
                </div>
                <div>
                  <p className="font-medium">Category Analysis:</p>
                  <p>Total across categories: {formatAmount(convert(analyticsData.categoryBreakdown.reduce((sum, c) => sum + c.amount, 0)))}</p>
                  <p>Number of categories: {analyticsData.categoryBreakdown.length}</p>
                  <p>Categories: {analyticsData.categoryBreakdown.map(c => c.category).join(', ')}</p>
                </div>
              </div>
            </div>

            {/* Insights */}
            <InsightsList insights={analyticsData.insights} />

            {/* Top Subscriptions */}
            <TopSubscriptions subscriptions={analyticsData.topSubscriptions} />
          </div>
        )}

        {activeTab === 'trends' && (
          <SpendingTrendsChart 
            data={analyticsData.trends} 
            budget={budgetForecast.currentMonth.budget}
          />
        )}

        {activeTab === 'categories' && (
          <CategoryAnalysis data={analyticsData.categoryBreakdown} />
        )}

        {activeTab === 'forecast' && (
          <BudgetForecastComponent data={budgetForecast} />
        )}
      </main>
    </div>
  );
}
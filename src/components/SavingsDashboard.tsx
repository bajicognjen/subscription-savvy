import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useSalaryAndSavings } from '@/hooks/useSalaryAndSavings';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/hooks/use-toast';
import { 
  PiggyBank, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Minus, 
  Calendar,
  Wallet,
  Settings,
  Trash2
} from 'lucide-react';
import { useState } from 'react';
import { SavingsResetDialog } from './SavingsResetDialog';

interface SavingsDashboardProps {
  onOpenSettings: () => void;
}

export function SavingsDashboard({ onOpenSettings }: SavingsDashboardProps) {
  const { 
    preferences, 
    savingsBalance, 
    transactions, 
    isLoading, 
    addSavingsTransaction, 
    calculateBudgetSummary,
    getSavingsStats 
  } = useSalaryAndSavings();
  
  const { formatAmount, convert } = useCurrency();
  const { toast } = useToast();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [description, setDescription] = useState('');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const budgetSummary = calculateBudgetSummary();
  const savingsStats = getSavingsStats();

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid positive amount',
        variant: 'destructive',
      });
      return;
    }

    await addSavingsTransaction(amount, 'deposit', description || 'Manual deposit');
    setDepositAmount('');
    setDescription('');
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid positive amount',
        variant: 'destructive',
      });
      return;
    }

    if (amount > savingsBalance) {
      toast({
        title: 'Insufficient funds',
        description: 'You cannot withdraw more than your current savings balance',
        variant: 'destructive',
      });
      return;
    }

    await addSavingsTransaction(amount, 'withdrawal', description || 'Manual withdrawal');
    setWithdrawAmount('');
    setDescription('');
  };

  if (!preferences?.monthly_salary) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <PiggyBank className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Set Up Savings</h3>
              <p className="text-sm text-muted-foreground">
                Configure your monthly salary and savings percentage to start tracking your budget
              </p>
            </div>
            <Button onClick={onOpenSettings} className="gap-2">
              <PiggyBank className="h-4 w-4" />
              Set Up Savings
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Monthly Salary</p>
                <p className="text-lg font-bold text-foreground">
                  {formatAmount(convert(budgetSummary.monthly_salary!, 'USD'))}
                </p>
              </div>
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Subscriptions</p>
                <p className="text-lg font-bold text-foreground">
                  {formatAmount(convert(budgetSummary.total_subscriptions, 'USD'))}
                </p>
              </div>
              <Wallet className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Savings (Auto)</p>
                <p className="text-lg font-bold text-foreground">
                  {formatAmount(convert(budgetSummary.savings_amount, 'USD'))}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {budgetSummary.savings_percentage}%
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Remaining Budget</p>
                <p className="text-lg font-bold text-foreground">
                  {formatAmount(convert(budgetSummary.remaining_budget, 'USD'))}
                </p>
              </div>
              <Badge variant="secondary" className="ml-2">
                {budgetSummary.remaining_budget >= 0 ? 'Good' : 'Over Budget'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Savings Progress */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5" />
              Savings Progress
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onOpenSettings}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={() => setResetDialogOpen(true)} className="text-destructive border-destructive/20 hover:bg-destructive/5">
                <Trash2 className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-foreground">
                {formatAmount(convert(savingsBalance, 'USD'))}
              </p>
              <p className="text-sm text-muted-foreground">Current Balance</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-green-500">
                +{formatAmount(convert(savingsStats.monthly_savings, 'USD'))}
              </p>
              <p className="text-sm text-muted-foreground">Monthly Savings</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monthly Savings Goal</span>
              <span className="font-medium">
                {formatAmount(convert(savingsStats.monthly_savings, 'USD'))}
              </span>
            </div>
            <Progress value={100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Manual Transactions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-500" />
              Add to Savings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deposit-amount">Amount</Label>
              <Input
                id="deposit-amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="100.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deposit-description">Description (optional)</Label>
              <Input
                id="deposit-description"
                placeholder="Bonus, gift, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleDeposit} 
              disabled={isLoading || !depositAmount}
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              Add to Savings
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Minus className="h-5 w-5 text-red-500" />
              Withdraw from Savings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="withdraw-amount">Amount</Label>
              <Input
                id="withdraw-amount"
                type="number"
                step="0.01"
                min="0"
                max={savingsBalance}
                placeholder="50.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="withdraw-description">Description (optional)</Label>
              <Input
                id="withdraw-description"
                placeholder="Emergency, purchase, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleWithdraw} 
              disabled={isLoading || !withdrawAmount || parseFloat(withdrawAmount) > savingsBalance}
              variant="outline"
              className="w-full gap-2"
            >
              <Minus className="h-4 w-4" />
              Withdraw
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Savings Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Deposits</p>
                <p className="text-lg font-bold text-green-500">
                  {formatAmount(convert(savingsStats.total_deposits, 'USD'))}
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Withdrawals</p>
                <p className="text-lg font-bold text-red-500">
                  {formatAmount(convert(savingsStats.total_withdrawals, 'USD'))}
                </p>
              </div>
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Net Growth</p>
                <p className="text-lg font-bold text-foreground">
                  {formatAmount(convert(savingsStats.current_balance, 'USD'))}
                </p>
              </div>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reset Dialog */}
      <SavingsResetDialog
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
      />
    </div>
  );
}

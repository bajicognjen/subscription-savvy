import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';

interface SettingsPanelProps {
  monthlyBudget?: number;
  onBudgetChange: (budget: number | undefined) => void;
}

export function SettingsPanel({ monthlyBudget, onBudgetChange }: SettingsPanelProps) {
  const [budgetInput, setBudgetInput] = useState<string>(monthlyBudget?.toString() || '');

  const handleSaveBudget = () => {
    if (budgetInput.trim() === '') {
      onBudgetChange(undefined);
      localStorage.removeItem('monthlyBudget');
    } else {
      const budget = parseFloat(budgetInput);
      if (!isNaN(budget) && budget > 0) {
        onBudgetChange(budget);
        localStorage.setItem('monthlyBudget', budget.toString());
      }
    }
  };

  const handleClearBudget = () => {
    setBudgetInput('');
    onBudgetChange(undefined);
    localStorage.removeItem('monthlyBudget');
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Settings">
          <Settings className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-96">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly Budget</CardTitle>
              <CardDescription>Set a monthly spending limit for all subscriptions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Budget Amount</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="e.g., 50.00"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    step="0.01"
                    min="0"
                    className="flex-1"
                  />
                </div>
              </div>

              {budgetInput && (
                <p className="text-xs text-muted-foreground">
                  Budget set to ${parseFloat(budgetInput || '0').toFixed(2)}/month
                </p>
              )}

              <div className="flex gap-2">
                <Button onClick={handleSaveBudget} className="flex-1">
                  Save Budget
                </Button>
                {monthlyBudget && (
                  <Button variant="outline" onClick={handleClearBudget} className="flex-1">
                    Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                OG Wallet Savvy v1.0
                <br />
                Track and optimize your subscriptions
              </p>
            </CardContent>
          </Card>
        </div>

        <SheetClose />
      </SheetContent>
    </Sheet>
  );
}

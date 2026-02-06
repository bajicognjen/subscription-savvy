import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSalaryAndSavings } from '@/hooks/useSalaryAndSavings';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/hooks/use-toast';
import { PiggyBank, DollarSign, Percent, Save } from 'lucide-react';

const salarySettingsSchema = z.object({
  monthly_salary: z.coerce.number().positive('Salary must be positive'),
  savings_percentage: z.coerce.number().min(0, 'Percentage must be at least 0').max(100, 'Percentage cannot exceed 100'),
});

type FormData = z.infer<typeof salarySettingsSchema>;

interface SalarySettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SalarySettings({ open, onOpenChange }: SalarySettingsProps) {
  const { preferences, updatePreferences, isLoading } = useSalaryAndSavings();
  const { formatAmount, convert } = useCurrency();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(salarySettingsSchema),
    defaultValues: {
      monthly_salary: 0,
      savings_percentage: 10,
    },
  });

  useEffect(() => {
    if (preferences) {
      form.reset({
        monthly_salary: preferences.monthly_salary || 0,
        savings_percentage: preferences.savings_percentage,
      });
    }
  }, [preferences, form]);

  const onSubmit = async (data: FormData) => {
    const result = await updatePreferences({
      monthly_salary: data.monthly_salary,
      savings_percentage: data.savings_percentage,
    });

    if (result) {
      toast({
        title: 'Success',
        description: 'Salary and savings settings updated successfully',
      });
      onOpenChange(false);
    }
  };

  const calculateBudgetBreakdown = (salary: number, percentage: number) => {
    const savings = salary * (percentage / 100);
    const remaining = salary - savings;
    return { savings, remaining };
  };

  const currentBreakdown = preferences ? 
    calculateBudgetBreakdown(preferences.monthly_salary || 0, preferences.savings_percentage) : 
    { savings: 0, remaining: 0 };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5" />
            Salary & Savings Settings
          </DialogTitle>
          <DialogDescription>
            Configure your monthly salary and automatic savings percentage
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="monthly_salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Monthly Salary
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="5000.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="savings_percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    Savings Percentage
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      placeholder="10.0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    This percentage of your salary will be automatically saved each month
                  </p>
                </FormItem>
              )}
            />

            {/* Budget Preview */}
            {form.watch('monthly_salary') > 0 && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-sm">Budget Preview</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Salary:</span>
                    <div className="font-medium">
                      {formatAmount(convert(form.watch('monthly_salary'), 'USD'))}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Savings ({form.watch('savings_percentage')}%):</span>
                    <div className="font-medium text-green-600">
                      {formatAmount(convert(form.watch('monthly_salary') * (form.watch('savings_percentage') / 100), 'USD'))}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Remaining for expenses:</span>
                    <div className="font-medium">
                      {formatAmount(convert(form.watch('monthly_salary') * (1 - form.watch('savings_percentage') / 100), 'USD'))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 gap-2" disabled={isLoading}>
                <Save className="h-4 w-4" />
                Save Settings
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
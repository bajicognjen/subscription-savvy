import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Subscription, CATEGORIES, Category, BillingCycle } from '@/types/subscription';
import { useCurrency, type Currency } from '@/hooks/useCurrency';
import { format } from 'date-fns';

const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.85,
  RSD: 99.1,
};

const subscriptionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  category: z.enum(['Streaming', 'Software', 'Fitness', 'Gaming', 'Other']),
  price: z.coerce.number().positive('Price must be positive'),
  priceCurrency: z.enum(['USD', 'EUR', 'RSD']),
  billingCycle: z.enum(['weekly', 'monthly', 'yearly']),
  renewalDate: z.string().min(1, 'Renewal date is required'),
  paymentMethod: z.string().optional(),
  notes: z.string().max(500).optional(),
});

type FormData = z.infer<typeof subscriptionSchema>;

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription?: Subscription | null;
  onSave: (data: Omit<Subscription, 'id' | 'createdAt'>) => void;
}

export function SubscriptionDialog({
  open,
  onOpenChange,
  subscription,
  onSave,
}: SubscriptionDialogProps) {
  const isEditing = !!subscription;
  const [inputCurrency, setInputCurrency] = useState<Currency>('USD');

  const form = useForm<FormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      name: '',
      category: 'Other',
      price: 0,
      priceCurrency: 'USD',
      billingCycle: 'monthly',
      renewalDate: format(new Date(), 'yyyy-MM-dd'),
      paymentMethod: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (subscription) {
      form.reset({
        name: subscription.name,
        category: subscription.category,
        price: subscription.price,
        priceCurrency: 'USD',
        billingCycle: subscription.billingCycle,
        renewalDate: subscription.renewalDate.split('T')[0],
        paymentMethod: subscription.paymentMethod || '',
        notes: subscription.notes || '',
      });
      setInputCurrency('USD');
    } else {
      form.reset({
        name: '',
        category: 'Other',
        price: 0,
        priceCurrency: 'USD',
        billingCycle: 'monthly',
        renewalDate: format(new Date(), 'yyyy-MM-dd'),
        paymentMethod: '',
        notes: '',
      });
      setInputCurrency('USD');
    }
  }, [subscription, form]);

  const convertToUSD = (amount: number, fromCurrency: Currency): number => {
    // Convert from any currency to USD
    return amount / EXCHANGE_RATES[fromCurrency];
  };

  const onSubmit = (data: FormData) => {
    // Convert price to USD based on selected input currency
    const priceInUSD = convertToUSD(data.price, inputCurrency);

    onSave({
      name: data.name,
      category: data.category as Category,
      price: priceInUSD,
      billingCycle: data.billingCycle as BillingCycle,
      renewalDate: data.renewalDate,
      paymentMethod: data.paymentMethod || undefined,
      notes: data.notes || undefined,
    });
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Subscription' : 'Add Subscription'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Netflix, Spotify, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="billingCycle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Cycle</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select cycle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="9.99"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Select value={inputCurrency} onValueChange={(value) => setInputCurrency(value as Currency)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="RSD">RSD (дин)</SelectItem>
                  </SelectContent>
                </Select>
                {inputCurrency !== 'USD' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    ≈ ${(form.watch('price') / EXCHANGE_RATES[inputCurrency]).toFixed(2)} USD
                  </p>
                )}
              </div>
              
              <FormField
                control={form.control}
                name="renewalDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Renewal</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Visa ending in 4242" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Family plan, includes..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {isEditing ? 'Save Changes' : 'Add Subscription'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

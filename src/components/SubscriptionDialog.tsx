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
import { Subscription, CATEGORIES, Category, BillingCycle, SubscriptionStatus } from '@/types/subscription';
import { type Currency, useCurrency } from '@/hooks/useCurrency';
import { format } from 'date-fns';

const subscriptionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  category: z.enum(['Streaming', 'Software', 'Fitness', 'Gaming', 'Other']),
  price: z.coerce.number().positive('Price must be positive'),
  priceCurrency: z.enum(['USD', 'EUR', 'RSD']).optional(),
  billingCycle: z.enum(['weekly', 'monthly', 'yearly']),
  renewalDate: z.string().min(1, 'Renewal date is required'),
  paymentMethod: z.string().optional(),
  notes: z.string().max(500).optional(),
  status: z.enum(['active', 'paused', 'cancelled']).default('active'),
});

type FormData = z.infer<typeof subscriptionSchema>;

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription?: Subscription | null;
  existingSubscriptions?: Subscription[];
  onSave: (data: Omit<Subscription, 'id' | 'createdAt'>) => void;
}

export function SubscriptionDialog({
  open,
  onOpenChange,
  subscription,
  existingSubscriptions = [],
  onSave,
}: SubscriptionDialogProps) {
  const isEditing = !!subscription;
  const [inputCurrency, setInputCurrency] = useState<Currency>('USD');
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const { formatAmount } = useCurrency();

  const form = useForm<FormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      name: '',
      category: 'Other',
      price: 0,
      billingCycle: 'monthly',
      renewalDate: format(new Date(), 'yyyy-MM-dd'),
      paymentMethod: '',
      notes: '',
      status: 'active',
    },
  });

  useEffect(() => {
    if (subscription) {
      form.reset({
        name: subscription.name,
        category: subscription.category,
        // show original price if present, otherwise show normalized USD price
        price: subscription.priceOriginal ?? subscription.price,
        priceCurrency: subscription.currency ?? 'USD',
        billingCycle: subscription.billingCycle,
        renewalDate: subscription.renewalDate.split('T')[0],
        paymentMethod: subscription.paymentMethod || '',
        notes: subscription.notes || '',
        status: subscription.status || 'active',
      });
      setInputCurrency(subscription.currency ?? 'USD');
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
        status: 'active',
      });
      setInputCurrency('USD');
    }
  }, [subscription, form]);

  // Exchange rates relative to USD (user-provided values)
  const EXCHANGE_RATES: Record<Currency, number> = {
    USD: 1,
    EUR: 0.85,
    RSD: 99.1,
  };

  const convertToUSD = (amount: number, from: Currency) => {
    // amount in `from` -> USD
    return amount / EXCHANGE_RATES[from];
  };

  const onSubmit = (data: FormData) => {
    // Check for duplicates (case-insensitive)
    const isDuplicate = existingSubscriptions.some(
      (sub) =>
        sub.name.toLowerCase() === data.name.toLowerCase() &&
        sub.id !== subscription?.id // allow editing same subscription
    );

    if (isDuplicate) {
      setDuplicateWarning(true);
      return;
    }

    const currency = (data as any).priceCurrency ?? inputCurrency ?? 'USD';
    const priceOriginal = Number(data.price);
    const priceInUSD = convertToUSD(priceOriginal, currency as Currency);

    onSave({
      name: data.name,
      category: data.category as Category,
      price: priceInUSD,
      // persist original
      priceOriginal: priceOriginal,
      currency: currency as Currency,
      billingCycle: data.billingCycle as BillingCycle,
      renewalDate: data.renewalDate,
      paymentMethod: data.paymentMethod || undefined,
      notes: data.notes || undefined,
      status: (data as any).status || 'active',
    } as any);
    onOpenChange(false);
    form.reset();
    setInputCurrency('USD');
    setDuplicateWarning(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Subscription' : 'Add Subscription'}
          </DialogTitle>
        </DialogHeader>
        
        {duplicateWarning && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 text-sm">
            <p className="text-destructive font-medium">
              ⚠️ A subscription with this name already exists
            </p>
            <p className="text-destructive/80 text-xs mt-1">
              Are you sure you want to add a duplicate?
            </p>
            <button
              className="text-destructive/60 hover:text-destructive text-xs underline mt-2"
              onClick={() => setDuplicateWarning(false)}
            >
              Dismiss &amp; continue anyway
            </button>
          </div>
        )}
        
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
              <div>
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

                <div className="mt-2">
                  <Select value={inputCurrency} onValueChange={(v) => setInputCurrency(v as Currency)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="RSD">RSD (дин)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {inputCurrency !== 'USD' && (
                  <p className="text-xs text-muted-foreground mt-2">
                    ≈ {formatAmount((Number(form.watch('price') || 0) / (inputCurrency === 'EUR' ? 0.85 : 99.1)), 'USD')}
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

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
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

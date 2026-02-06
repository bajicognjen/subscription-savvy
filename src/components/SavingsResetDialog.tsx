import { useState } from 'react';
import { supabase } from '@/supabase';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSalaryAndSavings } from '@/hooks/useSalaryAndSavings';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface SavingsResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SavingsResetDialog({ open, onOpenChange }: SavingsResetDialogProps) {
  const { fetchTransactions, fetchSavingsBalance, isLoading } = useSalaryAndSavings();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    if (!user) {
      console.error('No user found');
      return;
    }

    try {
      setIsResetting(true);
      console.log('Starting reset process for user:', user.id);

      // First, try to delete all savings transactions for the current user
      console.log('Attempting to delete savings transactions for user:', user.id);
      
      const { data: deleteData, error: deleteError } = await supabase
        .from('savings_transactions')
        .delete()
        .eq('user_id', user.id);

      console.log('Delete operation completed:', { deleteData, deleteError });

      if (deleteError) {
        console.error('Delete error:', deleteError);
        // If it's a table not found error, the table doesn't exist yet
        if (deleteError.code === '42P01' || deleteError.message.includes('relation "savings_transactions" does not exist')) {
          console.log('savings_transactions table does not exist yet');
          toast({
            title: 'Info',
            description: 'No savings data found to reset',
          });
        } else {
          throw deleteError;
        }
      } else {
        console.log('Successfully deleted transactions');
        toast({
          title: 'Success',
          description: 'Savings balance and transactions have been reset',
        });
      }

      // Refresh transactions and balance
      console.log('Refreshing transactions and balance...');
      fetchTransactions();
      fetchSavingsBalance();
      onOpenChange(false);
    } catch (error) {
      console.error('Error resetting savings:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset savings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Reset Savings
          </DialogTitle>
          <DialogDescription>
            This will permanently delete all savings transactions and reset your savings balance to zero. 
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium text-destructive">What will be deleted:</p>
          <ul className="text-sm text-destructive/80 space-y-1">
            <li>• All savings deposits and withdrawals</li>
            <li>• Current savings balance</li>
            <li>• Transaction history</li>
          </ul>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive"
            className="flex-1 gap-2"
            onClick={handleReset}
            disabled={isResetting || isLoading}
          >
            <Trash2 className="h-4 w-4" />
            {isResetting ? 'Resetting...' : 'Reset Savings'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { useCurrency, type Currency } from '@/hooks/useCurrency';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { RefreshCw, Loader2 } from 'lucide-react';

function timeAgo(ts?: number | null) {
  if (!ts) return 'unknown';
  const delta = Math.floor((Date.now() - ts) / 1000);
  if (delta < 60) return `${delta}s`;
  if (delta < 3600) return `${Math.floor(delta / 60)}m`;
  if (delta < 86400) return `${Math.floor(delta / 3600)}h`;
  return `${Math.floor(delta / 86400)}d`;
}

export function CurrencySelector() {
  const { currency, setCurrency, lastUpdated, refreshRates, rates, isRefreshing } = useCurrency();

  return (
    <div className="flex items-center gap-2">
      <Select value={currency} onValueChange={(value) => setCurrency(value as Currency)}>
        <SelectTrigger className="w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="USD">USD ($)</SelectItem>
          <SelectItem value="EUR">EUR (€)</SelectItem>
          <SelectItem value="RSD">RSD (дин)</SelectItem>
        </SelectContent>
      </Select>

      <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
        <span className="whitespace-nowrap">rates {timeAgo(lastUpdated)} ago</span>
        <span className="opacity-70">·</span>
        <span className="whitespace-nowrap">EUR {rates.EUR.toFixed(4)}</span>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => refreshRates()} 
            disabled={isRefreshing}
            aria-label="Refresh exchange rates"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1 text-xs">
            <p className="font-semibold">Exchange rates from exchangerate.host</p>
            <p className="text-muted-foreground">Falls back to default rates if API is unavailable</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

import React from 'react';
import type { AnalyticsFilters } from '@/types/analytics';
import { Category } from '@/types/subscription';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Filter, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface AnalyticsFiltersProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
}

export function AnalyticsFilters({ filters, onFiltersChange }: AnalyticsFiltersProps) {
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  const handleCategoryToggle = (category: Category) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleDateRangeChange = (dates: { start: Date; end: Date }) => {
    onFiltersChange({ ...filters, startDate: dates.start, endDate: dates.end });
  };

  const resetFilters = () => {
    onFiltersChange({
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(),
      categories: ['Streaming', 'Software', 'Fitness', 'Gaming', 'Other'],
      includeInactive: false,
    });
  };

  const categories: Category[] = ['Streaming', 'Software', 'Fitness', 'Gaming', 'Other'];

  return (
    <div className="flex items-center gap-4">
      {/* Date Range Filter */}
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <CalendarIcon className="h-4 w-4" />
            {format(filters.startDate, 'MMM d, yyyy')} - {format(filters.endDate, 'MMM d, yyyy')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="end">
          <Calendar
            mode="range"
            selected={{ from: filters.startDate, to: filters.endDate }}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                handleDateRangeChange({ start: range.from, end: range.to });
                setIsCalendarOpen(false);
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Categories Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Categories ({filters.categories.length})
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4" align="end">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filter Categories</h4>
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <RefreshCw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            </div>
            
            <div className="grid gap-2">
              {categories.map((category) => (
                <Label key={category} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={filters.categories.includes(category)}
                    onCheckedChange={() => handleCategoryToggle(category)}
                  />
                  <span className="text-sm">{category}</span>
                </Label>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={filters.includeInactive}
                onCheckedChange={(checked) => onFiltersChange({ ...filters, includeInactive: !!checked })}
              />
              <Label className="text-sm cursor-pointer">Include inactive subscriptions</Label>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={resetFilters}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
}
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { Category, SubscriptionStatus } from '@/types/subscription';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterStatus?: SubscriptionStatus | 'all';
  onFilterStatusChange: (status: SubscriptionStatus | 'all') => void;
  filterCategory?: Category | 'all';
  onFilterCategoryChange: (category: Category | 'all') => void;
  sortBy: 'name' | 'price' | 'renewal' | 'category' | 'status';
  onSortChange: (sort: 'name' | 'price' | 'renewal' | 'category' | 'status') => void;
}

export function SearchBar({
  searchQuery,
  onSearchChange,
  filterStatus = 'all',
  onFilterStatusChange,
  filterCategory = 'all',
  onFilterCategoryChange,
  sortBy,
  onSortChange,
}: SearchBarProps) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search subscriptions..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Select value={filterStatus} onValueChange={onFilterStatusChange as any}>
          <SelectTrigger className="text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={onFilterCategoryChange as any}>
          <SelectTrigger className="text-xs">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Streaming">Streaming</SelectItem>
            <SelectItem value="Software">Software</SelectItem>
            <SelectItem value="Fitness">Fitness</SelectItem>
            <SelectItem value="Gaming">Gaming</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={onSortChange as any}>
          <SelectTrigger className="text-xs">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Sort: Name</SelectItem>
            <SelectItem value="price">Sort: Price (Low→High)</SelectItem>
            <SelectItem value="renewal">Sort: Renewal Soon</SelectItem>
            <SelectItem value="category">Sort: Category</SelectItem>
            <SelectItem value="status">Sort: Status</SelectItem>
          </SelectContent>
        </Select>

        {(searchQuery || filterStatus !== 'all' || filterCategory !== 'all') && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onSearchChange('');
              onFilterStatusChange('all');
              onFilterCategoryChange('all');
            }}
            className="text-xs"
          >
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}

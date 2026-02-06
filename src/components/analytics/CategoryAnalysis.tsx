import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CategoryBreakdown } from '@/types/analytics';
import { useCurrency } from '@/hooks/useCurrency';
import { CATEGORY_COLORS } from '@/types/subscription';

interface CategoryAnalysisProps {
  data: CategoryBreakdown[];
  height?: number;
}

export function CategoryAnalysis({ data, height = 300 }: CategoryAnalysisProps) {
  const { formatAmount, convert } = useCurrency();

  // Prepare data for pie chart
  const chartData = data.map(item => ({
    name: item.category,
    value: convert(item.amount),
    percentage: item.percentage,
    subscriptions: item.subscriptions,
    color: CATEGORY_COLORS[item.category],
  }));

  // Calculate total for comparison
  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Spending by Category</h3>
        <p className="text-sm text-muted-foreground">
          Breakdown of your subscription spending across different categories
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pie Chart */}
        <div className="bg-card rounded-lg border border-border/50 p-4">
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${formatAmount(value)} (${name})`,
                  'Amount'
                ]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  boxShadow: 'var(--shadow-md)',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry) => {
                  const item = chartData.find(d => d.name === value);
                  return `${value} (${item?.percentage}%)`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed List */}
        <div className="space-y-3">
          <h4 className="font-medium">Category Details</h4>
          {chartData.map((item, index) => (
            <div
              key={item.name}
              className="flex items-center justify-between p-3 bg-card border border-border/50 rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.subscriptions} subscription{item.subscriptions !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatAmount(item.value)}</p>
                <p className="text-sm text-muted-foreground">{item.percentage}%</p>
              </div>
            </div>
          ))}

          {/* Total */}
          <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div>
              <p className="font-medium">Total Spending</p>
              <p className="text-sm text-muted-foreground">All categories combined</p>
            </div>
            <p className="text-lg font-bold text-primary">
              {formatAmount(convert(totalAmount))}
            </p>
          </div>
        </div>
      </div>

      {/* Insights */}
      {data.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <h4 className="font-medium text-green-700 dark:text-green-400">Most Cost-Effective</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {data[data.length - 1].category} has the lowest cost at {formatAmount(convert(data[data.length - 1].amount))}
            </p>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
            <h4 className="font-medium text-orange-700 dark:text-orange-400">Highest Spending</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {data[0].category} takes up {data[0].percentage}% of your budget
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="font-medium text-blue-700 dark:text-blue-400">Average per Category</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {formatAmount(convert(totalAmount / data.length))} per category
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
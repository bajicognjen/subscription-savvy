import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { SpendingTrend } from '@/types/analytics';
import { useCurrency } from '@/hooks/useCurrency';

interface SpendingTrendsChartProps {
  data: SpendingTrend[];
  budget?: number;
  height?: number;
}

export function SpendingTrendsChart({ data, budget, height = 300 }: SpendingTrendsChartProps) {
  const { formatAmount, convert } = useCurrency();

  // Prepare data for chart
  const chartData = data.map(trend => ({
    month: trend.month,
    displayMonth: new Date(trend.year, trend.monthNumber - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    total: convert(trend.total),
    subscriptions: trend.subscriptions,
  }));

  // Calculate trend direction
  const hasTrend = data.length >= 2;
  const trendDirection = hasTrend ? data[data.length - 1].total - data[0].total : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Monthly Spending Trends</h3>
          <p className="text-sm text-muted-foreground">
            Track your subscription spending over time
          </p>
        </div>
        {hasTrend && (
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Trend</p>
            <p className={`font-semibold ${trendDirection > 0 ? 'text-red-600' : trendDirection < 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
              {trendDirection > 0 ? '↑' : trendDirection < 0 ? '↓' : '→'} {formatAmount(Math.abs(trendDirection))}
            </p>
          </div>
        )}
      </div>

      <div className="bg-card rounded-lg border border-border/50 p-4">
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="displayMonth" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => formatAmount(value)}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-card border border-border/50 rounded-lg p-3 shadow-lg">
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-sm text-muted-foreground">
                        Spending: <span className="font-semibold">{formatAmount(payload[0].value as number)}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Subscriptions: <span className="font-semibold">{payload[0].payload.subscriptions}</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            
            {/* Budget line if available */}
            {budget && (
              <ReferenceLine 
                y={convert(budget)} 
                stroke="hsl(var(--primary))" 
                strokeDasharray="5 5"
                label={{
                  value: `Budget: ${formatAmount(convert(budget))}`,
                  position: 'insideTopRight',
                  fill: 'hsl(var(--primary))',
                  fontSize: 12,
                  fontWeight: 'bold'
                }}
              />
            )}
            
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
              name="Monthly Spending"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats */}
      {data.length > 0 && (
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Average Monthly</p>
            <p className="text-lg font-semibold">
              {formatAmount(convert(data.reduce((sum, d) => sum + d.total, 0) / data.length))}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Highest Month</p>
            <p className="text-lg font-semibold text-red-600">
              {formatAmount(convert(Math.max(...data.map(d => d.total))))}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Lowest Month</p>
            <p className="text-lg font-semibold text-green-600">
              {formatAmount(convert(Math.min(...data.map(d => d.total))))}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
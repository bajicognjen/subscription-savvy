import React from 'react';
import { AlertCircle, TrendingUp, TrendingDown, DollarSign, Calendar, Lightbulb, CheckCircle } from 'lucide-react';

interface InsightsListProps {
  insights: string[];
}

export function InsightsList({ insights }: InsightsListProps) {
  if (insights.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border/50 p-6">
        <h3 className="text-lg font-semibold mb-4">Insights</h3>
        <div className="text-center py-8 text-muted-foreground">
          <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No insights available yet</p>
          <p className="text-sm">Add subscriptions and track spending to see personalized insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Insights</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lightbulb className="h-4 w-4" />
          <span>AI-powered recommendations</span>
        </div>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => {
          // Determine icon and styling based on insight content
          let Icon = AlertCircle;
          let bgColor = 'bg-red-500/10';
          let borderColor = 'border-red-500/20';
          let textColor = 'text-red-700';
          let iconColor = 'text-red-600';

          if (insight.includes('increased')) {
            Icon = TrendingUp;
            bgColor = 'bg-red-500/10';
            borderColor = 'border-red-500/20';
            textColor = 'text-red-700';
            iconColor = 'text-red-600';
          } else if (insight.includes('decreased')) {
            Icon = TrendingDown;
            bgColor = 'bg-green-500/10';
            borderColor = 'border-green-500/20';
            textColor = 'text-green-700';
            iconColor = 'text-green-600';
          } else if (insight.includes('budget') || insight.includes('remaining') || insight.includes('over budget')) {
            Icon = DollarSign;
            bgColor = 'bg-yellow-500/10';
            borderColor = 'border-yellow-500/20';
            textColor = 'text-yellow-700';
            iconColor = 'text-yellow-600';
          } else if (insight.includes('renewal') || insight.includes('next month')) {
            Icon = Calendar;
            bgColor = 'bg-blue-500/10';
            borderColor = 'border-blue-500/20';
            textColor = 'text-blue-700';
            iconColor = 'text-blue-600';
          } else if (insight.includes('Keep') || insight.includes('Great job')) {
            Icon = CheckCircle;
            bgColor = 'bg-green-500/10';
            borderColor = 'border-green-500/20';
            textColor = 'text-green-700';
            iconColor = 'text-green-600';
          }

          return (
            <div
              key={index}
              className={`flex items-start gap-3 p-4 rounded-lg border ${bgColor} ${borderColor} hover:shadow-md transition-shadow`}
            >
              <div className={`h-8 w-8 rounded-full ${bgColor} ${iconColor} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${textColor} font-medium`}>{insight}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Suggestions */}
      <div className="mt-6 grid gap-3">
        <h4 className="font-medium text-sm text-muted-foreground">Recommended Actions</h4>
        
        {insights.some(i => i.includes('over budget')) && (
          <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-700">Review your subscriptions and consider canceling non-essential ones</span>
          </div>
        )}

        {insights.some(i => i.includes('renewal')) && (
          <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-blue-700">Set reminders for upcoming renewals to avoid unwanted charges</span>
          </div>
        )}

        {insights.some(i => i.includes('10') && i.includes('subscriptions')) && (
          <div className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <DollarSign className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-yellow-700">Consider consolidating or bundling subscriptions for better rates</span>
          </div>
        )}

        {!insights.some(i => i.includes('over budget') || i.includes('renewal') || (i.includes('10') && i.includes('subscriptions'))) && (
          <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-green-700">Great job managing your subscriptions! Keep tracking your spending.</span>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-lg">
        <h4 className="font-medium text-indigo-700 dark:text-indigo-400 mb-2">💡 Pro Tips</h4>
        <div className="grid gap-2 text-sm text-indigo-600 dark:text-indigo-300">
          <p>• Review subscriptions quarterly to ensure they still provide value</p>
          <p>• Consider annual billing for discounts on essential services</p>
          <p>• Use price comparison tools before subscribing to new services</p>
          <p>• Set up alerts for price increases on your subscriptions</p>
        </div>
      </div>
    </div>
  );
}
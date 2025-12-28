'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Metric {
  label: string;
  value: string;
  change?: number;
  unit?: string;
}

const metrics: Metric[] = [
  { label: 'Active Skills', value: '4', change: 1 },
  { label: 'Context Used', value: '67', unit: '%', change: -5 },
  { label: 'Avg. Latency', value: '1.2', unit: 's', change: 0 },
  { label: 'Sessions Today', value: '23', change: 8 },
];

export function MetricsPanel() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {metrics.map((metric) => (
        <div key={metric.label} className="metric-card">
          <div className="flex items-end gap-1">
            <span className="metric-value">{metric.value}</span>
            {metric.unit && (
              <span className="text-sm text-ink-muted mb-1">{metric.unit}</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="metric-label">{metric.label}</span>
            {metric.change !== undefined && (
              <div className={cn(
                'flex items-center gap-0.5 text-2xs',
                metric.change > 0 && 'text-status-success',
                metric.change < 0 && 'text-status-error',
                metric.change === 0 && 'text-ink-faint'
              )}>
                {metric.change > 0 && <TrendingUp className="w-3 h-3" />}
                {metric.change < 0 && <TrendingDown className="w-3 h-3" />}
                {metric.change === 0 && <Minus className="w-3 h-3" />}
                <span>{Math.abs(metric.change)}%</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}




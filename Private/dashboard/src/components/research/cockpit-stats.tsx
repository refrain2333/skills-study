'use client';

import { Evaluation, QueueItem } from '@/lib/research-types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Zap,
  TrendingUp
} from 'lucide-react';

interface CockpitStatsProps {
  evaluations: Evaluation[];
  queue: QueueItem[];
}

function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  trend,
  trendUp 
}: { 
  label: string; 
  value: number | string; 
  icon: React.ElementType; 
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <div className="bg-surface-raised border border-stroke-subtle rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-semibold text-ink-primary">{value}</span>
            {trend && (
              <span className={`text-xs font-medium mb-1 flex items-center gap-0.5 ${
                trendUp ? 'text-green-600' : trendUp === false ? 'text-red-500' : 'text-ink-faint'
              }`}>
                {trendUp && '↑'}
                {trendUp === false && '↓'}
                {trend}
              </span>
            )}
          </div>
          <span className="text-xs text-ink-muted">{label}</span>
        </div>
        <div className="w-10 h-10 rounded-lg bg-surface-sunken flex items-center justify-center">
          <Icon className="w-5 h-5 text-ink-muted" />
        </div>
      </div>
    </div>
  );
}

export function CockpitStats({ evaluations, queue }: CockpitStatsProps) {
  const approved = evaluations.filter(e => e.decision.verdict === 'APPROVE').length;
  const review = evaluations.filter(e => e.decision.verdict === 'HUMAN_REVIEW').length;
  const rejected = evaluations.filter(e => e.decision.verdict === 'REJECT').length;
  const processing = queue.filter(q => q.status !== 'completed' && q.status !== 'failed').length;

  const avgScore = evaluations
    .filter(e => e.scoring)
    .reduce((sum, e) => sum + (e.scoring?.weighted_total || 0), 0) / 
    Math.max(evaluations.filter(e => e.scoring).length, 1);

  const avgTime = evaluations.reduce((sum, e) => sum + e.processing_time_ms, 0) / 
    Math.max(evaluations.length, 1);

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard 
        label="Approved" 
        value={approved} 
        icon={CheckCircle2}
        trend="1%"
        trendUp={true}
      />
      <StatCard 
        label="Needs Review" 
        value={review} 
        icon={AlertTriangle}
      />
      <StatCard 
        label="Avg Score" 
        value={avgScore.toFixed(2)} 
        icon={TrendingUp}
        trend="5%"
        trendUp={true}
      />
      <StatCard 
        label="Avg Time" 
        value={`${(avgTime / 1000).toFixed(1)}s`} 
        icon={Zap}
        trend="8%"
        trendUp={false}
      />
    </div>
  );
}

'use client';

import { Evaluation, QueueItem } from '@/lib/research-types';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  FileSearch,
  Loader2,
  Plus
} from 'lucide-react';

interface ActivityFeedProps {
  evaluations: Evaluation[];
  queue: QueueItem[];
}

type ActivityItem = {
  id: string;
  type: 'queued' | 'processing' | 'approved' | 'review' | 'rejected';
  title: string;
  timestamp: string;
  detail?: string;
};

export function ActivityFeed({ evaluations, queue }: ActivityFeedProps) {
  const activities: ActivityItem[] = [
    ...queue.map(q => ({
      id: `q-${q.id}`,
      type: (q.status === 'queued' ? 'queued' : 'processing') as ActivityItem['type'],
      title: q.source.title || q.source.url,
      timestamp: q.started_at || q.source.added_at,
      detail: q.status === 'evaluating' ? 'Running LLM-as-Judge...' : undefined,
    })),
    ...evaluations.map(e => ({
      id: `e-${e.evaluation_id}`,
      type: e.decision.verdict === 'APPROVE' 
        ? 'approved' 
        : e.decision.verdict === 'HUMAN_REVIEW' 
        ? 'review' 
        : 'rejected' as ActivityItem['type'],
      title: e.source.title,
      timestamp: e.timestamp,
      detail: e.skill_extraction?.skill_name,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
   .slice(0, 10);

  const icons = {
    queued: Clock,
    processing: Loader2,
    approved: CheckCircle2,
    review: AlertTriangle,
    rejected: XCircle,
  };

  const colors = {
    queued: 'text-ink-muted',
    processing: 'text-blue-600',
    approved: 'text-green-600',
    review: 'text-amber-600',
    rejected: 'text-red-500',
  };

  const bgColors = {
    queued: 'bg-surface-sunken',
    processing: 'bg-blue-50',
    approved: 'bg-green-50',
    review: 'bg-amber-50',
    rejected: 'bg-red-50',
  };

  const labels = {
    queued: 'Queued',
    processing: 'Processing',
    approved: 'Approved',
    review: 'Needs Review',
    rejected: 'Rejected',
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  return (
    <div className="bg-surface-raised border border-stroke-subtle rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
          Activity
        </span>
        <button className="text-xs text-accent-primary hover:underline">
          View all
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-6 text-ink-faint text-sm">
          No activity yet
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => {
            const Icon = icons[activity.type];
            const isProcessing = activity.type === 'processing';

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3"
              >
                <div className={`w-8 h-8 rounded-lg ${bgColors[activity.type]} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${colors[activity.type]} ${
                    isProcessing ? 'animate-spin' : ''
                  }`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${colors[activity.type]}`}>
                      {labels[activity.type]}
                    </span>
                    <span className="text-xs text-ink-faint">
                      {timeAgo(activity.timestamp)} ago
                    </span>
                  </div>
                  <p className="text-sm text-ink-secondary truncate">
                    {activity.title}
                  </p>
                  {activity.detail && (
                    <p className="text-xs text-ink-muted flex items-center gap-1 mt-0.5">
                      {activity.type === 'approved' && (
                        <Plus className="w-3 h-3 text-green-600" />
                      )}
                      {activity.detail}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

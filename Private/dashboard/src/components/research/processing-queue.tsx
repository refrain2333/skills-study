'use client';

import { QueueItem, ProcessingStatus } from '@/lib/research-types';
import { Loader2, CheckCircle2, XCircle, Clock, Globe, AlertCircle } from 'lucide-react';

interface ProcessingQueueProps {
  items: QueueItem[];
  onRetry?: (id: string) => void;
  onRemove?: (id: string) => void;
}

function StatusIcon({ status }: { status: ProcessingStatus }) {
  switch (status) {
    case 'queued':
      return <Clock className="w-4 h-4 text-ink-muted" />;
    case 'fetching':
      return <Globe className="w-4 h-4 text-blue-500 animate-pulse" />;
    case 'evaluating':
      return <Loader2 className="w-4 h-4 text-accent-primary animate-spin" />;
    case 'completed':
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    case 'failed':
      return <XCircle className="w-4 h-4 text-red-500" />;
  }
}

function StatusLabel({ status }: { status: ProcessingStatus }) {
  const labels: Record<ProcessingStatus, string> = {
    queued: 'Queued',
    fetching: 'Fetching',
    evaluating: 'Evaluating',
    completed: 'Done',
    failed: 'Failed',
  };

  const colors: Record<ProcessingStatus, string> = {
    queued: 'text-ink-muted',
    fetching: 'text-blue-600',
    evaluating: 'text-accent-primary',
    completed: 'text-green-600',
    failed: 'text-red-600',
  };

  return (
    <span className={`text-xs font-medium ${colors[status]}`}>
      {labels[status]}
    </span>
  );
}

export function ProcessingQueue({ items, onRetry, onRemove }: ProcessingQueueProps) {
  const activeItems = items.filter(i => i.status !== 'completed');
  
  if (activeItems.length === 0) {
    return (
      <div className="bg-surface-raised border border-stroke-subtle rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Processing Queue
          </span>
          <span className="text-xs text-ink-faint">0</span>
        </div>
        <div className="text-center py-6 text-ink-faint text-sm">
          No items in queue
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-raised border border-stroke-subtle rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
          Processing Queue
        </span>
        <span className="px-1.5 py-0.5 bg-accent-subtle text-accent-primary text-xs font-medium rounded">
          {activeItems.length}
        </span>
      </div>

      <div className="space-y-2">
        {activeItems.map((item) => (
          <div
            key={item.id}
            className="bg-surface-sunken border border-stroke-subtle rounded-lg p-3"
          >
            <div className="flex items-start gap-3">
              <StatusIcon status={item.status} />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-ink-primary truncate">
                    {item.source.title || 'Fetching title...'}
                  </span>
                  <StatusLabel status={item.status} />
                </div>
                
                <div className="text-xs text-ink-faint truncate mt-0.5">
                  {item.source.url}
                </div>

                {/* Progress Bar */}
                {(item.status === 'fetching' || item.status === 'evaluating') && (
                  <div className="mt-2">
                    <div className="progress-bar">
                      <div
                        className="progress-fill bg-accent-primary"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-ink-faint">
                        {item.status === 'fetching' ? 'Fetching content...' : 'Running evaluation...'}
                      </span>
                      <span className="text-xs text-ink-muted">
                        {item.progress}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {item.status === 'failed' && item.error && (
                  <div className="mt-2 flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                    <span className="text-xs text-red-600">{item.error}</span>
                    {onRetry && (
                      <button
                        onClick={() => onRetry(item.id)}
                        className="text-xs text-accent-primary hover:underline"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                )}
              </div>

              {onRemove && (
                <button
                  onClick={() => onRemove(item.id)}
                  className="text-ink-faint hover:text-red-500 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

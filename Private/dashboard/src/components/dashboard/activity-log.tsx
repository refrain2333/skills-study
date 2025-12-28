'use client';

import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle, Info, Zap } from 'lucide-react';

interface LogEntry {
  id: string;
  time: string;
  type: 'success' | 'error' | 'info' | 'action';
  message: string;
  skill?: string;
}

const recentLogs: LogEntry[] = [
  { id: '1', time: '12:34', type: 'success', message: 'Skill activated', skill: 'context-fundamentals' },
  { id: '2', time: '12:32', type: 'action', message: 'Context compaction triggered' },
  { id: '3', time: '12:28', type: 'info', message: 'Session started with 4 active skills' },
  { id: '4', time: '12:15', type: 'success', message: 'Skill deactivated', skill: 'evaluation' },
  { id: '5', time: '11:58', type: 'error', message: 'Context limit reached, oldest skill paused' },
  { id: '6', time: '11:45', type: 'info', message: 'New skill available: project-development' },
];

const typeIcons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  action: Zap,
};

const typeColors = {
  success: 'text-status-success',
  error: 'text-status-error',
  info: 'text-status-info',
  action: 'text-accent-primary',
};

export function ActivityLog() {
  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <span className="panel-title">Activity</span>
        <button className="text-xs text-accent-primary hover:underline">
          View all
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-stroke-subtle">
          {recentLogs.map((log) => {
            const Icon = typeIcons[log.type];
            
            return (
              <div key={log.id} className="log-item px-4">
                <span className="log-time">{log.time}</span>
                <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', typeColors[log.type])} />
                <div className="log-message">
                  {log.message}
                  {log.skill && (
                    <span className="ml-1 font-mono text-xs text-ink-muted">
                      {log.skill}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}




'use client';

import { Search, Bell, HelpCircle, Command } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="h-14 px-6 flex items-center justify-between border-b border-stroke-subtle bg-surface-raised">
      <div>
        <h1 className="text-lg font-semibold text-ink-primary">{title}</h1>
        {subtitle && (
          <p className="text-xs text-ink-muted">{subtitle}</p>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
          <input
            type="text"
            placeholder="Search skills..."
            className="w-64 h-9 pl-9 pr-12 text-sm bg-surface-sunken border border-stroke-subtle rounded-lg
                       placeholder:text-ink-faint text-ink-primary
                       focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/20"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-ink-faint">
            <Command className="w-3 h-3" />
            <span className="text-xs">K</span>
          </div>
        </div>
        
        {/* Actions */}
        <button className="btn-icon">
          <HelpCircle className="w-4 h-4" />
        </button>
        <button className="btn-icon relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-primary rounded-full" />
        </button>
      </div>
    </header>
  );
}




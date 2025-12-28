'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  Layers, 
  Settings, 
  BarChart3, 
  Terminal,
  BookOpen,
  ChevronRight,
  Radar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { icon: Layers, label: 'Skills', href: '/', badge: '10' },
  { icon: Radar, label: 'Research', href: '/research', badge: 'NEW' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
  { icon: Terminal, label: 'Logs', href: '/logs' },
  { icon: BookOpen, label: 'Docs', href: '/docs' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };
  
  return (
    <aside className="w-48 h-screen bg-surface-raised border-r border-stroke-subtle flex flex-col sticky top-0">
      {/* Logo */}
      <div className="h-14 px-3 flex items-center border-b border-stroke-subtle">
        <Link href="/">
          <Image 
            src="/butterpath_logo.png" 
            alt="Butterpath" 
            width={140} 
            height={40}
            className="object-contain"
          />
        </Link>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors',
                active 
                  ? 'bg-accent-subtle text-accent-primary font-medium' 
                  : 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded',
                  active ? 'bg-accent-primary/10' : 'bg-surface-sunken'
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      
      {/* Context Budget Summary */}
      <div className="p-2 border-t border-stroke-subtle">
        <div className="p-2 rounded-lg bg-surface-sunken">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-ink-muted">Context</span>
            <span className="text-xs font-mono text-ink-secondary">67%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill bg-accent-primary" 
              style={{ width: '67%' }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-2xs text-ink-faint">
            <span>~54k</span>
            <span>80k</span>
          </div>
        </div>
      </div>
      
      {/* User */}
      <div className="p-2 border-t border-stroke-subtle">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-accent-primary">M</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-ink-primary truncate">Muratcan</div>
            <div className="text-xs text-ink-faint">Pro</div>
          </div>
          <ChevronRight className="w-4 h-4 text-ink-faint" />
        </div>
      </div>
    </aside>
  );
}

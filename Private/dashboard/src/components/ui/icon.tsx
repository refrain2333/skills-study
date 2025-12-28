'use client';

import {
  Search,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  BookOpen,
  Code,
  Layers,
  Settings,
  Zap,
  GitBranch,
  FileText,
  Clock,
  User,
  Tag,
  ArrowLeft,
  Menu,
  X,
  Github,
  Star,
  Copy,
  Check,
  Terminal,
  Brain,
  Network,
  Database,
  type LucideIcon,
} from 'lucide-react';

// Re-export commonly used icons
export {
  Search,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  BookOpen,
  Code,
  Layers,
  Settings,
  Zap,
  GitBranch,
  FileText,
  Clock,
  User,
  Tag,
  ArrowLeft,
  Menu,
  X,
  Github,
  Star,
  Copy,
  Check,
  Terminal,
  Brain,
  Network,
  Database,
};

// Icon component with consistent sizing
interface IconProps {
  icon: LucideIcon;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
};

export function Icon({ icon: IconComponent, size = 'md', className }: IconProps) {
  return <IconComponent size={sizeMap[size]} className={className} />;
}



'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Github, Star } from '@/components/ui/icon';

export function Header() {
  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image 
              src="/butterpath_logo.png" 
              alt="Butterpath" 
              width={36} 
              height={36}
              className="rounded-lg"
            />
            <div className="flex flex-col">
              <span className="font-serif font-medium text-foreground text-lg leading-tight">
                Agent Skills
              </span>
              <span className="text-2xs text-foreground-subtle leading-tight">
                Context Engineering
              </span>
            </div>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/skills" 
              className="text-sm text-foreground-muted hover:text-foreground transition-colors"
            >
              Skills
            </Link>
            <Link 
              href="/examples" 
              className="text-sm text-foreground-muted hover:text-foreground transition-colors"
            >
              Examples
            </Link>
            <Link 
              href="/docs" 
              className="text-sm text-foreground-muted hover:text-foreground transition-colors"
            >
              Docs
            </Link>
          </nav>
          
          {/* Actions */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-background-tertiary border border-border text-sm text-foreground-muted hover:text-foreground hover:border-border-hover transition-all"
            >
              <Github className="w-4 h-4" />
              <span>3.5k</span>
              <Star className="w-3.5 h-3.5 text-accent" />
            </a>
            <a
              href="https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary text-xs"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}


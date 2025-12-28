import Link from 'next/link';
import { Github, Terminal } from '@/components/ui/icon';

export function Footer() {
  return (
    <footer className="border-t border-border bg-background-secondary/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
                <Terminal className="w-4 h-4 text-accent" />
              </div>
              <span className="font-serif font-medium text-foreground">
                Agent Skills
              </span>
            </div>
            <p className="text-sm text-foreground-subtle max-w-md">
              A comprehensive collection of Agent Skills for context engineering, 
              multi-agent architectures, and production agent systems.
            </p>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="font-medium text-foreground mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/skills" className="text-sm text-foreground-subtle hover:text-foreground transition-colors">
                  All Skills
                </Link>
              </li>
              <li>
                <Link href="/examples" className="text-sm text-foreground-subtle hover:text-foreground transition-colors">
                  Examples
                </Link>
              </li>
              <li>
                <a 
                  href="https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering/blob/main/CONTRIBUTING.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-foreground-subtle hover:text-foreground transition-colors"
                >
                  Contributing
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-foreground mb-4">Connect</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-foreground-subtle hover:text-foreground transition-colors"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              </li>
              <li>
                <a 
                  href="https://x.com/koylanai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-foreground-subtle hover:text-foreground transition-colors"
                >
                  @koylanai
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-foreground-subtle">
            MIT License. Built for the agent development community.
          </p>
          <p className="text-xs text-foreground-subtle">
            <a href="https://github.com/sponsors/muratcankoylan" className="text-accent hover:text-accent-hover">
              Sponsor this project
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}




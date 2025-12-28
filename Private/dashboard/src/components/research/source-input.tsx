'use client';

import { useState } from 'react';
import { Link2, FileText, Upload, Plus, Loader2 } from 'lucide-react';

interface SourceInputProps {
  onSubmit: (url: string) => void;
  isProcessing?: boolean;
}

export function SourceInput({ onSubmit, isProcessing }: SourceInputProps) {
  const [url, setUrl] = useState('');
  const [inputType, setInputType] = useState<'url' | 'paste' | 'upload'>('url');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && !isProcessing) {
      onSubmit(url.trim());
      setUrl('');
    }
  };

  return (
    <div className="bg-surface-raised border border-stroke-subtle rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
          Add Source
        </span>
      </div>

      {/* Input Type Tabs */}
      <div className="flex gap-1 mb-3 p-1 bg-surface-sunken rounded-lg">
        <button
          onClick={() => setInputType('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            inputType === 'url'
              ? 'bg-surface-raised text-ink-primary shadow-sm'
              : 'text-ink-muted hover:text-ink-primary'
          }`}
        >
          <Link2 className="w-3 h-3" />
          URL
        </button>
        <button
          onClick={() => setInputType('paste')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            inputType === 'paste'
              ? 'bg-surface-raised text-ink-primary shadow-sm'
              : 'text-ink-muted hover:text-ink-primary'
          }`}
        >
          <FileText className="w-3 h-3" />
          Paste
        </button>
        <button
          onClick={() => setInputType('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            inputType === 'upload'
              ? 'bg-surface-raised text-ink-primary shadow-sm'
              : 'text-ink-muted hover:text-ink-primary'
          }`}
        >
          <Upload className="w-3 h-3" />
          Upload
        </button>
      </div>

      {/* URL Input */}
      {inputType === 'url' && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://arxiv.org/abs/..."
            className="flex-1 bg-surface-sunken border border-stroke-subtle rounded-lg px-3 py-2 text-sm text-ink-primary placeholder-ink-faint focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/20"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={!url.trim() || isProcessing}
            className="flex items-center gap-2 px-4 py-2 bg-accent-primary hover:bg-accent-hover disabled:bg-surface-sunken disabled:text-ink-faint text-white text-sm font-medium rounded-lg transition-colors"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Queue
          </button>
        </form>
      )}

      {/* Paste Input */}
      {inputType === 'paste' && (
        <div className="space-y-2">
          <textarea
            placeholder="Paste article content, markdown, or research paper text..."
            className="w-full h-32 bg-surface-sunken border border-stroke-subtle rounded-lg px-3 py-2 text-sm text-ink-primary placeholder-ink-faint focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/20 resize-none"
            disabled={isProcessing}
          />
          <button
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 bg-accent-primary hover:bg-accent-hover disabled:bg-surface-sunken disabled:text-ink-faint text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Evaluate Content
          </button>
        </div>
      )}

      {/* Upload Input */}
      {inputType === 'upload' && (
        <div className="border-2 border-dashed border-stroke-subtle rounded-lg p-6 text-center hover:border-accent-primary/50 transition-colors cursor-pointer">
          <Upload className="w-8 h-8 text-ink-faint mx-auto mb-2" />
          <p className="text-sm text-ink-muted">
            Drop PDF, Markdown, or text files
          </p>
          <p className="text-xs text-ink-faint mt-1">
            or click to browse
          </p>
        </div>
      )}

      {/* Quick Add Suggestions */}
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="text-ink-faint">Quick add:</span>
        {[
          'arxiv.org',
          'anthropic.com/research',
          'openai.com/research',
        ].map((domain) => (
          <button
            key={domain}
            onClick={() => setUrl(`https://${domain}/`)}
            className="text-ink-muted hover:text-accent-primary transition-colors"
          >
            {domain}
          </button>
        ))}
      </div>
    </div>
  );
}

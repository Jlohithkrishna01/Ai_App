import React from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import { Source } from '../../types';

interface SourceCardProps {
  source: Source;
}

export const SourceCard: React.FC<SourceCardProps> = ({ source }) => {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col justify-between p-3.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50/80 dark:bg-dark-card hover:bg-white dark:hover:bg-dark-cardHover hover:border-primary-400 dark:hover:border-primary-500/50 transition-all duration-200 shadow-sm hover:shadow-md text-left"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 truncate">
            <Globe className="w-3.5 h-3.5 shrink-0 text-accent-500" />
            <span className="truncate">{source.source_name || 'Web Source'}</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary-500 shrink-0 transition-colors" />
        </div>
        <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors leading-snug">
          {source.title}
        </h4>
      </div>

      {source.snippet && (
        <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
          {source.snippet}
        </p>
      )}
    </a>
  );
};

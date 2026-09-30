import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Copy,
  Check,
  RotateCw,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Globe,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Message, Source } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { CodeBlock } from './CodeBlock';
import { SourceCard } from './SourceCard';

interface MessageItemProps {
  message: Message;
  isLastAssistant?: boolean;
  onRegenerate?: () => void;
  showTimestamp?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isLastAssistant = false,
  onRegenerate,
  showTimestamp = true,
}) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'liked' | 'disliked' | null>(null);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div
      className={`group w-full py-4 sm:py-6 px-4 sm:px-6 transition-colors ${
        isUser
          ? 'bg-transparent'
          : 'bg-gray-50/60 dark:bg-dark-surface/40 border-y border-gray-100 dark:border-dark-border/40'
      }`}
    >
      <div className="max-w-4xl mx-auto flex gap-4 sm:gap-5">
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          {isUser ? (
            <Avatar
              src={user?.profile_image}
              name={user?.name || 'User'}
              size="md"
              className="ring-2 ring-primary-500/20"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-600 via-secondary-500 to-accent-500 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        {/* Message Content Container */}
        <div className="flex-1 min-w-0">
          {/* Header with Sender Name & Timestamp */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white">
              {isUser ? user?.name || 'You' : 'LUMIQ AI'}
            </span>
            {showTimestamp && (
              <span className="text-[11px] text-gray-400 dark:text-gray-500">
                {formatTime(message.created_at)}
              </span>
            )}
          </div>

          {/* User Attached File Preview */}
          {isUser && message.file_name && (
            <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-100 dark:bg-dark-card text-xs text-gray-800 dark:text-gray-200">
              <FileText className="w-4 h-4 text-primary-500" />
              <span className="font-medium truncate max-w-[280px]">{message.file_name}</span>
            </div>
          )}

          {/* Sources Section (If AI answer has web search sources) */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                <Globe className="w-3.5 h-3.5 text-accent-500" />
                <span>Sources ({message.sources.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {message.sources.map((src, idx) => (
                  <SourceCard key={src.id || idx} source={src} />
                ))}
              </div>
            </div>
          )}

          {/* Body Content / Markdown */}
          <div className="markdown-body text-sm sm:text-base text-gray-800 dark:text-gray-100 leading-relaxed font-normal">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match && !String(children).includes('\n');
                  if (isInline) {
                    return (
                      <code
                        className="px-1.5 py-0.5 rounded-md font-mono text-xs bg-gray-200 dark:bg-dark-card text-primary-600 dark:text-primary-300 border border-gray-300/40 dark:border-dark-border"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }
                  return (
                    <CodeBlock
                      language={match ? match[1] : ''}
                      value={String(children).replace(/\n$/, '')}
                    />
                  );
                },
                a({ node, children, href, ...props }) {
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium underline hover:text-primary-500"
                      {...props}
                    >
                      {children}
                    </a>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Assistant Action Buttons Toolbar */}
          {!isUser && (
            <div className="flex items-center gap-1.5 mt-3 pt-1 text-gray-400 dark:text-gray-400">
              <button
                onClick={handleCopy}
                type="button"
                className="p-1.5 rounded-lg hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-card transition-colors"
                title="Copy response"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>

              {isLastAssistant && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  type="button"
                  className="p-1.5 rounded-lg hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-card transition-colors"
                  title="Regenerate response"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => setFeedback(feedback === 'liked' ? null : 'liked')}
                type="button"
                className={`p-1.5 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-dark-card ${
                  feedback === 'liked'
                    ? 'text-primary-500 bg-primary-50 dark:bg-primary-950/30'
                    : 'hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Good response"
              >
                <ThumbsUp className="w-4 h-4" />
              </button>

              <button
                onClick={() => setFeedback(feedback === 'disliked' ? null : 'disliked')}
                type="button"
                className={`p-1.5 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-dark-card ${
                  feedback === 'disliked'
                    ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/30'
                    : 'hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Bad response"
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

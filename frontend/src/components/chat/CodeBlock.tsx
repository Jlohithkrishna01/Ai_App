import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../../context/ThemeContext';

interface CodeBlockProps {
  language: string;
  value: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);
  const { isDark } = useTheme();

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const detectedLang = language || 'text';

  return (
    <div className="relative my-4 rounded-xl overflow-hidden border border-gray-200 dark:border-dark-border bg-[#181824] dark:bg-[#0D1322] shadow-sm">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800/90 dark:bg-[#12192c] border-b border-gray-700/50 dark:border-dark-border text-xs text-gray-300">
        <span className="font-mono font-medium tracking-wide text-primary-400">
          {detectedLang.toLowerCase()}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-gray-300 hover:text-white bg-gray-700/60 hover:bg-gray-700 transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Syntax Display */}
      <div className="text-sm font-mono overflow-x-auto p-1">
        <SyntaxHighlighter
          language={detectedLang}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'transparent',
            fontSize: '0.875rem',
            lineHeight: 1.6,
          }}
          wrapLines={true}
          wrapLongLines={true}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

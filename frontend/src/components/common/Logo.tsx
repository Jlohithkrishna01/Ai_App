import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-lg', dot: 'w-1.5 h-1.5' },
    md: { icon: 'w-9 h-9', text: 'text-xl', dot: 'w-2 h-2' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl', dot: 'w-2.5 h-2.5' },
    xl: { icon: 'w-16 h-16', text: 'text-4xl', dot: 'w-3 h-3' },
  };

  const { icon, text } = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Abstract AI / L Vector Icon */}
      <div className={`relative flex items-center justify-center ${icon} rounded-xl bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 shadow-md shadow-primary-500/20 text-white font-bold transition-transform hover:scale-105`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-60% h-60% w-5 h-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Futuristic L Path */}
          <path d="M7 5v11a3 3 0 0 0 3 3h7" />
          <circle cx="17" cy="7" r="2.5" fill="#06B6D4" stroke="none" />
        </svg>
        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-500"></span>
        </span>
      </div>

      {showText && (
        <div className="flex items-baseline tracking-tight">
          <span className={`font-extrabold ${text} text-gray-900 dark:text-white`}>
            LUMIQ
          </span>
          <span className={`ml-1 font-bold ${text} bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent`}>
            AI
          </span>
        </div>
      )}
    </div>
  );
};

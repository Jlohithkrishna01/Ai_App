import React from 'react';
import { Lightbulb, Code2, FileSearch, Globe, Rocket } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../common/Logo';

interface WelcomeScreenProps {
  onSelectSuggestion: (prompt: string, enableWebSearch?: boolean) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectSuggestion }) => {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'there';

  const suggestionCards = [
    {
      title: 'Explain a concept',
      desc: 'Understand complex ideas in simple terms',
      prompt: 'Explain the core principles of quantum computing and why qubits are revolutionary.',
      icon: <Lightbulb className="w-5 h-5 text-amber-500" />,
      bg: 'hover:border-amber-500/40 hover:bg-amber-50/50 dark:hover:bg-amber-950/20',
      webSearch: false,
    },
    {
      title: 'Write code',
      desc: 'Build clean, production-ready algorithms',
      prompt: 'Write a Python FastAPI service with rate limiting and database connection pooling.',
      icon: <Code2 className="w-5 h-5 text-indigo-500" />,
      bg: 'hover:border-indigo-500/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20',
      webSearch: false,
    },
    {
      title: 'Analyze a document',
      desc: 'Extract key takeaways and action items',
      prompt: 'What are best practices for summarizing technical whitepapers and executive resumes?',
      icon: <FileSearch className="w-5 h-5 text-emerald-500" />,
      bg: 'hover:border-emerald-500/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20',
      webSearch: false,
    },
    {
      title: 'Search the web',
      desc: 'Get up-to-the-minute real-time data',
      prompt: 'What are the latest breakthrough updates in artificial intelligence this week?',
      icon: <Globe className="w-5 h-5 text-cyan-500" />,
      bg: 'hover:border-cyan-500/40 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20',
      webSearch: true,
    },
    {
      title: 'Help with a project',
      desc: 'Architect a roadmap from idea to launch',
      prompt: 'Create a comprehensive 4-week execution roadmap to launch an AI SaaS product.',
      icon: <Rocket className="w-5 h-5 text-purple-500" />,
      bg: 'hover:border-purple-500/40 hover:bg-purple-50/50 dark:hover:bg-purple-950/20',
      webSearch: false,
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto px-4 py-8 text-center animate-in fade-in duration-300">
      {/* Brand Header */}
      <div className="mb-6 flex flex-col items-center">
        <Logo size="lg" showText={false} className="mb-4" />
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          {getGreeting()}, <span className="bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 bg-clip-text text-transparent">{firstName}</span> 👋
        </h1>
        <p className="mt-2 text-base sm:text-lg text-gray-600 dark:text-gray-300 font-medium">
          How can I help you today?
        </p>
      </div>

      {/* Suggestion Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 w-full mt-4 text-left">
        {suggestionCards.map((card, idx) => (
          <button
            key={idx}
            onClick={() => onSelectSuggestion(card.prompt, card.webSearch)}
            type="button"
            className={`group flex flex-col p-4 rounded-2xl border border-gray-200/90 dark:border-dark-border bg-white dark:bg-dark-card transition-all duration-200 shadow-sm hover:shadow-md ${card.bg}`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gray-100 dark:bg-dark-surface">
                {card.icon}
              </div>
              <span className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {card.title}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {card.desc}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, KeyRound, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import { Logo } from '../components/common/Logo';
import { ThemeToggle } from '../components/common/ThemeToggle';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetData, setResetData] = useState<{ message: string; reset_token?: string; reset_url?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await api.forgotPassword(email.trim());
      setResetData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to request password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-light-bg dark:bg-dark-bg transition-colors relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8 text-center">
          <Logo size="lg" className="mb-3" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Reset Password
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Enter your email to receive a password reset link
          </p>
        </div>

        <div className="bg-white dark:bg-dark-surface rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-dark-border shadow-xl shadow-gray-200/50 dark:shadow-black/40">
          {error && (
            <div className="mb-5 flex items-center gap-2.5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {resetData ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Reset Instructions Generated
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {resetData.message}
              </p>

              {resetData.reset_token && (
                <div className="p-4 rounded-2xl bg-primary-50 dark:bg-dark-card border border-primary-100 dark:border-primary-900/40 text-left">
                  <p className="text-[11px] font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2">
                    Direct Reset Link (Ready to use)
                  </p>
                  <Link
                    to={resetData.reset_url || `/reset-password?token=${resetData.reset_token}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-primary-600 hover:bg-primary-500 transition-colors w-full justify-center"
                  >
                    <span>Click to Reset Password Now</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to login</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-600 via-secondary-500 to-accent-500 hover:opacity-95 text-white font-semibold text-sm shadow-md shadow-primary-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Send Reset Instructions</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to login</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

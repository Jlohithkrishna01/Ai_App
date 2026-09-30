import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { Logo } from '../components/common/Logo';
import { ThemeToggle } from '../components/common/ThemeToggle';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tokenFromUrl = searchParams.get('token') || '';
  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Missing reset token. Please check your reset link.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.resetPassword({
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Link may be invalid or expired.');
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
            Create New Password
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Set your new LUMIQ AI account password
          </p>
        </div>

        <div className="bg-white dark:bg-dark-surface rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-dark-border shadow-xl shadow-gray-200/50 dark:shadow-black/40">
          {error && (
            <div className="mb-5 flex items-center gap-2.5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isSuccess ? (
            /* Password Reset Success Screen */
            <div className="text-center space-y-4 py-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Password Reset Successfully!
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Your password has been securely updated. You can now log into your LUMIQ AI account with your new credentials.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-600 via-secondary-500 to-accent-500 hover:opacity-95 text-white font-semibold text-sm shadow-md shadow-primary-500/25 transition-all"
              >
                <span>Continue to Log In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!tokenFromUrl && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Reset Token
                  </label>
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                    placeholder="Paste reset token"
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-mono text-xs"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-11 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-600 via-secondary-500 to-accent-500 hover:opacity-95 text-white font-semibold text-sm shadow-md shadow-primary-500/25 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Reset Password</span>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="text-xs font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white"
                >
                  Return to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

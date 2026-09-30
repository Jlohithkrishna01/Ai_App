import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/common/Logo';
import { ThemeToggle } from '../components/common/ThemeToggle';

export const SignupPage: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password strength checks
  const hasLength = password.length >= 8;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const isPasswordValid = hasLength && hasLetter && hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!isPasswordValid) {
      setError('Password does not meet minimum strength requirements.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await signup({
        name: name.trim(),
        email: email.trim(),
        password,
        confirm_password: confirmPassword,
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
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
            Create your account
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Start experiencing the power of LUMIQ AI
          </p>
        </div>

        <div className="bg-white dark:bg-dark-surface rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-dark-border shadow-xl shadow-gray-200/50 dark:shadow-black/40">
          {error && (
            <div className="mb-5 flex items-center gap-2.5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-medium animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                placeholder="John Doe"
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="name@example.com"
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full pl-4 pr-11 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all"
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

              {/* Password Strength Checklist */}
              {password && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-gray-50 dark:bg-dark-card/60 text-[11px] space-y-1">
                  <div className={`flex items-center gap-1.5 ${hasLength ? 'text-emerald-500' : 'text-gray-400'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasLetter ? 'text-emerald-500' : 'text-gray-400'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Contains letters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-500' : 'text-gray-400'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Contains numbers</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="••••••••"
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
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-primary-600 dark:text-primary-400 hover:underline"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

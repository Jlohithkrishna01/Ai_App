import React, { useState, useEffect } from 'react';
import {
  User,
  Palette,
  MessageSquare,
  ShieldAlert,
  Sun,
  Moon,
  Laptop,
  Check,
  Loader2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useChat } from '../../context/ChatContext';
import { api } from '../../services/api';
import { UserSettings } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChangePassword?: () => void;
  onOpenEditProfile?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenChangePassword,
  onOpenEditProfile,
}) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { clearAllConversations } = useChat();

  const [activeTab, setActiveTab] = useState<'account' | 'appearance' | 'chat' | 'privacy'>('account');
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'dark',
    enter_to_send: true,
    show_timestamps: true,
    default_model: 'qwen/qwen3.8-27b',
    system_prompt: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const handleUpdateSetting = async (key: keyof UserSettings, value: any) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    try {
      await api.updateSettings({ [key]: value });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to save setting:', err);
    }
  };

  const handleClearHistory = async () => {
    if (confirm('Are you sure you want to clear your entire chat history? This action cannot be undone.')) {
      await clearAllConversations();
      alert('Chat history cleared successfully.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError('Please enter your password to confirm account deletion.');
      return;
    }

    if (!confirm('WARNING: This will permanently delete your account and all associated data. Are you absolutely sure?')) {
      return;
    }

    setIsLoading(true);
    setDeleteError(null);
    try {
      await api.deleteAccount(deletePassword);
      logout();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete account.');
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: <User className="w-4 h-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
    { id: 'chat', label: 'Chat', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy', icon: <ShieldAlert className="w-4 h-4" /> },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" maxWidth="max-w-2xl">
      <div className="flex flex-col sm:flex-row gap-6 min-h-[380px]">
        {/* Navigation Tabs (Sidebar style) */}
        <div className="sm:w-44 flex sm:flex-col gap-1 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-dark-border pb-3 sm:pb-0 sm:pr-3 shrink-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left shrink-0 ${
                activeTab === tab.id
                  ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-card hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Panel */}
        <div className="flex-1 overflow-y-auto">
          {/* ACCOUNT TAB */}
          {activeTab === 'account' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Account Details
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Manage your personal account credentials.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-card border border-gray-100 dark:border-dark-border space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Full Name
                  </label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                    {user?.name}
                  </p>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Email Address
                  </label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {onOpenEditProfile && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenEditProfile();
                    }}
                    type="button"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-dark-card text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-dark-cardHover transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
                {onOpenChangePassword && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenChangePassword();
                    }}
                    type="button"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-dark-card text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-dark-cardHover transition-colors"
                  >
                    Change Password
                  </button>
                )}
              </div>
            </div>
          )}

          {/* APPEARANCE TAB */}
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Theme Preference
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Choose how LUMIQ AI looks to you.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTheme('light');
                    handleUpdateSetting('theme', 'light');
                  }}
                  className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border transition-all text-center ${
                    theme === 'light'
                      ? 'border-primary-500 bg-primary-500/10 shadow-sm'
                      : 'border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-card'
                  }`}
                >
                  <Sun className="w-6 h-6 text-amber-500" />
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">
                    Light
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTheme('dark');
                    handleUpdateSetting('theme', 'dark');
                  }}
                  className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border transition-all text-center ${
                    theme === 'dark'
                      ? 'border-primary-500 bg-primary-500/10 shadow-sm'
                      : 'border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-card'
                  }`}
                >
                  <Moon className="w-6 h-6 text-indigo-400" />
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">
                    Dark
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTheme('system');
                    handleUpdateSetting('theme', 'system');
                  }}
                  className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border transition-all text-center ${
                    theme === 'system'
                      ? 'border-primary-500 bg-primary-500/10 shadow-sm'
                      : 'border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-card'
                  }`}
                >
                  <Laptop className="w-6 h-6 text-accent-500" />
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">
                    System
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* CHAT TAB */}
          {activeTab === 'chat' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Chat Preferences
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Customize the chat interface and AI behavior.
                </p>
              </div>

              {/* Enter to Send Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-dark-card border border-gray-100 dark:border-dark-border">
                <div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">
                    Enter key sends message
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    When disabled, use Shift + Enter or the Send button
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enter_to_send}
                  onChange={(e) => handleUpdateSetting('enter_to_send', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                />
              </div>

              {/* Timestamps Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-dark-card border border-gray-100 dark:border-dark-border">
                <div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">
                    Show message timestamps
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Display time of delivery next to user and AI messages
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.show_timestamps}
                  onChange={(e) => handleUpdateSetting('show_timestamps', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                />
              </div>

              {/* AI Model Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Default AI Model
                </label>
                <select
                  value={settings.default_model}
                  onChange={(e) => handleUpdateSetting('default_model', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                >
                  <option value="qwen/qwen3.8-27b">Qwen 3.8 27B (Fast, Highly Accurate)</option>
                  <option value="openai/gpt-oss-120b">GPT OSS 120B (Deep Reasoning)</option>
                  <option value="openai/gpt-oss-20b">GPT OSS 20B (Compact, Ultra Fast)</option>
                </select>
              </div>

              {/* Custom System Prompt */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Custom AI Instructions (Optional)
                </label>
                <textarea
                  value={settings.system_prompt || ''}
                  onChange={(e) => setSettings({ ...settings, system_prompt: e.target.value })}
                  onBlur={() => handleUpdateSetting('system_prompt', settings.system_prompt)}
                  placeholder="e.g. Always respond in concise bullet points with Java 21 syntax..."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none"
                />
              </div>
            </div>
          )}

          {/* PRIVACY TAB */}
          {activeTab === 'privacy' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Privacy & Data Management
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Control your conversation data and account lifecycle.
                </p>
              </div>

              {/* Clear Chat History */}
              <div className="p-4 rounded-2xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-card">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-semibold text-gray-900 dark:text-white">
                      Clear all chat history
                    </h5>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      Permanently delete all previous conversations and messages.
                    </p>
                  </div>
                  <button
                    onClick={handleClearHistory}
                    type="button"
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-rose-500 border border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
                  >
                    Clear History
                  </button>
                </div>
              </div>

              {/* Delete Account */}
              <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-50/20 dark:bg-rose-950/20 space-y-3">
                <div className="flex items-start gap-2.5 text-rose-500">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-semibold">Delete Account</h5>
                    <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5">
                      Permanently delete your LUMIQ AI account and all stored history. This action cannot be reversed.
                    </p>
                  </div>
                </div>

                {deleteError && (
                  <p className="text-xs text-rose-500 font-medium">{deleteError}</p>
                )}

                <div className="pt-1">
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your current password to confirm"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-card border border-rose-500/40 text-gray-900 dark:text-white focus:outline-none"
                  />
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isLoading || !deletePassword}
                    type="button"
                    className="mt-2.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Deleting...' : 'Delete My Account'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

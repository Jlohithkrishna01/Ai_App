import React, { useState } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Edit2,
  Trash2,
  Check,
  X,
  Settings as SettingsIcon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../common/Logo';
import { Avatar } from '../common/Avatar';
import { ThemeToggle } from '../common/ThemeToggle';
import { Conversation } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  onOpenProfile,
  onOpenSettings,
}) => {
  const { user, logout } = useAuth();
  const {
    groupedConversations,
    currentConversationId,
    selectConversation,
    startNewChat,
    renameConversation,
    deleteConversation,
    searchTerm,
    setSearchTerm,
    conversations,
  } = useChat();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleStartRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditingTitle(conv.title);
  };

  const handleSaveRename = async (id: number, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    if (editingTitle.trim()) {
      await renameConversation(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this conversation?')) {
      await deleteConversation(id);
    }
  };

  const renderConversationGroup = (title: string, items: Conversation[]) => {
    if (items.length === 0) return null;

    return (
      <div key={title} className="mb-4">
        <h4 className="px-3 mb-1.5 text-[11px] font-semibold tracking-wider uppercase text-gray-400 dark:text-gray-500">
          {title}
        </h4>
        <div className="space-y-0.5">
          {items.map((conv) => {
            const isActive = currentConversationId === conv.id;
            const isEditing = editingId === conv.id;

            return (
              <div
                key={conv.id}
                onClick={() => {
                  if (!isEditing) selectConversation(conv.id);
                }}
                className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all duration-150 ${
                  isActive
                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold border border-primary-500/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-cardHover'
                }`}
              >
                {isEditing ? (
                  <form
                    onSubmit={(e) => handleSaveRename(conv.id, e)}
                    className="flex items-center gap-1 w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      autoFocus
                      className="flex-1 px-2 py-1 text-xs rounded-lg bg-white dark:bg-dark-surface border border-primary-500 text-gray-900 dark:text-white focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="p-1 text-emerald-500 hover:text-emerald-600"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelRename}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center gap-2.5 truncate flex-1 min-w-0 mr-2">
                      <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary-500' : 'text-gray-400'}`} />
                      <span className="truncate">{conv.title}</span>
                    </div>

                    {/* Hover Actions (Rename / Delete) */}
                    <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                      <button
                        onClick={(e) => handleStartRename(conv, e)}
                        type="button"
                        className="p-1 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-dark-card transition-colors"
                        title="Rename conversation"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(conv.id, e)}
                        type="button"
                        className="p-1 rounded-md text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete conversation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const hasAnyConversations = conversations.length > 0;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={onToggle}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 flex flex-col w-72 bg-white dark:bg-[#0E1528] border-r border-gray-200 dark:border-dark-border transition-transform duration-300 ease-in-out shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'
        }`}
      >
        {/* Top Header: Logo + Collapse Button */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-dark-border">
          <Logo size="md" />
          <button
            onClick={onToggle}
            type="button"
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-card transition-colors"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={() => {
              startNewChat();
              if (window.innerWidth < 1024) onToggle();
            }}
            type="button"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 via-secondary-500 to-accent-500 hover:opacity-95 text-white font-semibold text-sm shadow-md shadow-primary-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Search Input Field */}
        <div className="px-3 mb-2">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search chats..."
              className="w-full pl-9 pr-8 py-1.5 rounded-xl text-xs bg-gray-100 dark:bg-dark-card border border-transparent focus:border-primary-500 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Conversations History List */}
        <div className="flex-1 overflow-y-auto px-2 py-1">
          {!hasAnyConversations ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gray-400">
              <MessageSquare className="w-8 h-8 mb-2 opacity-40 text-primary-400" />
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                No conversations yet
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                Start a new conversation with LUMIQ AI.
              </p>
            </div>
          ) : (
            <>
              {renderConversationGroup('Today', groupedConversations.today)}
              {renderConversationGroup('Yesterday', groupedConversations.yesterday)}
              {renderConversationGroup('Previous 7 Days', groupedConversations.previous7Days)}
              {renderConversationGroup('Older', groupedConversations.older)}
            </>
          )}
        </div>

        {/* Bottom Profile & Settings Section */}
        <div className="p-3 border-t border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface/50">
          <div
            onClick={onOpenProfile}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-card cursor-pointer transition-colors"
          >
            <Avatar src={user?.profile_image} name={user?.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                {user?.name}
              </p>
              <p className="text-[11px] text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between px-1">
            <button
              onClick={onOpenSettings}
              type="button"
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-card transition-colors"
              title="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>

            <ThemeToggle />

            <button
              onClick={logout}
              type="button"
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

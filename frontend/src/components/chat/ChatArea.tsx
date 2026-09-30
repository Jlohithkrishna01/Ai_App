import React, { useEffect, useRef } from 'react';
import { Loader2, Globe, Sparkles } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { WelcomeScreen } from './WelcomeScreen';
import { MessageItem } from './MessageItem';
import { SourceCard } from './SourceCard';
import { ChatInput } from './ChatInput';
import { Message } from '../../types';

interface ChatAreaProps {
  enterToSend?: boolean;
  showTimestamps?: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  enterToSend = true,
  showTimestamps = true,
}) => {
  const {
    currentConversation,
    isLoadingChat,
    isStreaming,
    streamingStatus,
    streamingSources,
    streamingContent,
    sendMessage,
    stopGenerating,
    regenerateMessage,
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [currentConversation?.messages, streamingContent, streamingStatus]);

  const handleSuggestionSelect = (prompt: string, enableWebSearch?: boolean) => {
    sendMessage({
      content: prompt,
      enableWebSearch: !!enableWebSearch,
    });
  };

  const messages = currentConversation?.messages || [];
  const hasMessages = messages.length > 0 || isStreaming;

  // Find last user message for regeneration
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-light-bg dark:bg-dark-bg transition-colors">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto">
        {isLoadingChat ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-400">
            <Loader2 className="w-7 h-7 animate-spin text-primary-500" />
            <p className="text-sm font-medium">Loading conversation...</p>
          </div>
        ) : !hasMessages ? (
          <WelcomeScreen onSelectSuggestion={handleSuggestionSelect} />
        ) : (
          <div className="flex flex-col pb-4">
            {messages.map((msg, index) => {
              const isLastAssistant =
                msg.role === 'assistant' &&
                index === messages.length - 1 &&
                !isStreaming;

              return (
                <MessageItem
                  key={msg.id || index}
                  message={msg}
                  isLastAssistant={isLastAssistant}
                  showTimestamp={showTimestamps}
                  onRegenerate={
                    lastUserMsg ? () => regenerateMessage(lastUserMsg) : undefined
                  }
                />
              );
            })}

            {/* Active Streaming Assistant Response Bubble */}
            {isStreaming && (
              <div className="w-full py-4 sm:py-6 px-4 sm:px-6 bg-gray-50/60 dark:bg-dark-surface/40 border-y border-gray-100 dark:border-dark-border/40">
                <div className="max-w-4xl mx-auto flex gap-4 sm:gap-5">
                  <div className="shrink-0 mt-0.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-600 via-secondary-500 to-accent-500 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
                      <Sparkles className="w-5 h-5 text-white animate-pulse" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white">
                        LUMIQ AI
                      </span>
                    </div>

                    {/* Status Badge (Searching the web... or Thinking...) */}
                    {streamingStatus && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/25 text-primary-600 dark:text-primary-400 text-xs font-medium mb-3 animate-pulse">
                        {streamingStatus.includes('web') ? (
                          <Globe className="w-3.5 h-3.5 text-accent-500" />
                        ) : (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-500" />
                        )}
                        <span>{streamingStatus}</span>
                      </div>
                    )}

                    {/* Sources preview during stream */}
                    {streamingSources.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                          <Globe className="w-3.5 h-3.5 text-accent-500" />
                          <span>Sources ({streamingSources.length})</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {streamingSources.map((src, idx) => (
                            <SourceCard key={idx} source={src} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Streaming Text Content */}
                    {streamingContent ? (
                      <div className="markdown-body text-sm sm:text-base text-gray-800 dark:text-gray-100 leading-relaxed font-normal whitespace-pre-wrap">
                        {streamingContent}
                        <span className="inline-block w-2 h-4 ml-1 bg-primary-500 animate-pulse align-middle" />
                      </div>
                    ) : !streamingStatus ? (
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                        <span>Preparing response...</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Bottom Chat Input */}
      <ChatInput
        onSend={sendMessage}
        onStop={stopGenerating}
        isStreaming={isStreaming}
        enterToSend={enterToSend}
      />
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Square,
  Paperclip,
  Mic,
  MicOff,
  Globe,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { UploadedFileInfo } from '../../types';
import { FilePreviewChip } from './FilePreviewChip';

interface ChatInputProps {
  onSend: (params: {
    content: string;
    fileInfo?: UploadedFileInfo | null;
    enableWebSearch: boolean;
  }) => void;
  onStop: () => void;
  isStreaming: boolean;
  enterToSend?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onStop,
  isStreaming,
  enterToSend = true,
}) => {
  const [content, setContent] = useState('');
  const [fileInfo, setFileInfo] = useState<UploadedFileInfo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [enableWebSearch, setEnableWebSearch] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [content]);

  // Focus textarea when not streaming
  useEffect(() => {
    if (!isStreaming && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isStreaming]);

  // Speech Recognition setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setContent((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = (err: any) => {
        console.error('Speech recognition error:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (enterToSend && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    }
  };

  const handleSend = () => {
    if ((!content.trim() && !fileInfo) || isStreaming) return;
    onSend({
      content: content.trim(),
      fileInfo,
      enableWebSearch,
    });
    setContent('');
    setFileInfo(null);
    setUploadError(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const uploaded = await api.uploadFile(file);
      setFileInfo(uploaded);
    } catch (err: any) {
      setUploadError(err.message || 'File upload failed.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const canSubmit = (content.trim().length > 0 || !!fileInfo) && !isUploading;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4 pt-2">
      {/* Upload Error Banner */}
      {uploadError && (
        <div className="mb-2 flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Main Input Container Card */}
      <div className="relative rounded-2xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card shadow-lg shadow-gray-200/50 dark:shadow-black/40 transition-all focus-within:border-primary-500/80 focus-within:ring-2 focus-within:ring-primary-500/20">
        {/* Attached file preview chip */}
        {(fileInfo || isUploading) && (
          <div className="p-3 pb-0">
            <FilePreviewChip
              fileInfo={fileInfo}
              isLoading={isUploading}
              onRemove={() => setFileInfo(null)}
            />
          </div>
        )}

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message LUMIQ AI..."
          rows={1}
          className="w-full px-4 pt-3.5 pb-2 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none text-sm sm:text-base leading-relaxed"
          style={{ maxHeight: '200px' }}
        />

        {/* Bottom Toolbar & Action Buttons */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100 dark:border-dark-border/60">
          {/* Left Action Buttons */}
          <div className="flex items-center gap-1">
            {/* File Upload Button */}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.docx,.doc,.txt,.csv,.md,.json,.png,.jpg,.jpeg,.webp"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              type="button"
              disabled={isUploading || isStreaming}
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors disabled:opacity-50"
              title="Attach document or image (PDF, DOCX, TXT, CSV, Image)"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Web Search Toggle Button */}
            <button
              onClick={() => setEnableWebSearch(!enableWebSearch)}
              type="button"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                enableWebSearch
                  ? 'bg-accent-500/15 text-accent-500 border border-accent-500/30'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-surface'
              }`}
              title="Search the web for real-time information"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Web Search</span>
            </button>

            {/* Voice Input Button */}
            <button
              onClick={toggleVoiceInput}
              type="button"
              className={`p-2 rounded-xl transition-colors ${
                isListening
                  ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 animate-pulse'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-surface'
              }`}
              title={isListening ? 'Listening... click to stop' : 'Voice input'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          {/* Right Action: Send / Stop Generating Button */}
          <div className="flex items-center gap-2">
            {isStreaming ? (
              <button
                onClick={onStop}
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-black dark:bg-gray-100 dark:hover:bg-white text-white dark:text-gray-900 font-medium text-xs shadow-sm transition-all animate-in zoom-in-90"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!canSubmit}
                type="button"
                className={`p-2.5 rounded-xl text-white shadow-md transition-all ${
                  canSubmit
                    ? 'bg-gradient-to-r from-primary-600 via-secondary-500 to-accent-500 hover:opacity-95 shadow-primary-500/25 cursor-pointer scale-100'
                    : 'bg-gray-300 dark:bg-dark-border text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60'
                }`}
                title="Send message"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-2 text-center text-[11px] text-gray-400 dark:text-gray-500">
        LUMIQ AI can make mistakes. Verify important information.
      </div>
    </div>
  );
};

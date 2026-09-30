import {
  User,
  UserStats,
  Conversation,
  ConversationDetail,
  UserSettings,
  UploadedFileInfo,
  Source
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const getToken = (): string | null => {
  return localStorage.getItem('lumiq_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('lumiq_token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('lumiq_token');
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeToken();
    if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/signup')) {
      window.location.href = '/login?expired=true';
    }
  }

  if (!response.ok) {
    let errorMsg = 'An unexpected error occurred.';
    try {
      const errorData = await response.json();
      errorMsg = errorData.detail || errorData.message || errorMsg;
    } catch {
      errorMsg = response.statusText || errorMsg;
    }
    throw new ApiError(errorMsg, response.status);
  }

  // If response is 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Authentication
  async signup(data: any): Promise<{ access_token: string; token_type: string; user: User }> {
    return request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async login(data: any): Promise<{ access_token: string; token_type: string; user: User }> {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async forgotPassword(email: string): Promise<{ message: string; reset_token?: string; reset_url?: string }> {
    return request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(data: any): Promise<{ message: string }> {
    return request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMe(): Promise<User> {
    return request('/auth/me');
  },

  // Users & Profile
  async getProfile(): Promise<{ user: User; stats: UserStats }> {
    return request('/users/profile');
  },

  async updateProfile(data: { name?: string; bio?: string }): Promise<User> {
    return request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('file', file);
    return request('/users/avatar', {
      method: 'POST',
      body: formData,
    });
  },

  async changePassword(data: any): Promise<{ message: string }> {
    return request('/users/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Conversations
  async getConversations(searchTerm?: string): Promise<Conversation[]> {
    const query = searchTerm ? `?q=${encodeURIComponent(searchTerm)}` : '';
    return request(`/chats${query}`);
  },

  async getConversation(id: number): Promise<ConversationDetail> {
    return request(`/chats/${id}`);
  },

  async createConversation(title?: string): Promise<Conversation> {
    return request('/chats', {
      method: 'POST',
      body: JSON.stringify({ title: title || 'New Chat' }),
    });
  },

  async updateConversation(id: number, title: string): Promise<Conversation> {
    return request(`/chats/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title }),
    });
  },

  async deleteConversation(id: number): Promise<{ message: string }> {
    return request(`/chats/${id}`, {
      method: 'DELETE',
    });
  },

  async clearAllConversations(): Promise<{ message: string }> {
    return request('/chats', {
      method: 'DELETE',
    });
  },

  // Files
  async uploadFile(file: File): Promise<UploadedFileInfo> {
    const formData = new FormData();
    formData.append('file', file);
    return request('/files/upload', {
      method: 'POST',
      body: formData,
    });
  },

  // Settings
  async getSettings(): Promise<UserSettings> {
    return request('/settings');
  },

  async updateSettings(data: Partial<UserSettings>): Promise<UserSettings> {
    return request('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteAccount(password: string): Promise<{ message: string }> {
    return request('/settings/account', {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    });
  },

  // Real-Time Chat SSE Stream
  streamChat(
    payload: {
      conversation_id?: number | null;
      content: string;
      file_name?: string | null;
      file_url?: string | null;
      file_type?: string | null;
      file_extracted_text?: string | null;
      enable_web_search?: boolean;
      model?: string;
    },
    callbacks: {
      onInit?: (data: { conversation_id: number; title: string; user_message_id: number }) => void;
      onStatus?: (message: string) => void;
      onSources?: (sources: Source[]) => void;
      onToken?: (token: string) => void;
      onDone?: (data: { conversation_id: number; message_id: number; title: string; sources: Source[] }) => void;
      onError?: (error: string) => void;
    },
    signal?: AbortSignal
  ): Promise<void> {
    const token = getToken();

    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${API_BASE}/ai/chat/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
          signal,
        });

        if (!response.ok) {
          let errorMsg = 'Failed to connect to AI stream.';
          try {
            const err = await response.json();
            errorMsg = err.detail || errorMsg;
          } catch {}
          callbacks.onError?.(errorMsg);
          reject(new Error(errorMsg));
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('ReadableStream not supported by browser.');
        }

        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const jsonStr = trimmed.slice(6);
              try {
                const event = JSON.parse(jsonStr);
                if (event.type === 'init') {
                  callbacks.onInit?.(event);
                } else if (event.type === 'status') {
                  callbacks.onStatus?.(event.message);
                } else if (event.type === 'sources') {
                  callbacks.onSources?.(event.sources);
                } else if (event.type === 'token') {
                  callbacks.onToken?.(event.content);
                } else if (event.type === 'done') {
                  callbacks.onDone?.(event);
                } else if (event.type === 'error') {
                  callbacks.onError?.(event.message);
                }
              } catch (parseErr) {
                console.error('Error parsing SSE event:', parseErr, jsonStr);
              }
            }
          }
        }
        resolve();
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('Stream generation aborted by user.');
          resolve();
        } else {
          callbacks.onError?.(err.message || 'Stream connection lost.');
          reject(err);
        }
      }
    });
  }
};

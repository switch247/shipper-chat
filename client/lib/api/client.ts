import { User, ChatSession, Message, ContactInfo } from '../types';

export interface ApiResponse<T> {
  data: T;
  error?: string;
  success: boolean;
}

export interface ApiConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retries: number;
  private defaultHeaders: Record<string, string>;

  constructor(config: ApiConfig = {}) {
    this.baseURL = config.baseURL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    this.timeout = config.timeout || 10000;
    this.retries = config.retries || 3;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    const headers = {
      ...this.defaultHeaders,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
        // include cookies for refresh token flow
        credentials: 'include',
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));

        // Retry on 5xx errors
        if (response.status >= 500 && retryCount < this.retries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          return this.request<T>(endpoint, options, retryCount + 1);
        }

        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return { data, success: true };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return { data: null as T, error: 'Request timeout', success: false };
        }

        // Retry on network errors
        if (retryCount < this.retries && (
          error.message.includes('fetch') ||
          error.message.includes('network') ||
          error.message.includes('Failed to fetch')
        )) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          return this.request<T>(endpoint, options, retryCount + 1);
        }

        return { data: null as T, error: error.message, success: false };
      }

      return { data: null as T, error: 'Unknown error', success: false };
    }
  }

  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  async post<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  }

  async put<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }

  // Convenience methods for common operations
  async login(email: string, password: string) {
    return this.post('/auth/login', { email, password });
  }

  async signup(name: string, email: string, password: string) {
    return this.post('/auth/register', { name, email, password });
  }

  async googleLogin(token: string) {
    return this.post('/auth/google', { token });
  }

  async getCurrentUser() {
    return this.get('/auth/me');
  }

  async refresh() {
    return this.post('/auth/refresh');
  }

  async logout() {
    return this.post('/auth/logout');
  }

  async getUsers() {
    return this.get<User[]>('/chat/users');
  }

  async getChatSessions() {
    return this.get<ChatSession[]>('/chat/conversations');
  }

  async getChatMessages(chatId: string) {
    return this.get<Message[]>(`/chat/messages/${chatId}`);
  }

  async getContactInfo(userId: string) {
    return this.get<ContactInfo>(`/chat/users/${userId}/contact-info`);
  }

  async createConversation(participantId: string, name?: string) {
    return this.post('/chat/conversations', { participantId, name });
  }

  async sendMessage(chatId: string, content: string) {
    return this.post('/chat/messages', { conversationId: chatId, content });
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export for backward compatibility
export default apiClient;
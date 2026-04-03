import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, Message, ChatSession } from "../types";
import { apiClient } from "../api/client";
import * as chatApi from "../api/chat";
import { joinConversation } from '@/lib/socket';
import { toast } from '@/hooks/use-toast';

// Helper: check JWT expiry (returns true if expired)
function isJwtExpired(token: string | null) {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = parts[1];
    // base64url decode
    const padded = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = decodeURIComponent(atob(padded).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const obj = JSON.parse(decoded);
    if (!obj.exp) return false;
    const exp = Number(obj.exp);
    return Date.now() / 1000 > exp;
  } catch (err) {
    console.warn('Failed to parse token for expiry', err);
    return true;
  }
}

interface AuthState {
  isAuthenticated: boolean;
  authChecked: boolean;
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  setCurrentUser: (user: User) => void;
  checkAuth: () => Promise<void>;
}

interface ChatStore extends AuthState {
  selectedChatId: string | null;
  chatSessions: ChatSession[];
  allUsers: User[];
  onlineUsers: Set<string>;
  aiTyping: Record<string, boolean>;
  messages: Record<string, Message[]>;
  showContactPanel: boolean;
  showNewMessageModal: boolean;
  isLoading: boolean;
  isLoadingSessions: boolean;
  isLoadingUsers: boolean;
  isLoadingMessages: Record<string, boolean>;
  swipedChatId: string | null;
  searchQuery: string;

  // Chat Actions
  setSelectedChat: (chatId: string | null) => void;
  setChatSessions: (sessions: ChatSession[]) => void;
  setAllUsers: (users: User[]) => void;
  setOnlineUsers: (userIds: string[]) => void;
  setMessages: (chatId: string, messages: Message[]) => void;
  addMessage: (chatId: string, message: Message) => void;
  toggleContactPanel: () => void;
  setContactPanelVisible: (visible: boolean) => void;
  setShowNewMessageModal: (show: boolean) => void;
  setSwipedChatId: (chatId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  markUserOnline: (userId: string) => void;
  markUserOffline: (userId: string) => void;
  setAiTyping: (conversationId: string, typing: boolean) => void;

  // API Actions
  loadChatSessions: () => Promise<void>;
  loadUsers: () => Promise<void>;
  loadChatMessages: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, content: string) => Promise<void>;
  createConversation: (participantId: string, name?: string) => Promise<void>;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Auth state
      isAuthenticated: false,
      authChecked: false,
      currentUser: null,

      // Chat state
      selectedChatId: null,
      chatSessions: [],
      allUsers: [],
      onlineUsers: new Set(),
      messages: {},
      aiTyping: {},
      showContactPanel: false,
      showNewMessageModal: false,
      swipedChatId: null,
      isLoading: false,      isLoadingSessions: false,
      isLoadingUsers: false,
      isLoadingMessages: {},      searchQuery: "",

      // Auth actions
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          const response = await apiClient.login(email, password);
          if (response.success && response.data) {
            if (typeof window !== 'undefined' && response.data.token) {
              localStorage.setItem('auth_token', response.data.token);
            }
            set({
              isAuthenticated: true,
              currentUser: response.data.user,
            });
          } else {
            const msg = response.error || 'Login failed';
            toast({ title: 'Login failed', description: String(msg).split('\n')[0], variant: 'destructive' });
            throw new Error(msg);
          }
        } catch (error) {
          console.error("Login failed:", error);
          const message = error instanceof Error ? error.message : String(error);
          toast({ title: 'Login failed', description: message.split('\n')[0], variant: 'destructive' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      signup: async (name: string, email: string, password: string) => {
        try {
          set({ isLoading: true });
          const response = await apiClient.signup(name, email, password);
          if (response.success && response.data) {
            if (typeof window !== 'undefined' && response.data.token) {
              localStorage.setItem('auth_token', response.data.token);
            }
            set({
              isAuthenticated: true,
              currentUser: response.data.user,
            });
          } else {
            const msg = response.error || 'Signup failed';
            toast({ title: 'Signup failed', description: String(msg).split('\n')[0], variant: 'destructive' });
            throw new Error(msg);
          }
        } catch (error) {
          console.error("Signup failed:", error);
          const message = error instanceof Error ? error.message : String(error);
          toast({ title: 'Signup failed', description: message.split('\n')[0], variant: 'destructive' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      googleLogin: async (token: string) => {
        try {
          set({ isLoading: true });
          const response = await apiClient.googleLogin(token);
          if (response.success && response.data) {
            if (typeof window !== 'undefined' && response.data.token) {
              localStorage.setItem('auth_token', response.data.token);
            }
            set({
              isAuthenticated: true,
              currentUser: response.data.user,
            });
          } else {
            const msg = response.error || 'Google login failed';
            toast({ title: 'Google login failed', description: String(msg).split('\n')[0], variant: 'destructive' });
            throw new Error(msg);
          }
        } catch (error) {
          console.error('Google login failed:', error);
          const message = error instanceof Error ? error.message : String(error);
          toast({ title: 'Google login failed', description: message.split('\n')[0], variant: 'destructive' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Normalize currentUser shape coming from the API (some endpoints return { user: {...} })
      checkAuth: async () => {
        try {
          const response = await apiClient.getCurrentUser();
          if (response.success && response.data) {
            // API may return { user: { ... } } or the user object directly
            const user = (response.data as any).user || response.data;
            set({
              isAuthenticated: true,
              currentUser: user,
              authChecked: true,
            });
          } else {
            set({
              isAuthenticated: false,
              authChecked: true,
              currentUser: null,
            });
            // Try refreshing via cookie if available
            try {
              const refreshed = await apiClient.refresh();
              if (refreshed.success && refreshed.data) {
                const data = refreshed.data as any;
                if (data.token) localStorage.setItem('auth_token', data.token);
                const user = data.user || (data as any).user;
                set({ isAuthenticated: true, authChecked: true, currentUser: user });
                return;
              }
            } catch (err) {
              // ignore
            }

            set({ isAuthenticated: false, authChecked: true, currentUser: null });
          }
        } catch (error) {
          // On error, attempt refresh once
          try {
            const refreshed = await apiClient.refresh();
            if (refreshed.success && refreshed.data) {
              const data = refreshed.data as any;
              if (data.token) localStorage.setItem('auth_token', data.token);
              const user = data.user || (data as any).user;
              set({ isAuthenticated: true, authChecked: true, currentUser: user });
              return;
            }
          } catch (err) {
            // ignore
          }

          set({ isAuthenticated: false, authChecked: true, currentUser: null });
        }
      },
      logout: async () => {
        try {
          // Ask server to clear/ revoke refresh token cookie
          await apiClient.logout();
        } catch (err) {
          console.warn('Server logout failed', err);
        }

        // Clear token from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }

        set({
          isAuthenticated: false,
          currentUser: null,
          selectedChatId: null,
          chatSessions: [],
          messages: {},
        });
      },

      setCurrentUser: (user) => {
        // Accept either { user: {...} } or user object and normalize
        const normalized = (user as any)?.user || user || null;
        set({ currentUser: normalized });
      },

      setSelectedChat: (chatId) => set({ selectedChatId: chatId }),

      setChatSessions: (sessions) => set({ chatSessions: sessions }),

      setAllUsers: (users) => set({ allUsers: users }),

      setOnlineUsers: (userIds) => set({ onlineUsers: new Set(userIds) }),

      setMessages: (chatId, messages) =>
        set((state) => ({
          messages: { ...state.messages, [chatId]: messages },
        })),

      addMessage: (chatId, message) =>
        set((state) => {
          // 1. Update the message record
          const existing = state.messages[chatId] || [];

          // If message already exists by id, replace it
          const alreadyIndex = existing.findIndex((m) => m.id === message.id);
          let newMessages;
          if (alreadyIndex !== -1) {
            const copy = [...existing];
            copy[alreadyIndex] = message;
            newMessages = copy;
          } else {
            // Try to replace an optimistic message (numeric id) that matches sender+content
            const optimisticIndex = existing.findIndex(
              (m) => typeof m.id === 'string' && /^\d+$/.test(m.id) && m.senderId === message.senderId && m.content === message.content
            );
            if (optimisticIndex !== -1) {
              const copy = [...existing];
              copy[optimisticIndex] = message;
              newMessages = copy;
            } else {
              newMessages = [...existing, message];
            }
          }

          const updatedMessages = { ...state.messages, [chatId]: newMessages };

          // 2. Update the session list (lastMessage and order)
          const updatedSessions = [...state.chatSessions];
          const sessionIndex = updatedSessions.findIndex(
            (s) => s.id === chatId,
          );

          if (sessionIndex !== -1) {
            const session = { ...updatedSessions[sessionIndex] };
            session.lastMessage = message;
            // If message is marked read (server-side or optimistic for bot), clear unread count
            if (message.read) {
              session.unreadCount = 0;
            } else {
              // If message is from others and we are not in this chat, increment unread (basic logic)
              if (message.senderId !== state.currentUser?.id && chatId !== state.selectedChatId) {
                session.unreadCount = (session.unreadCount || 0) + 1;
              }
            }

            // Remove and insert at top
            updatedSessions.splice(sessionIndex, 1);
            updatedSessions.unshift(session);
          }

          return {
            messages: updatedMessages,
            chatSessions: updatedSessions,
          };
        }),

      toggleContactPanel: () =>
        set((state) => ({ showContactPanel: !state.showContactPanel })),

      // AI typing state
      setAiTyping: (conversationId: string, typing: boolean) =>
        set((state) => ({ aiTyping: { ...state.aiTyping, [conversationId]: typing } })),

      setContactPanelVisible: (visible) => set({ showContactPanel: visible }),

      setShowNewMessageModal: (show) => set({ showNewMessageModal: show }),

      setSwipedChatId: (chatId) => set({ swipedChatId: chatId }),

      searchQuery: "",
      setSearchQuery: (query) => set({ searchQuery: query }),

      setLoading: (loading) => set({ isLoading: loading }),

      markUserOnline: (userId) =>
        set((state) => {
          const newOnlineUsers = new Set(state.onlineUsers);
          newOnlineUsers.add(userId);
          return { onlineUsers: newOnlineUsers };
        }),

      markUserOffline: (userId) =>
        set((state) => {
          const newOnlineUsers = new Set(state.onlineUsers);
          newOnlineUsers.delete(userId);
          return { onlineUsers: newOnlineUsers };
        }),

      // API Actions
      loadChatSessions: async () => {
        try {
          set({ isLoadingSessions: true });
          const response = await apiClient.getChatSessions();
          if (response.success) {
            set({ chatSessions: response.data || [] });
          } else {
            throw new Error(response.error || 'Failed to load chat sessions');
          }
        } catch (error) {
          console.error("Failed to load chat sessions:", error);
          throw error;
        } finally {
          set({ isLoadingSessions: false });
        }
      },

      loadUsers: async () => {
        try {
          set({ isLoadingUsers: true });
          const response = await apiClient.getUsers();
          if (response.success) {
            set({ allUsers: response.data || [] });
          } else {
            throw new Error(response.error || 'Failed to load users');
          }
        } catch (error) {
          console.error("Failed to load users:", error);
          throw error;
        } finally {
          set({ isLoadingUsers: false });
        }
      },

      loadChatMessages: async (chatId: string) => {
        try {
          set((state) => ({
            isLoadingMessages: { ...state.isLoadingMessages, [chatId]: true },
          }));
          const response = await apiClient.getChatMessages(chatId);
          if (response.success) {
            // Persist fetched messages
            const fetched = response.data || [];
            set((state) => ({
              messages: { ...state.messages, [chatId]: fetched },
              isLoadingMessages: { ...state.isLoadingMessages, [chatId]: false },
            }));

            // After loading, mark unread messages (from others) as read
            const currentUserId = get().currentUser?.id;
            if (currentUserId) {
              const unread = (fetched || []).filter((m: any) => !m.read && m.senderId !== currentUserId);
              if (unread.length > 0) {
                try {
                  await Promise.all(unread.map((m: any) => chatApi.markMessageAsRead(m.id)));
                  // Update local messages to mark as read and clear unread counts for session
                  set((state) => {
                    const updatedMessages = (state.messages[chatId] || []).map((mm: any) => unread.find(u => u.id === mm.id) ? { ...mm, read: true, readAt: new Date() } : mm);
                    const updatedSessions = (state.chatSessions || []).map((s) => s.id === chatId ? { ...s, unreadCount: 0 } : s);
                    return { messages: { ...state.messages, [chatId]: updatedMessages }, chatSessions: updatedSessions };
                  });
                } catch (err) {
                  console.warn('[chat-store] failed to mark messages read:', err);
                }
              }
            }
          } else {
            throw new Error(response.error || 'Failed to load chat messages');
          }
        } catch (error) {
          console.error("Failed to load chat messages:", error);
          set((state) => ({
            isLoadingMessages: { ...state.isLoadingMessages, [chatId]: false },
          }));
          throw error;
        }
      },

      sendMessage: async (chatId: string, content: string) => {
        try {
          let conversationId = chatId;

          // If this is a temp/new conversation id, create the conversation first
          if (chatId.startsWith('new-')) {
            const userId = chatId.replace('new-', '');
            const resp = await chatApi.createConversation(userId);
            console.debug('[chat-store] createConversation response', resp);
            if (resp.success && resp.data) {
              const session = resp.data as ChatSession;
              conversationId = session.id;
              // select the newly created conversation and insert it into sessions locally
              set((state) => ({
                selectedChatId: conversationId,
                chatSessions: [session as ChatSession, ...(state.chatSessions || [])],
                messages: { ...state.messages, [conversationId]: session.messages || [] },
              }));
            } else {
              throw new Error(resp.error || 'Failed to create conversation');
            }
          }

          // Prefer socket path (server saves and broadcasts); fall back to REST
          try {
            const { emitSendMessage, getSocket } = await import('../socket');
            const socket = getSocket();
            if (socket) {
              const senderId = get().currentUser?.id || '';
              emitSendMessage({ senderId, conversationId, content, type: 'TEXT' });

              // optimistic local update
              // If this conversation is with the bot, mark optimistic messages as read locally
              const session = get().chatSessions?.find((s: any) => s.id === conversationId || s.participantId === conversationId || s.participant?.id === conversationId);
              const toBot = session && (session.participantId === 'bot-assistant' || session.participant?.id === 'bot-assistant');
              const optimisticMessage = {
                id: Date.now().toString(),
                senderId,
                content,
                timestamp: new Date(),
                read: !!toBot,
                readAt: toBot ? new Date() : undefined,
              } as any;
              get().addMessage(conversationId, optimisticMessage);
              return;
            }
          } catch (socketErr) {
            // continue to REST fallback
            console.warn('Socket send failed, falling back to REST:', socketErr);
          }

          const response = await apiClient.sendMessage(conversationId, content);
          if (response.success && response.data) {
            get().addMessage(conversationId, response.data);
          } else {
            throw new Error(response.error || 'Failed to send message');
          }
        } catch (error) {
          console.error('Failed to send message:', error);
          throw error;
        }
      },

      createConversation: async (participantId: string, name?: string) => {
        try {
          const response = await chatApi.createConversation(participantId, name);
          console.debug('[chat-store] createConversation (explicit) response', response);
          if (response.success && response.data) {
            const session = response.data as ChatSession;
            // Insert the new conversation into local sessions and select it
            set((state) => ({
              chatSessions: [session as ChatSession, ...(state.chatSessions || [])],
              selectedChatId: session.id,
              messages: { ...state.messages, [session.id]: session.messages || [] },
            }));
            try { joinConversation(session.id); } catch (err) { console.warn('joinConversation failed', err); }
          } else {
            throw new Error(response.error || 'Failed to create conversation');
          }
        } catch (error) {
          console.error("Failed to create conversation:", error);
          throw error;
        }
      },
    }),
    {
      name: "chat-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        // Persist only a subset of the store:
        // - messages and users: useful to cache recent data
        // - ui flags: searchQuery, showContactPanel
        // - aiTyping map
        // Do NOT persist chatSessions (conversations) or any auth tokens.
        const sanitizedUser = state.currentUser ? { ...state.currentUser } : null;
        if (sanitizedUser && (sanitizedUser as any).token) delete (sanitizedUser as any).token;
        return {
          // Do NOT persist messages or chatSessions to avoid stale/large state
          allUsers: state.allUsers,
          aiTyping: state.aiTyping,
          searchQuery: state.searchQuery,
          showContactPanel: state.showContactPanel,
          isAuthenticated: state.isAuthenticated,
          currentUser: sanitizedUser,
        };
      },
      // After rehydration, validate stored token and refresh currentUser if needed
      onRehydrateStorage: () => (state) => {
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
          const tryRefresh = async () => {
            try {
              const refreshed = await apiClient.refresh();
              if (refreshed.success && refreshed.data) {
                const data = refreshed.data as any;
                if (data.token) {
                  localStorage.setItem('auth_token', data.token);
                }
                const user = data.user || (data as any).user;
                set({ isAuthenticated: true, currentUser: user, authChecked: true });
                return true;
              }
            } catch (err) {
              // ignore
            }
            // refresh failed
            localStorage.removeItem('auth_token');
            set({ isAuthenticated: false, currentUser: null, authChecked: true });
            return false;
          };

          if (!token) {
            // Try refresh via httpOnly cookie
            tryRefresh();
            return;
          }

          if (isJwtExpired(token)) {
            // token expired: remove it and try refresh
            localStorage.removeItem('auth_token');
            tryRefresh();
            return;
          }

          // token valid: ensure we have currentUser; if not, fetch /auth/me
          if (!get().currentUser) {
            apiClient.getCurrentUser().then((resp) => {
              if (resp.success && resp.data) {
                const user = (resp.data as any).user || resp.data;
                set({ isAuthenticated: true, currentUser: user, authChecked: true });
              } else {
                // server didn't accept token: clear
                localStorage.removeItem('auth_token');
                set({ isAuthenticated: false, currentUser: null, authChecked: true });
              }
            }).catch(() => {
              localStorage.removeItem('auth_token');
              set({ isAuthenticated: false, currentUser: null, authChecked: true });
            });
          } else {
            // we have a user rehydrated — ensure flag is set
            set({ isAuthenticated: true, authChecked: true });
          }
        } catch (err) {
          console.warn('onRehydrateStorage error', err);
        }
      },
    },
  ),
);

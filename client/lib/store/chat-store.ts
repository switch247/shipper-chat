import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, Message, ChatSession } from "../types";
import { apiClient } from "../api/client";
import { toast } from '@/hooks/use-toast';

interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  logout: () => void;
  setCurrentUser: (user: User) => void;
  checkAuth: () => Promise<void>;
}

interface ChatStore extends AuthState {
  selectedChatId: string | null;
  chatSessions: ChatSession[];
  allUsers: User[];
  onlineUsers: Set<string>;
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
      currentUser: null,

      // Chat state
      selectedChatId: null,
      chatSessions: [],
      allUsers: [],
      onlineUsers: new Set(),
      messages: {},
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

      checkAuth: async () => {
        try {
          const response = await apiClient.getCurrentUser();
          if (response.success && response.data) {
            set({
              isAuthenticated: true,
              currentUser: response.data,
            });
          } else {
            set({
              isAuthenticated: false,
              currentUser: null,
            });
          }
        } catch (error) {
          set({
            isAuthenticated: false,
            currentUser: null,
          });
        }
      },
      logout: () => {
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

      setCurrentUser: (user) => set({ currentUser: user }),

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
          const updatedMessages = {
            ...state.messages,
            [chatId]: [...existing, message],
          };

          // 2. Update the session list (lastMessage and order)
          const updatedSessions = [...state.chatSessions];
          const sessionIndex = updatedSessions.findIndex(
            (s) => s.id === chatId,
          );

          if (sessionIndex !== -1) {
            const session = { ...updatedSessions[sessionIndex] };
            session.lastMessage = message;
            // If message is from others and we are not in this chat, increment unread (basic logic)
            if (
              message.senderId !== state.currentUser?.id &&
              chatId !== state.selectedChatId
            ) {
              session.unreadCount = (session.unreadCount || 0) + 1;
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
            set((state) => ({
              messages: { ...state.messages, [chatId]: response.data || [] },
              isLoadingMessages: { ...state.isLoadingMessages, [chatId]: false },
            }));
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
            const resp = await apiClient.createConversation(userId);
            if (resp.success && resp.data) {
                conversationId = resp.data.id;
                // select the newly created conversation and reload sessions
                set({ selectedChatId: conversationId });
                await get().loadChatSessions();
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
              const optimisticMessage = {
                id: Date.now().toString(),
                senderId,
                content,
                timestamp: new Date(),
                read: false,
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
          const response = await apiClient.createConversation(participantId, name);
          if (response.success && response.data) {
            // Reload sessions to include the new conversation
            await get().loadChatSessions();
            // Select the new conversation
            set({ selectedChatId: response.data.id });
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
      partialize: (state) => ({
        selectedChatId: state.selectedChatId,
        searchQuery: state.searchQuery,
        showContactPanel: state.showContactPanel,        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser,      }),
    },
  ),
);

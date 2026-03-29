'use client';

import { create } from 'zustand';
import { User, Message, ChatSession } from './types';
import { CURRENT_USER } from './mocks/data';

interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setCurrentUser: (user: User) => void;
}

interface ChatStore extends AuthState {
  selectedChatId: string | null;
  chatSessions: ChatSession[];
  onlineUsers: Set<string>;
  messages: Record<string, Message[]>;
  showContactPanel: boolean;
  showNewMessageModal: boolean;
  isLoading: boolean;
  swipedChatId: string | null;
  
  // Chat Actions
  setSelectedChat: (chatId: string | null) => void;
  setChatSessions: (sessions: ChatSession[]) => void;
  setOnlineUsers: (userIds: string[]) => void;
  setMessages: (chatId: string, messages: Message[]) => void;
  addMessage: (chatId: string, message: Message) => void;
  toggleContactPanel: () => void;
  setContactPanelVisible: (visible: boolean) => void;
  setShowNewMessageModal: (show: boolean) => void;
  setSwipedChatId: (chatId: string | null) => void;
  setLoading: (loading: boolean) => void;
  markUserOnline: (userId: string) => void;
  markUserOffline: (userId: string) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  // Auth state
  isAuthenticated: false,
  currentUser: null,
  
  // Chat state
  selectedChatId: null,
  chatSessions: [],
  onlineUsers: new Set(),
  messages: {},
  showContactPanel: false,
  showNewMessageModal: false,
  swipedChatId: null,
  isLoading: false,

  // Auth actions
  login: async (email: string, password: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        set({
          isAuthenticated: true,
          currentUser: {
            ...CURRENT_USER,
            email,
          },
        });
        resolve();
      }, 500);
    });
  },

  signup: async (name: string, email: string, password: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        set({
          isAuthenticated: true,
          currentUser: {
            ...CURRENT_USER,
            name,
            email,
          },
        });
        resolve();
      }, 500);
    });
  },

  logout: () => {
    set({
      isAuthenticated: false,
      currentUser: null,
    });
  },

  setCurrentUser: (user) => set({ currentUser: user }),
  
  setSelectedChat: (chatId) => set({ selectedChatId: chatId }),
  
  setChatSessions: (sessions) => set({ chatSessions: sessions }),
  
  setOnlineUsers: (userIds) => set({ onlineUsers: new Set(userIds) }),
  
  setMessages: (chatId, messages) => 
    set((state) => ({
      messages: { ...state.messages, [chatId]: messages },
    })),
  
  addMessage: (chatId, message) =>
    set((state) => {
      const existing = state.messages[chatId] || [];
      return {
        messages: { ...state.messages, [chatId]: [...existing, message] },
      };
    }),
  
  toggleContactPanel: () => 
    set((state) => ({ showContactPanel: !state.showContactPanel })),
  
  setContactPanelVisible: (visible) => 
    set({ showContactPanel: visible }),
  
  setShowNewMessageModal: (show) => 
    set({ showNewMessageModal: show }),
  
  setSwipedChatId: (chatId) => 
    set({ swipedChatId: chatId }),
  
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
}));

"use client";

import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { useChatStore } from '@/lib/store/chat-store';

export function usePresence() {
  const isAuthenticated = useChatStore((s) => s.isAuthenticated);
  const currentUser = useChatStore((s) => s.currentUser);
  const markUserOnline = useChatStore((s) => s.markUserOnline);
  const markUserOffline = useChatStore((s) => s.markUserOffline);
  const setOnlineUsers = useChatStore((s) => s.setOnlineUsers);
  const setAiTyping = useChatStore((s) => s.setAiTyping);

  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;
    const socket = getSocket();

    socket.emit('join_rooms', currentUser.id);

    const onGetOnline = (userIds: string[]) => {
      setOnlineUsers(userIds || []);
    };

    const onStatusChanged = ({ userId, status }: { userId: string; status: string }) => {
      if (status === 'ONLINE') markUserOnline(userId);
      else markUserOffline(userId);
    };

    const onReceiveMessage = (message: any) => {
      if (message?.conversationId) {
        try {
          useChatStore.getState().addMessage(message.conversationId, message);
          // clear any ai typing indicator for this conversation
          try { const conv = useChatStore.getState().selectedChatId; if (conv) useChatStore.getState().setAiTyping(conv, false); } catch (e) {}
        } catch (err) {
          console.warn('Failed to add received message to store', err);
        }
      }
    };

    const onAiTyping = (payload: { status: 'start' | 'end' }) => {
      try {
        const conv = useChatStore.getState().selectedChatId;
        if (!conv) return;
        const typing = payload?.status === 'start';
        useChatStore.getState().setAiTyping(conv, typing);
      } catch (err) {
        console.warn('Failed to handle ai_typing', err);
      }
    };

    const onMessageRead = (payload: { messageId: string; readerId: string; readAt: string; conversationId?: string }) => {
      try {
        const { messageId, readerId, readAt, conversationId } = payload || {};
        const store = useChatStore.getState();
        if (!conversationId) return;

        // Mark message as read locally if present
        const msgs = store.messages[conversationId] || [];
        const updated = msgs.map((m: any) => (m.id === messageId ? { ...m, read: true, readAt } : m));
        store.setMessages(conversationId, updated as any);

        // Clear unread count for this conversation (regardless of whether it's open)
        store.setChatSessions((store.chatSessions || []).map(s => s.id === conversationId ? { ...s, unreadCount: 0 } : s));
      } catch (err) {
        console.warn('Failed to apply message_read update', err);
      }
    };

    socket.on('getOnlineUsers', onGetOnline);
    socket.on('user_status_changed', onStatusChanged);
    socket.on('receive_message', onReceiveMessage);
    socket.on('message_read', onMessageRead);
    socket.on('ai_typing', onAiTyping);

    // mark ourselves online (in case server expects explicit event)
    socket.emit('user_online', currentUser.id);

    return () => {
      socket.off('getOnlineUsers', onGetOnline);
      socket.off('user_status_changed', onStatusChanged);
      socket.off('receive_message', onReceiveMessage);
      socket.off('message_read', onMessageRead);
      socket.off('ai_typing', onAiTyping);
    };
  }, [isAuthenticated, currentUser, markUserOnline, markUserOffline, setOnlineUsers]);
}

export default usePresence;

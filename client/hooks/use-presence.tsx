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
        } catch (err) {
          console.warn('Failed to add received message to store', err);
        }
      }
    };

    socket.on('getOnlineUsers', onGetOnline);
    socket.on('user_status_changed', onStatusChanged);
    socket.on('receive_message', onReceiveMessage);

    // mark ourselves online (in case server expects explicit event)
    socket.emit('user_online', currentUser.id);

    return () => {
      socket.off('getOnlineUsers', onGetOnline);
      socket.off('user_status_changed', onStatusChanged);
      socket.off('receive_message', onReceiveMessage);
    };
  }, [isAuthenticated, currentUser, markUserOnline, markUserOffline, setOnlineUsers]);
}

export default usePresence;

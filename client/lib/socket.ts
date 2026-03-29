import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = () => {
  if (socket) return socket;

  const url = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
  const token = localStorage.getItem('chat-token');

  socket = io(url, {
    auth: { token },
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected to backend');
  });

  socket.on('disconnect', () => {
    console.log('[Socket] Disconnected from backend');
  });

  return socket;
};

export const joinConversation = (conversationId: string) => {
  const s = getSocket();
  s.emit('join_conversation', conversationId);
};

export const markUserOnline = (userId: string) => {
  const s = getSocket();
  s.emit('user_online', userId);
};

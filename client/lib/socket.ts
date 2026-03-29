import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = () => {
  if (socket) return socket;

  const url = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
  // read the same auth token key used elsewhere
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

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

export const emitSendMessage = (payload: {
  senderId: string;
  conversationId: string;
  content: string;
  type?: 'TEXT' | 'IMAGE' | 'FILE';
  isAI?: boolean;
}) => {
  const s = getSocket();
  s.emit('send_message', payload);
};

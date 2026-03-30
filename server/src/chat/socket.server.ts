import { Server } from 'socket.io';

let ioServer: Server | null = null;

export const setIo = (io: Server) => {
  ioServer = io;
};

export const emitToConversation = (conversationId: string, event: string, payload: any) => {
  try {
    ioServer?.to(conversationId).emit(event, payload);
  } catch (err) {
    console.warn('[SocketServer] emit failed', err);
  }
};

export const getIo = () => ioServer;

export default ioServer;

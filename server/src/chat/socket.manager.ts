import { Server, Socket } from 'socket.io';
import { prisma } from '../lib/prisma.js';

export const socketHandler = (io: Server, socket: Socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // User joins their personal room and active conversation rooms
  socket.on('join_rooms', (userId: string) => {
    socket.join(userId);
    console.log(`[Socket] User ${userId} joined their personal room`);
  });

  socket.on('join_conversation', (conversationId: string) => {
    socket.join(conversationId);
    console.log(`[Socket] Joined conversation: ${conversationId}`);
  });

  // Handle new messages (Broadcast back and save to DB)
  socket.on('send_message', async (data: { 
    senderId: string; 
    conversationId: string; 
    content: string; 
    type?: 'TEXT' | 'IMAGE' | 'FILE';
    isAI?: boolean;
  }) => {
    const { senderId, conversationId, content, type = 'TEXT', isAI = false } = data;

    try {
      // 1. Save message to DB (Prisma)
      const newMessage = await prisma.message.create({
        data: {
          senderId,
          conversationId,
          content,
          type,
          isAI,
        },
        include: {
          sender: {
            select: { id: true, name: true, avatar: true },
          },
        },
      });

      // 2. Broadcast message to the conversation room
      io.to(conversationId).emit('receive_message', newMessage);

      // 3. Update conversation lastMessageId
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageId: newMessage.id },
      });

      console.log(`[Socket] Message from ${senderId} in ${conversationId}: ${content}`);
    } catch (error) {
      console.error('[Socket] Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle user online/offline status
  socket.on('user_online', async (userId: string) => {
    await prisma.user.update({
      where: { id: userId },
      data: { status: 'ONLINE' },
    });
    io.emit('user_status_changed', { userId, status: 'ONLINE' });
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
};

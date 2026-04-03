import { Server, Socket } from 'socket.io';
import { prisma } from '../lib/prisma.js';
import { enqueueBotResponse } from '../lib/ai.js';

// Map of userId -> set of socketIds
const userSocketMap: Map<string, Set<string>> = new Map();

export const socketHandler = (io: Server, socket: Socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // When a user joins their personal room, track their socket
  socket.on('join_rooms', async (userId: string) => {
    socket.join(userId);
    const set = userSocketMap.get(userId) || new Set();
    set.add(socket.id);
    userSocketMap.set(userId, set);

    // mark user online in DB
    try {
      await prisma.user.update({ where: { id: userId }, data: { status: 'ONLINE' } });
    } catch (err) {
      // ignore if user not found
    }

    io.emit('getOnlineUsers', Array.from(userSocketMap.keys()));
    io.emit('user_status_changed', { userId, status: 'ONLINE' });
    console.log(`[Socket] User ${userId} connected via socket ${socket.id}`);
  });

  socket.on('join_conversation', (conversationId: string) => {
    socket.join(conversationId);
    console.log(`[Socket] Socket ${socket.id} joined conversation: ${conversationId}`);
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
        // 1. Determine if this conversation targets the AI bot and auto-mark read
        let markRead = false;
        try {
          const conv = await prisma.conversation.findUnique({ where: { id: conversationId }, select: { userAId: true, userBId: true } });
          if (conv && (conv.userAId === 'bot-assistant' || conv.userBId === 'bot-assistant')) {
            markRead = true;
          }
        } catch (e) {
          // ignore
        }

        // 1. Save message to DB (Prisma)
        const newMessage = await prisma.message.create({
          data: {
            senderId,
            conversationId,
            content,
            type,
            isAI,
            ...(markRead ? { read: true, readAt: new Date() } : {}),
          },
          include: {
            sender: {
              select: { id: true, name: true, avatar: true },
            },
          },
        });

      // 2. Broadcast message to the conversation room (map to client shape)
      const payload = {
        id: newMessage.id,
        senderId: newMessage.senderId,
        content: newMessage.content,
        timestamp: newMessage.createdAt,
        read: Boolean(newMessage.read),
        readAt: newMessage.readAt || null,
        sender: newMessage.sender,
        conversationId: newMessage.conversationId,
        type: newMessage.type,
        isAI: newMessage.isAI,
      };
      io.to(conversationId).emit('receive_message', payload);

      // If message was auto-marked read (e.g., user->bot), emit a message_read event so clients update unread counts
      if (newMessage.read) {
        io.to(conversationId).emit('message_read', { messageId: newMessage.id, readerId: 'bot-assistant', readAt: newMessage.readAt, conversationId });
      }

      // 3. Update conversation lastMessageId
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageId: newMessage.id },
      });

      // 4. If this conversation involves the AI bot, enqueue a reply task
      try {
        const conv = await prisma.conversation.findUnique({ where: { id: conversationId }, select: { userAId: true, userBId: true } });
        const botId = conv && (conv.userAId === 'bot-assistant' ? conv.userAId : conv.userBId === 'bot-assistant' ? conv.userBId : null);
        if (botId && senderId !== botId) {
          // delegate AI generation to centralized helper (queued)
          enqueueBotResponse(conversationId, senderId);
        }
      } catch (aiErr) {
        console.error('[AI Socket] Error enqueuing bot reply:', aiErr);
      }
      console.log(`[Socket] Message from ${senderId} in ${conversationId}: ${content}`);
    } catch (error) {
      console.error('[Socket] Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('disconnect', async () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);

    // remove socket id from any user sets
    for (const [userId, set] of userSocketMap.entries()) {
      if (set.has(socket.id)) {
        set.delete(socket.id);
        if (set.size === 0) {
          userSocketMap.delete(userId);
          // set DB status offline
          try {
            await prisma.user.update({ where: { id: userId }, data: { status: 'OFFLINE' } });
          } catch (err) {
            // ignore
          }
          io.emit('user_status_changed', { userId, status: 'OFFLINE' });
        } else {
          userSocketMap.set(userId, set);
        }
        break; // socket id belongs to only one user
      }
    }

    io.emit('getOnlineUsers', Array.from(userSocketMap.keys()));
  });
};

// Utility: bring bot user into the online pool when server starts
export const ensureBotOnline = async (io?: Server) => {
  try {
    const bot = await prisma.user.upsert({
      where: { email: 'ai-assistant@shipper-chat.com' },
      update: { status: 'ONLINE', isBot: true },
      create: {
        id: 'bot-assistant',
        name: 'Shipper Bot',
        email: 'ai-assistant@shipper-chat.com',
        isBot: true,
        status: 'ONLINE',
      },
    });

    // Add bot to online map so clients see it as online
    userSocketMap.set(bot.id, new Set(['bot']));
    if (io) io.emit('getOnlineUsers', Array.from(userSocketMap.keys()));
    console.log('[Socket] Shipper Bot is marked online');
  } catch (err) {
    console.error('[Socket] Failed to ensure bot online', err);
  }
};

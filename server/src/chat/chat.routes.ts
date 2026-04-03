import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { emitToConversation } from './socket.server.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Get user conversations
router.get('/conversations', authMiddleware, async (req, res) => {
  const userId = (req as any).user.id;

  try {
    // Fetch conversations where the user is either userA or userB
    const convs = await prisma.conversation.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
      },
      include: {
        userA: { select: { id: true, name: true, avatar: true, status: true } },
        userB: { select: { id: true, name: true, avatar: true, status: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    // Normalize to enriched conversation objects that include participants array and recent messages
    const conversations = convs.map((conv: any) => {
      const participants = [conv.userA, conv.userB].filter(Boolean).map((u: any) => ({ id: u.id, name: u.name, avatar: u.avatar, status: u.status }));
      const otherUser = conv.userA.id === userId ? conv.userB : conv.userA;
      const mappedMessages = conv.messages
        ? conv.messages.map((m: any) => ({ id: m.id, senderId: m.senderId, content: m.content, timestamp: m.createdAt, read: Boolean(m.read), readAt: m.readAt || null })).slice().reverse()
        : [];
      const lastMessage = mappedMessages.length > 0 ? mappedMessages[mappedMessages.length - 1] : null;

      // Compute unread count for this user: messages not read and not sent by this user
      const unreadCount = (conv.messages || []).filter((m: any) => !m.read && m.senderId !== userId).length;

      return {
        id: conv.id,
        name: conv.name || otherUser?.name || 'Chat',
        isGroup: conv.isGroup,
        image: conv.image || null,
        participants,
        participant: otherUser,
        participantId: otherUser?.id,
        lastMessage,
        messages: mappedMessages,
        unreadCount: unreadCount || 0,
      };
    });

    // Sort conversations so the ones with the latest lastMessage come first
    conversations.sort((a: any, b: any) => {
      const at = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() : 0;
      const bt = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() : 0;
      return bt - at;
    });

    return res.status(200).json(conversations);
  } catch (error) {
    console.error('[ChatRoutes] Error fetching conversations:', error);
    return res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get messages for a conversation
router.get('/messages/:id', authMiddleware, async (req, res) => {
  const conversationId = String(req.params.id);

  try {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    });

    // Map Prisma `createdAt` -> `timestamp` and include `read`/`readAt`
    const mapped = messages.map((m: any) => ({
      id: m.id,
      senderId: m.senderId,
      content: m.content,
      timestamp: m.createdAt,
      read: Boolean(m.read),
      readAt: m.readAt || null,
      sender: m.sender,
    }));

    return res.status(200).json(mapped);
  } catch (error) {
    console.error('[ChatRoutes] Error fetching messages:', error);
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Create new conversation
router.post('/conversations', authMiddleware, async (req, res) => {
  const userId = (req as any).user.id;
  const { participantId, name, isGroup = false } = req.body;

  try {
    // For strictly 1:1 (non-group) chats, ensure ordering of ids for uniqueness
    if (!isGroup) {
      if (participantId === userId) return res.status(400).json({ error: 'Cannot create conversation with self' });

      const [a, b] = [userId, participantId].sort();

      // Try to find existing conversation matching the pair
      const existing = await prisma.conversation.findFirst({
        where: { isGroup: false, userAId: a, userBId: b },
        include: {
          userA: { select: { id: true, name: true, avatar: true, status: true } },
          userB: { select: { id: true, name: true, avatar: true, status: true } },
          messages: { orderBy: { createdAt: 'desc' }, take: 10 },
        },
      });
      if (existing) {
        const participants = [existing.userA, existing.userB].filter(Boolean).map((u: any) => ({ id: u.id, name: u.name, avatar: u.avatar, status: u.status }));
        const otherUser = existing.userA.id === userId ? existing.userB : existing.userA;
        const mappedMessages = existing.messages
          ? existing.messages.map((m: any) => ({ id: m.id, senderId: m.senderId, content: m.content, timestamp: m.createdAt, read: Boolean(m.read), readAt: m.readAt || null })).slice().reverse()
          : [];
        const lastMessage = mappedMessages.length > 0 ? mappedMessages[mappedMessages.length - 1] : null;
        return res.status(200).json({
          id: existing.id,
          name: existing.name || otherUser?.name || 'Chat',
          isGroup: existing.isGroup,
          image: existing.image || null,
          participants,
          participant: otherUser,
          participantId: otherUser?.id,
          lastMessage,
          messages: mappedMessages,
          unreadCount: 0,
        });
      }

      try {
        const conversation = await prisma.conversation.create({
          data: {
            name,
            isGroup,
            userAId: a,
            userBId: b,
          },
        });

        // Re-fetch including participant data and recent messages to return enriched object
        const created = await prisma.conversation.findUnique({
          where: { id: conversation.id },
          include: {
            userA: { select: { id: true, name: true, avatar: true, status: true } },
            userB: { select: { id: true, name: true, avatar: true, status: true } },
            messages: { orderBy: { createdAt: 'desc' }, take: 10 },
          },
        });

        if (created) {
          const participants = [created.userA, created.userB].filter(Boolean).map((u: any) => ({ id: u.id, name: u.name, avatar: u.avatar, status: u.status }));
          const otherUser = created.userA.id === userId ? created.userB : created.userA;
          const mappedMessages = created.messages
            ? created.messages.map((m: any) => ({ id: m.id, senderId: m.senderId, content: m.content, timestamp: m.createdAt, read: Boolean(m.read), readAt: m.readAt || null })).slice().reverse()
            : [];
          const lastMessage = mappedMessages.length > 0 ? mappedMessages[mappedMessages.length - 1] : null;
          return res.status(201).json({
            id: created.id,
            name: created.name || otherUser?.name || 'Chat',
            isGroup: created.isGroup,
            image: created.image || null,
            participants,
            participant: otherUser,
            participantId: otherUser?.id,
            lastMessage,
            messages: mappedMessages,
            unreadCount: 0,
          });
        }
      } catch (err: any) {
        // Handle unique constraint race: another request may have created the
        // same 1:1 conversation concurrently. If so, return the existing one.
        if (err?.code === 'P2002') {
          const existingAfterRace = await prisma.conversation.findFirst({
            where: { isGroup: false, userAId: a, userBId: b },
            include: {
              userA: { select: { id: true, name: true, avatar: true, status: true } },
              userB: { select: { id: true, name: true, avatar: true, status: true } },
              messages: { orderBy: { createdAt: 'desc' }, take: 10 },
            },
          });
          if (existingAfterRace) {
            const participants = [existingAfterRace.userA, existingAfterRace.userB].filter(Boolean).map((u: any) => ({ id: u.id, name: u.name, avatar: u.avatar, status: u.status }));
            const otherUser = existingAfterRace.userA.id === userId ? existingAfterRace.userB : existingAfterRace.userA;
            const mappedMessages = existingAfterRace.messages
              ? existingAfterRace.messages.map((m: any) => ({ id: m.id, senderId: m.senderId, content: m.content, timestamp: m.createdAt, read: Boolean(m.read), readAt: m.readAt || null })).slice().reverse()
              : [];
            const lastMessage = mappedMessages.length > 0 ? mappedMessages[mappedMessages.length - 1] : null;
            return res.status(200).json({
              id: existingAfterRace.id,
              name: existingAfterRace.name || otherUser?.name || 'Chat',
              isGroup: existingAfterRace.isGroup,
              image: existingAfterRace.image || null,
              participants,
              participant: otherUser,
              participantId: otherUser?.id,
              lastMessage,
              messages: mappedMessages,
              unreadCount: 0,
            });
          }
        }
        throw err;
      }
    }

    // Groups are not supported in the simplified model, but keep a fallback
    return res.status(400).json({ error: 'Group chats are not supported' });
  } catch (error) {
    console.error('[ChatRoutes] Error creating conversation:', error);
    return res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Create (send) a message via REST fallback
router.post('/messages', authMiddleware, async (req, res) => {
  const userId = (req as any).user.id;
  const { conversationId, content, type = 'TEXT', isAI = false } = req.body;

  try {
    // Basic validation
    if (!conversationId) return res.status(400).json({ error: 'Missing conversationId' });

    // If this conversation includes the AI bot, mark user->bot messages as read (bot auto-reads)
    let markRead = false;
    try {
      const conv = await prisma.conversation.findUnique({ where: { id: conversationId }, select: { userAId: true, userBId: true } });
      if (conv && (conv.userAId === 'bot-assistant' || conv.userBId === 'bot-assistant')) {
        markRead = true;
      }
    } catch (e) {
      // ignore and proceed without auto-read
    }

    const newMessage = await prisma.message.create({
      data: {
        senderId: userId,
        conversationId,
        content,
        type,
        isAI,
        ...(markRead ? { read: true, readAt: new Date() } : {}),
      },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    });

    // Update conversation lastMessageId
    await prisma.conversation.update({ where: { id: conversationId }, data: { lastMessageId: newMessage.id } });

    // Map message to the shape expected by clients (include `timestamp`)
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

    // Emit to conversation room with mapped payload
    emitToConversation(conversationId, 'receive_message', payload);

    // If message was auto-marked read, also emit message_read so clients update unread counts
    if (newMessage.read) {
      emitToConversation(conversationId, 'message_read', { messageId: newMessage.id, readerId: 'bot-assistant', readAt: newMessage.readAt, conversationId });
    }

    return res.status(201).json({
      id: newMessage.id,
      senderId: newMessage.senderId,
      content: newMessage.content,
      timestamp: newMessage.createdAt,
      read: Boolean(newMessage.read),
      readAt: newMessage.readAt || null,
      sender: newMessage.sender,
    });
  } catch (error) {
    console.error('[ChatRoutes] Error sending message via REST:', error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark message as read
router.put('/messages/:id/read', authMiddleware, async (req, res) => {
  const messageId = String(req.params.id);
  const userId = (req as any).user.id;

  try {
    const existing = await prisma.message.findUnique({ where: { id: messageId } });
    if (!existing) return res.status(404).json({ error: 'Message not found' });

    // If already read, return success
    if (existing.read) return res.status(200).json({ success: true });

    const updated = await prisma.message.update({ where: { id: messageId }, data: { read: true, readAt: new Date() } });

    // Emit read event to conversation room so clients can update unread counts
    emitToConversation(updated.conversationId, 'message_read', { messageId: updated.id, readerId: userId, readAt: updated.readAt, conversationId: updated.conversationId });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[ChatRoutes] Error marking message read:', error);
    return res.status(500).json({ error: 'Failed to mark message as read' });
  }
});


// Get all users (for chat functionality)
router.get('/users', authMiddleware, async (req, res) => {
  const userId = (req as any).user.id;

  try {
    const users = await prisma.user.findMany({
      where: {
        id: { not: userId }, // Exclude current user
        // isBot: false, // Exclude bots
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        status: true,
      },
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error('[ChatRoutes] Error fetching users:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user contact info
router.get('/users/:userId/contact-info', authMiddleware, async (req, res) => {
  const { userId } = req.params;
  const currentUserId = (req as any).user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        status: true,
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Return ContactInfo-shaped payload expected by the frontend
    // If CONTACT_INFO_MOCK is set to 'true' return some sample media/links/docs
    const useMock = process.env.CONTACT_INFO_MOCK === 'true';

    const sampleMedia = [
      { id: 'm1', type: 'image', title: 'Screenshot 1', url: 'https://picsum.photos/seed/m1/800/800', thumbnail: 'https://picsum.photos/seed/m1/160/160', uploadedAt: new Date() },
      { id: 'm2', type: 'document', title: 'Receipt', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', thumbnail: 'https://picsum.photos/seed/m2/160/160', uploadedAt: new Date() },
    ];

    const sampleLinks = [
      { id: 'l1', title: 'Shipment Manifest', url: 'https://picsum.photos/600' },
      { id: 'l2', title: 'Tracking', url: 'https://www.example.com' },
    ];

    const sampleDocs = [
      { id: 'd1', title: 'Invoice.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    ];

    return res.status(200).json({
      user,
      media: useMock ? sampleMedia : [],
      links: useMock ? sampleLinks : [],
      docs: useMock ? sampleDocs : [],
    });
  } catch (error) {
    console.error('[ChatRoutes] Error fetching user contact info:', error);
    return res.status(500).json({ error: 'Failed to fetch user contact info' });
  }
});

export default router;

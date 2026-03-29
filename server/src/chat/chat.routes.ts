import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get user conversations
router.get('/conversations', authMiddleware, async (req, res) => {
  const userId = (req as any).user.id;

  try {
    const participants = await prisma.participant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            participants: {
              include: { user: { select: { id: true, name: true, avatar: true, status: true } } },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    const conversations = participants.map((p: any) => {
      const conv = p.conversation;
      const otherParticipant = conv.participants.find((part: any) => part.userId !== userId);
      return {
        id: conv.id,
        name: conv.name || otherParticipant?.user.name || 'Group Chat',
        isGroup: conv.isGroup,
        participant: otherParticipant?.user,
        lastMessage: conv.messages[0],
        unreadCount: 0, // Mock for now, can be calculated from lastReadAt
      };
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

    return res.status(200).json(messages);
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
    // Check if 1:1 conversation already exists
    if (!isGroup) {
      const existing = await prisma.conversation.findFirst({
        where: {
          isGroup: false,
          participants: { every: { userId: { in: [userId, participantId] } } },
        },
      });
      if (existing) return res.status(200).json(existing);
    }

    const conversation = await prisma.conversation.create({
      data: {
        name,
        isGroup,
        participants: {
          create: [{ userId }, { userId: participantId }],
        },
      },
    });

    return res.status(201).json(conversation);
  } catch (error) {
    console.error('[ChatRoutes] Error creating conversation:', error);
    return res.status(500).json({ error: 'Failed to create conversation' });
  }
});


// Get all users (for chat functionality)
router.get('/users', authMiddleware, async (req, res) => {
  const userId = (req as any).user.id;

  try {
    const users = await prisma.user.findMany({
      where: {
        id: { not: userId }, // Exclude current user
        isBot: false, // Exclude bots
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

    return res.status(200).json(user);
  } catch (error) {
    console.error('[ChatRoutes] Error fetching user contact info:', error);
    return res.status(500).json({ error: 'Failed to fetch user contact info' });
  }
});

export default router;

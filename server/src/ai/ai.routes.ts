import { Router } from 'express';
import { streamText, generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// AI Chatbot integrated with Vercel AI SDK
router.post('/chat', authMiddleware, async (req, res) => {
  const { conversationId, content } = req.body;
  const userId = (req as any).user.id;

  try {
    // 1. Save user's message
    const userMsg = await prisma.message.create({
      data: {
        content,
        senderId: userId,
        conversationId,
        type: 'TEXT',
      },
    });

    // 2. Get conversation history to provide context
    const history = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const messages = history.reverse().map((msg: any) => ({
      role: msg.senderId === userId ? 'user' : ('assistant' as const),
      content: msg.content || '',
    }));

    // 3. Generate AI response using Google Gemini (Vercel AI SDK)
    const { text } = await generateText({
      model: google('gemini-1.5-pro'),
      system: 'You are a helpful logistics and shipping assistant for ShipperChat. Help users with cargo tracking, fleet management, and shipping paperwork.',
      messages: messages as any,
    });

    // 4. Save Bot's response
    // First, ensure a Bot user exists (or use a specific ID)
    const botUser = await prisma.user.upsert({
      where: { email: 'ai-assistant@shipper-chat.com' },
      update: {},
      create: {
        id: 'bot-assistant',
        name: 'AI Logistics Bot',
        email: 'ai-assistant@shipper-chat.com',
        isBot: true,
        status: 'ONLINE',
      },
    });

    const botMsg = await prisma.message.create({
      data: {
        content: text,
        senderId: botUser.id,
        conversationId,
        isAI: true,
        type: 'TEXT',
      },
    });

    return res.status(200).json(botMsg);
  } catch (error) {
    console.error('[AI] Error generating response:', error);
    return res.status(500).json({ error: 'AI processing failed' });
  }
});

export default router;

import { Router } from 'express';
import { streamText, generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '@/middleware/auth';

const router = Router();

// Create or get a conversation between current user and the AI bot
router.post('/start', authMiddleware, async (req, res) => {
  const userId = (req as any).user.id;

  try {
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

    // Try to find existing 1:1 conversation between user and bot
    const existing = await prisma.conversation.findFirst({
      where: {
        isGroup: false,
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: botUser.id } } },
        ],
      },
      include: { participants: true },
    });

    if (existing) return res.status(200).json(existing);

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        name: 'AI Assistant',
        isGroup: false,
        participants: {
          create: [{ userId }, { userId: botUser.id }],
        },
      },
    });

    return res.status(201).json(conversation);
  } catch (error) {
    console.error('[AI] Error starting AI conversation:', error);
    return res.status(500).json({ error: 'Failed to start AI conversation' });
  }
});

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

    // 3. Generate AI response using Google Gemini (try cheapest available model)
    const preferred = process.env.GEMINI_MODEL_PREFERRED; // allow override

    // Candidate Gemini model ids (include 2.x variants). The exact available IDs depend
    // on the Google AI Studio / Gemini account and SDK version. We'll try preferred first,
    // then a list of likely 2.x model ids. If those fail, fall back to a non-Google model
    // (e.g. 'gpt-4o-mini') so the feature still works while the environment is adjusted.
    const geminiCandidates = preferred
      ? [preferred]
      : [
          'gemini-2.5-flash',
          'gemini-2.1-pro',
          'gemini-2.0-flash',
          'gemini-2.0-pro',
        ];

    let aiText: string | null = null;
    let lastErr: any = null;

    // Try Gemini models via the Google provider
    for (const modelName of geminiCandidates) {
      try {
        const result = await generateText({
          model: google(modelName),
          system: 'You are a helpful logistics and shipping assistant for ShipperChat. Help users with cargo tracking, fleet management, and shipping paperwork.',
          messages: messages as any,
        });

        if (result?.text) {
          aiText = result.text;
          break;
        }
      } catch (err) {
        lastErr = err;
        console.warn(`[AI] model ${modelName} failed, trying next:`, err?.message || err);
        continue;
      }
    }

    // If Gemini attempts all failed, try a fallback model (non-Google) so the feature remains usable.
    if (!aiText) {
      const fallbackCandidates = ['gpt-4o-mini', 'gpt-4o'];
      for (const fb of fallbackCandidates) {
        try {
          const result = await generateText({
            model: fb as any,
            system: 'You are a helpful logistics and shipping assistant for ShipperChat. Help users with cargo tracking, fleet management, and shipping paperwork.',
            messages: messages as any,
          });
          if (result?.text) {
            aiText = result.text;
            break;
          }
        } catch (err) {
          lastErr = err;
          console.warn(`[AI] fallback model ${fb} failed:`, err?.message || err);
          continue;
        }
      }
    }

    if (!aiText) {
      console.error('[AI] All model attempts failed', lastErr);
      // Provide actionable guidance to the operator
      const guidance = 'Ensure your AI SDK and Google provider packages are up-to-date and set GEMINI_MODEL_PREFERRED to a supported Gemini 2.x model id (or provide OPENAI credentials to use a fallback model).';
      console.error('[AI] Guidance:', guidance);
      throw lastErr || new Error('No AI model available. ' + guidance);
    }

    const text = aiText;

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

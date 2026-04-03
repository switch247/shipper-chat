import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { prisma } from './prisma.js';
import { emitToConversation } from '../chat/socket.server.js';

type Task = () => Promise<void>;

const queues: Map<string, Task[]> = new Map();
const processing: Set<string> = new Set();
let globalActive = 0;
const GLOBAL_LIMIT = Number(process.env.AI_CONCURRENCY_LIMIT || 4);

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function enqueueBotResponse(conversationId: string, originatingSenderId: string) {
  const task: Task = async () => {
    // Notify clients that AI is typing
    try {
      emitToConversation(conversationId, 'ai_typing', { status: 'start' });

      // Build short history for context
      const history = await prisma.message.findMany({ where: { conversationId }, orderBy: { createdAt: 'desc' }, take: 10 });
      const messages = history
        .slice()
        .reverse()
        .map((m: any) => ({ role: m.senderId === originatingSenderId ? 'user' : 'assistant', content: m.content || '' }));

      const preferred = process.env.GEMINI_MODEL_PREFERRED;
      const geminiCandidates = preferred
        ? [preferred]
        : ['gemini-2.5-flash', 'gemini-2.1-pro', 'gemini-2.0-flash', 'gemini-2.0-pro'];

      let aiText: string | null = null;
      let lastErr: any = null;
      for (const modelName of geminiCandidates) {
        try {
          const result = await generateText({
            model: google(modelName),
            system: 'You are a friendly assistant and companion for ShipperChat users. Be helpful, conversational, and supportive while assisting with logistics, cargo tracking, fleet management, and shipping paperwork.',
            messages: messages as any,
          });
          if (result?.text) {
            aiText = result.text;
            break;
          }
        } catch (err) {
          lastErr = err;
          console.warn(`[AI] model ${modelName} failed, trying next:`, (err as any)?.message || err);
          continue;
        }
      }

      if (!aiText) {
        console.error('[AI] All model attempts failed', lastErr);
        emitToConversation(conversationId, 'ai_error', { error: 'AI unavailable' });
        return;
      }

      const botUser = await prisma.user.upsert({
        where: { email: 'ai-assistant@shipper-chat.com' },
        update: {},
        create: { id: 'bot-assistant', name: 'Shipper Bot', email: 'ai-assistant@shipper-chat.com', isBot: true, status: 'ONLINE' },
      });

      const botMsg = await prisma.message.create({
        data: { content: aiText, senderId: botUser.id, conversationId, isAI: true, type: 'TEXT' },
        include: { sender: { select: { id: true, name: true, avatar: true } } },
      });

      await prisma.conversation.update({ where: { id: conversationId }, data: { lastMessageId: botMsg.id } });

      const payload = {
        id: botMsg.id,
        senderId: botMsg.senderId,
        content: botMsg.content,
        timestamp: botMsg.createdAt,
        read: Boolean(botMsg.read),
        readAt: botMsg.readAt || null,
        sender: botMsg.sender,
        conversationId: botMsg.conversationId,
        type: botMsg.type,
        isAI: botMsg.isAI,
      };

      // small delay to simulate typing rhythm (optional)
      await sleep(200);

      emitToConversation(conversationId, 'ai_typing', { status: 'end' });
      emitToConversation(conversationId, 'receive_message', payload);
    } catch (err) {
      console.error('[AI helper] Error handling bot response:', err);
      emitToConversation(conversationId, 'ai_error', { error: String(err) });
    } finally {
      globalActive = Math.max(0, globalActive - 1);
    }
  };

  const q = queues.get(conversationId) || [];
  q.push(task);
  queues.set(conversationId, q);
  processQueue(conversationId).catch((e) => console.error('[AI helper] processQueue error', e));
}

async function processQueue(conversationId: string) {
  if (processing.has(conversationId)) return;
  processing.add(conversationId);
  try {
    while ((queues.get(conversationId) || []).length > 0) {
      if (globalActive >= GLOBAL_LIMIT) {
        // wait a bit before retrying
        await sleep(200);
        continue;
      }

      const next = queues.get(conversationId)!.shift()!;
      globalActive++;
      try {
        await next();
      } catch (err) {
        console.error('[AI helper] task error', err);
      }
    }
  } finally {
    processing.delete(conversationId);
  }
}

export function clearQueue(conversationId: string) {
  queues.delete(conversationId);
}

export default { enqueueBotResponse, clearQueue };

'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { sendAIMessage, startAIConversation, getChatMessages } from '@/lib/api/chat';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    // initial empty, will load from server
  ]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start or get AI conversation on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const conv = await startAIConversation();
        if (!mounted) return;
        if (conv?.id) {
          setConversationId(conv.id);
          // load existing messages if any
          try {
            const msgs: any[] = await getChatMessages(conv.id);
            const mapped = msgs.map((m) => ({
              id: m.id,
              role: m.senderId === 'bot-assistant' || m.isAI ? 'assistant' : 'user',
              content: m.content,
              timestamp: new Date(m.createdAt || m.timestamp || Date.now()),
            }));
            setMessages(mapped);
          } catch (err) {
            // ignore load errors
            console.warn('[AI] could not load messages', err);
          }
        }
      } catch (err) {
        console.error('[AI] start conversation failed', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (!conversationId) {
        throw new Error('No AI conversation available');
      }
      const botMsg: any = await sendAIMessage(conversationId, input);
      if (botMsg) {
        const assistantMessage: Message = {
          id: botMsg.id || Date.now().toString(),
          role: 'assistant',
          content: botMsg.content || botMsg.text || '',
          timestamp: new Date(botMsg.createdAt || Date.now()),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (err) {
      console.error('[AI] send failed', err);
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, the AI request failed. Please try again later.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border rounded-t-lg bg-muted/30 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--primary)] flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-[var(--primary-foreground)]" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">Chat with AI</h1>
          <p className="text-xs text-muted-foreground">Powered by advanced AI models</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-md rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'bg-muted text-foreground'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-border rounded-b-lg bg-muted/30">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-[var(--primary)] hover:bg-[var(--primary)] text-[var(--primary-foreground)]"
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

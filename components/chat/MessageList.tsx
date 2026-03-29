'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/lib/types';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 mx-4 rounded-2xl">
        <p className="text-muted-foreground text-sm">No messages yet. Start a conversation!</p>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-6 py-4 space-y-2 bg-slate-300 mx-4 rounded-2xl my-4"
    >
      {messages.map((message) => {
        const isSent = message.senderId === currentUserId;

        // Group messages by date
        const messageDate = new Date(message.timestamp).toLocaleDateString();
        const today = new Date().toLocaleDateString();
        return (
          <div key={message.id}>
            <MessageBubble
              message={message}
              isSent={isSent}
            />
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}

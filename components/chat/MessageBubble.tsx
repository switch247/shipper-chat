'use client';

import { Message } from '@/lib/types';
import { Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isSent: boolean;
  senderName?: string;
}

export function MessageBubble({ message, isSent, senderName }: MessageBubbleProps) {
  const formattedTime = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className={`flex w-full ${isSent ? 'justify-end' : 'justify-start'} gap-2 mb-2`}>
      <div className="flex flex-col gap-1 max-w-xs">
        <div
          className={`px-4 py-2 rounded-2xl break-words ${
            isSent
              ? 'bg-[var(--chat-sent-bg)] text-[var(--chat-sent-text)]'
              : 'bg-[var(--chat-received-bg)] text-[var(--chat-received-text)]'
          }`}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
        <div className={`flex items-center gap-1 px-2 text-xs text-[var(--chat-time-color)]`}>
          <span>{formattedTime}</span>
          {isSent && (
            message.read ? (
              <CheckCheck className="w-3 h-3 text-[var(--chat-sent-bg)]" />
            ) : (
              <Check className="w-3 h-3 text-[var(--chat-sent-bg)]" />
            )
          )}
        </div>
      </div>
    </div>
  );
}

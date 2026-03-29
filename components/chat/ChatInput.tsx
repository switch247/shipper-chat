'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Smile, Paperclip, Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-6 py-4 border-t border-gray-200 bg-white mx-4 mb-4 rounded-b-2xl flex gap-3 items-center">
      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground"
      >
        <Paperclip className="w-5 h-5" />
      </Button>

      <Input
        placeholder="Type any message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled}
        className="flex-1 h-10 px-4 rounded-full bg-input border border-input text-foreground placeholder:text-muted-foreground"
      />

      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground"
      >
        <Smile className="w-5 h-5" />
      </Button>

      <Button
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        className="h-9 w-9 p-0 bg-[var(--primary)] hover:bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full flex-shrink-0"
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
}

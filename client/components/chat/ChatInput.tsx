'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Smile, Paperclip, Send, Mic } from 'lucide-react';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
    <div className="px-1 py-2 bg-white flex gap-3 items-center shrink-0 rounded-lg relative">
      <div className="flex-1 relative">
        <Input
          placeholder="Type any message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          className="flex-1 h-10 px-4 pr-32 rounded-full border border-input text-foreground placeholder:text-muted-foreground"
        />

        {/* Tooltips positioned inside the input field on the right */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => toast.info('Attachments coming soon!')}
                >
                  <Paperclip className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Attach file</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => toast.info('Voice messages coming soon!')}
                >
                  <Mic className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Voice message</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => toast.info('Emoji picker coming soon!')}
                >
                  <Smile className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add emoji</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleSend}
                  disabled={disabled || !message.trim()}
                  className="h-6 w-6 p-0 bg-primary hover:bg-primary text-primary-foreground rounded-full flex-shrink-0"
                >
                  <Send className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send message</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}

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
    <div className="flex pt-2 items-center gap-3 w-full">
      <div className="flex-1 relative">
        <Input
          placeholder="Write a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          className="w-full rounded-[100px] border border-[#E8E5DF] h-10 pl-4 pr-1 py-3 text-xs placeholder:text-[#8796AF]"
        />

        {/* Tooltips positioned inside the input field on the right */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 rounded-lg border border-[#E8E5DF] bg-white p-0 text-[#8796AF] hover:text-[#262626]"
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
                  className="w-8 h-8 rounded-lg border border-[#E8E5DF] bg-white p-0 text-[#8796AF] hover:text-[#262626]"
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
                  className="w-8 h-8 rounded-lg border border-[#E8E5DF] bg-white p-0 text-[#8796AF] hover:text-[#262626]"
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
                  className="w-9 h-9 p-0 bg-[#1E9A80] hover:bg-[#167a63] text-white rounded-[100px] flex-shrink-0 flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
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

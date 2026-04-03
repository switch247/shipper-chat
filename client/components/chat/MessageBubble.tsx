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
      {isSent ? (
        <div className="flex flex-col justify-center items-end gap-1 w-full min-w-0">
          <div className="flex p-3 items-start gap-2.5 rounded-xl bg-[#F0FDF4] max-w-[70%] min-w-0 overflow-hidden">
            <p className="whitespace-pre-wrap break-words break-all max-w-full w-full text-[#111625] font-inter text-sm leading-6 text-left">{message.content}</p>
          </div>
          <button className="cursor-pointer text-nowrap flex pt-1 justify-center items-center gap-1.5 w-fit">
            {message.read ? (
              <CheckCheck className="w-3.5 h-3.5 text-[#1E9A80]" />
            ) : (
              <Check className="w-3.5 h-3.5 text-[#1E9A80]" />
            )}
            <p className="line-clamp-1 overflow-hidden text-[#8B8B8B] text-ellipsis font-inter text-xs leading-4 w-fit">{formattedTime}</p>
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-1 w-full min-w-0">
          <div className="flex p-3 items-start gap-2.5 rounded-xl bg-[#FFF] max-w-[70%] min-w-0 overflow-hidden">
            <p className="whitespace-pre-wrap break-words break-all max-w-full w-full text-[#1C1C1C] font-inter text-sm leading-6 text-left">{message.content}</p>
          </div>
          <button className="cursor-pointer text-nowrap flex pt-1 justify-center items-center gap-2.5 w-fit">
            <p className="line-clamp-1 overflow-hidden text-[#8B8B8B] text-ellipsis font-inter text-xs leading-4 w-fit">{formattedTime}</p>
          </button>
        </div>
      )}
    </div>
  );
}

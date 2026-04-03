"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/lib/types";
import { MessageBubble } from "./MessageBubble";
import { useChatStore } from "@/lib/store/chat-store";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  emptyText?: string;
  isLoading?: boolean;
}

export function MessageList({
  messages,
  currentUserId,
  emptyText,
  isLoading = false,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevCount = useRef<number>(messages.length);
  const { currentUser } = useChatStore();
  const storeCurrentUserId = currentUser?.id;
  const selectedChatId = useChatStore((s) => s.selectedChatId);
  const aiTyping = useChatStore((s) => s.aiTyping[(s.selectedChatId || '')] || false);
  console.debug("[MessageList] rendering with messages", {
    currentUser: currentUser || null,
    messages,
    currentUserId,
    storeCurrentUserId,
  });
    useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100; // 100px threshold

      // If message count increased and this MessageList is for the currently selected conversation,
      // always scroll to show the new message (user is focused on this convo).
      if (messages.length > prevCount.current) {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      } else if (atBottom) {
        // Otherwise preserve existing behavior: auto-scroll only if user already near bottom
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }

      prevCount.current = messages.length;
    }, [messages]);
  
    // Debug: log sizes so we can verify the scroll container dimensions in the browser console
    useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;
      const log = () => console.debug('[MessageList] sizes', { scrollHeight: el.scrollHeight, clientHeight: el.clientHeight, scrollTop: el.scrollTop });
      log();
      window.addEventListener('resize', log);
      return () => window.removeEventListener('resize', log);
    }, []);

  if (messages.length === 0) {
    const text = emptyText ?? "No messages yet.";
    if (isLoading) {
      return (
        <div className="flex-1 flex items-center justify-center bg-[#F3F3EE] rounded-2xl p-3">
          <p className="text-[#8B8B8B] text-sm">Loading messages…</p>
        </div>
      );
    }
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F3F3EE] rounded-2xl p-3">
        <p className="text-[#8B8B8B] text-sm">{text}</p>
      </div>
    );
  }

  // Simple grouping by day for a centered date separator
  const grouped: Record<string, typeof messages> = {};
  messages.forEach((m) => {
    const parsed = new Date(m.timestamp);
    const date = isNaN(parsed.getTime()) ? "Sending" : parsed.toDateString();
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(m);
  });

  return (
    <div
      ref={scrollRef}
      // -[#F3F3EE]
        style={{ height: '100%', overscrollBehavior: 'auto', WebkitOverflowScrolling: 'touch' as any }}
      className="bg-[#F3F3EE] flex-1 overflow-y-auto no-scrollbar px-3 rounded-2xl justify-end gap-3 min-h-0"
    >
      {Object.keys(grouped).map((date) => (
        <div key={date} className="flex flex-col gap-3">
          <div className="self-center py-1 px-3 rounded-[60px] bg-white text-sm font-medium text-[#596881]">
            {date === new Date().toDateString() ? "Today" : date}
          </div>
          {grouped[date].map((message) => {
            // Determine sent messages robustly: prefer prop, fall back to store current user
            const effectiveCurrent = currentUserId || storeCurrentUserId;
            const isSent =
              String(message.senderId) === String(effectiveCurrent) ||
              String(message.sender?.id) === String(effectiveCurrent);
            return (
              // <div key={message.id}>
              <MessageBubble key={message.id}  message={message} isSent={isSent} />
              // </div> 
            );
          })}
        </div>
      ))}
      {aiTyping && (
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-gray-200" />
          <div className="text-sm text-[#596881] italic">AI is typing…</div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

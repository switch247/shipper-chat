'use client';

import { ChatSession, User } from '@/lib/types';
import { UserListItem } from './UserListItem';

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentUser: User;
  selectedChatId?: string | null;
  onlineUsers: Set<string>;
  onSelectChat: (chatId: string) => void;
  onNewMessage: () => void;
}

export function ChatSidebar({
  sessions,
  currentUser,
  selectedChatId,
  onlineUsers,
  onSelectChat,
}: ChatSidebarProps) {
  if (sessions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        No conversations
      </div>
    );
  }

  return (
    <div className="space-y-2 p-3 bg-gray-50 flex-1 overflow-y-auto">
      {sessions.map((session) => (
        <UserListItem
          key={session.id}
          session={session}
          isSelected={selectedChatId === session.id}
          isUserOnline={onlineUsers.has(session.participantId)}
          onClick={() => onSelectChat(session.id)}
        />
      ))}
    </div>
  );
}

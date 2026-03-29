'use client';

import { ChatSession, User } from '@/lib/types';
import { UserListItem } from './UserListItem';
import { useChatStore } from '@/lib/store/chat-store';

interface ChatSidebarProps {
  sessions: ChatSession[];
  allUsers: User[];
  selectedChatId?: string | null;
  onlineUsers: Set<string>;
  onSelectChat: (chatId: string) => void;
  onNewMessage: () => void;
  isLoadingSessions?: boolean;
  isLoadingUsers?: boolean;
}

export function ChatSidebar({
  sessions,
  allUsers,
  selectedChatId,
  onlineUsers,
  onSelectChat,
  isLoadingSessions = false,
  isLoadingUsers = false,
}: ChatSidebarProps) {
  const { currentUser } = useChatStore();

  // Show loading skeleton if loading sessions or users
  if (isLoadingSessions || isLoadingUsers) {
    return (
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex gap-4 p-2">
            <div className="w-12 h-12 rounded-xl bg-muted animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2 min-w-0">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Show loading state if current user is not loaded yet
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Please log in
      </div>
    );
  }

  // Filter out current user from all users with null check
  const availableUsers = allUsers.filter(user => user && user.id && user.name && user.id !== currentUser?.id);

  if (availableUsers.length === 0 && !isLoadingSessions && !isLoadingUsers) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        No users available
      </div>
    );
  }

  return (
    <div className="space-y-2 p-3 bg-white flex-1 overflow-y-auto">
      {availableUsers.map((user) => {
        // Find if there's an existing conversation with this user
        const existingSession = sessions.find(session => session.participantId === user.id);

        return (
          <UserListItem
            key={user.id}
            user={user}
            session={existingSession}
            isSelected={selectedChatId === existingSession?.id || selectedChatId === `new-${user.id}`}
            isUserOnline={onlineUsers.has(user.id)}
            onClick={() => {
              if (existingSession) {
                onSelectChat(existingSession.id);
              } else {
                // For new conversations, we might need to create one
                // For now, we'll just select a temporary ID
                onSelectChat(`new-${user.id}`);
              }
            }}
          />
        );
      })}
    </div>
  );
}

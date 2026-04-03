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
  const store = useChatStore();

  // Show loading skeleton if loading sessions or users
  if (isLoadingSessions || isLoadingUsers) {
    return (
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex gap-3 p-2">
            <div className="w-10 h-10 rounded-[40px] bg-[#F8F8F5] animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2 min-w-0">
              <div className="h-3 bg-[#E8E5DF] rounded animate-pulse" />
              <div className="h-2 bg-[#E8E5DF] rounded animate-pulse w-3/4" />
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

  // Primary view: render conversations/sessions (server provides enriched sessions)
  if ((!sessions || sessions.length === 0) && (!allUsers || allUsers.length === 0)) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        No conversations yet
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2 w-full">
      {sessions && sessions.length > 0 ? (
        sessions.map((session) => (
          <UserListItem
            key={session.id}
            session={session}
            isSelected={selectedChatId === session.id}
            isUserOnline={onlineUsers.has(session.participant?.id || session.participantId)}
            onClick={() => {
              onSelectChat(session.id);
            }}
            onContactInfo={() => {
              onSelectChat(session.id);
              store.setContactPanelVisible(true);
            }}
          />
        ))
      ) : (
        // Fallback: render available users so user can start new conversations via the sidebar
        (() => {
          const fallback = (allUsers || [])
            .filter((user) => user && user.id && user.name && user.id !== currentUser?.id)
            .sort((a, b) => {
              // Pin bot-assistant to the top if present
              if (a.id === 'bot-assistant') return -1;
              if (b.id === 'bot-assistant') return 1;
              return a.name.localeCompare(b.name);
            });
          return fallback.map((user) => {
            const existingSession = sessions.find(s => s.participantId === user.id);
            return (
              <UserListItem
                key={user.id}
                user={user}
                session={existingSession}
                isSelected={selectedChatId === existingSession?.id}
                isUserOnline={onlineUsers.has(user.id)}
                onClick={async () => {
                  if (existingSession) {
                    onSelectChat(existingSession.id);
                  } else {
                    try {
                      await store.createConversation(user.id);
                      const sel = store.selectedChatId;
                      if (sel) onSelectChat(sel);
                    } catch (err) {
                      console.error('[ChatSidebar] failed to create conversation', err);
                    }
                  }
                }}
                onContactInfo={async () => {
                  if (existingSession) {
                    onSelectChat(existingSession.id);
                  } else {
                    try {
                      await store.createConversation(user.id);
                      const sel = store.selectedChatId;
                      if (sel) onSelectChat(sel);
                      store.setContactPanelVisible(true);
                    } catch (err) {
                      console.error('[ChatSidebar] failed to create conversation for contact panel', err);
                    }
                  }
                }}
                />
            );
          });
        })()
      )}
    </div>
  );
}

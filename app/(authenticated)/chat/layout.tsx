'use client';

import { useEffect, useState, useRef } from 'react';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { CURRENT_USER, MOCK_USERS } from '@/lib/mocks/data';
import { useChatStore } from '@/lib/store';
import { getChatSessions } from '@/lib/api/chat';
import { ChatSession } from '@/lib/types';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = useChatStore();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadSessions = async () => {
      try {
        const chats = await getChatSessions();
        setSessions(chats);

        const onlineUserIds = MOCK_USERS.filter(u => u.status === 'online').map(u => u.id);
        store.setOnlineUsers(onlineUserIds);

        if (chats.length > 0) {
          store.setSelectedChat(chats[0].id);
          store.setMessages(chats[0].id, chats[0].messages);
        }
      } catch (error) {
        console.error('[v0] Error loading chat sessions:', error);
      } finally {
        setIsLoadingChats(false);
      }
    };

    loadSessions();
  }, []);

  const handleSelectChat = (chatId: string) => {
    store.setSelectedChat(chatId);
    const selectedSession = sessions.find(s => s.id === chatId);
    if (selectedSession) {
      store.setMessages(chatId, selectedSession.messages);
    }
    store.setContactPanelVisible(false);
  };

  const filteredSessions = sessions.filter(session =>
    session.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full flex bg-gray-100 overflow-hidden rounded-2xl gap-3">
      {/* Chat List Sidebar */}
      <div className="w-80 flex flex-col border border-gray-200 bg-white overflow-hidden rounded-2xl shadow-sm">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-semibold text-foreground">All Message</h2>
          <button
            onClick={() => store.setShowNewMessageModal(true)}
            className="px-3 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary)] text-[var(--primary-foreground)] rounded text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Message
          </button>
        </div>

        {isLoadingChats ? (
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex gap-3 p-3">
                <div className="w-12 h-12 rounded-lg bg-muted animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {filteredSessions.length > 0 ? (
              <ChatSidebar
                sessions={filteredSessions}
                currentUser={CURRENT_USER}
                selectedChatId={store.selectedChatId}
                onlineUsers={store.onlineUsers}
                onSelectChat={handleSelectChat}
                onNewMessage={() => store.setShowNewMessageModal(true)}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No conversations found
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col min-w-0 bg-gray-300 rounded-2xl shadow-sm overflow-hidden">
        {children}
      </div>
    </div>
  );
}

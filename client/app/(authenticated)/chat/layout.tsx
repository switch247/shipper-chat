'use client';

import { useEffect, useState, useRef } from 'react';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { CURRENT_USER, MOCK_USERS } from '@/lib/mocks/data';
import { useChatStore } from '@/lib/store';
import { Funnel, WandSparkles } from 'lucide-react';
import { getChatSessions } from '@/lib/api/chat';
import { ChatSession } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = useChatStore();
  const sessions = store.chatSessions;
  const isLoadingChats = store.isLoading;
  const searchQuery = store.searchQuery;
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadSessions = async () => {
      store.setLoading(true);
      try {
        const chats = await getChatSessions();
        store.setChatSessions(chats);

        const onlineUserIds = MOCK_USERS.filter(u => u.status === 'online').map(u => u.id);
        store.setOnlineUsers(onlineUserIds);

        if (chats.length > 0 && !store.selectedChatId) {
          store.setSelectedChat(chats[0].id);
          store.setMessages(chats[0].id, chats[0].messages);
        }
      } catch (error) {
        console.error('[ChatFlow] Error loading chat sessions:', error);
      } finally {
        store.setLoading(false);
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
    <div className="w-full h-full flex bg-input overflow-hidden gap-3 p-4">
      {/* Chat List Sidebar */}
      {/* w-full h-full flex bg-input overflow-hidden gap-3 p-4  */}
      <div className="flex-1 flex flex-col border-r bg-white overflow-hidden shrink-0 rounded-2xl gap-3 p-4 ">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between  bg-background shrink-0">
            <h2 className="text-lg font-semibold text-foreground">All Messages</h2>

            <div
              onClick={() => store.setShowNewMessageModal(true)}
              className=" p-2 h-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg flex items-center justify-between transition-colors"
              title="New Message"
            >
              <WandSparkles className="w-5 h-5" />
              New Message
            </div>
          </div>
          {/* search and filter */}
          <div className='flex gap-2 justify-between'>
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => store.setSearchQuery(e.target.value)}
              className="w-full"
            />
            <Button
              onClick={() => store.setSearchQuery('')}
              className="w-8 h-8  text-primary-foreground rounded-lg flex items-center justify-between transition-colors"
              title="Clear Search"
            >
              <Funnel className="w-5 h-5" />
            </Button>
          </div>
        </div>
        {isLoadingChats ? (
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

      <div className="flex-2 flex flex-col min-w-0 bg-background overflow-hidden rounded-2xl">
        {children}
      </div>
    </div>
  );
}

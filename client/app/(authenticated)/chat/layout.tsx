'use client';

import { useEffect, useRef } from 'react';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { useChatStore } from '@/lib/store/chat-store';
import { Funnel, WandSparkles } from 'lucide-react';
import { NewMessageDropdown } from '@/components/chat/NewMessageDropdown';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = useChatStore();
  const sessions = store.chatSessions;
  const allUsers = store.allUsers;
  const isLoadingSessions = store.isLoadingSessions;
  const isLoadingUsers = store.isLoadingUsers;
  const searchQuery = store.searchQuery;
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (hasLoadedRef.current || !store.currentUser) return;
    hasLoadedRef.current = true;

    const loadData = async () => {
      try {
        // Load both sessions and users in parallel
        await Promise.all([
          store.loadChatSessions(),
          store.loadUsers()
        ]);

        // If we have sessions and no chat is selected, select the first one
        if (sessions.length > 0 && !store.selectedChatId) {
          store.setSelectedChat(sessions[0].id);
          await store.loadChatMessages(sessions[0].id);
        }
      } catch (error) {
        console.error('[ChatFlow] Error loading data:', error);
      }
    };

    loadData();
  }, [store.currentUser]);

  const handleSelectChat = async (chatId: string) => {
    // Check if this is a new conversation (starts with 'new-')
    if (chatId.startsWith('new-')) {
      const userId = chatId.replace('new-', '');
      try {
        await store.createConversation(userId);
      } catch (error) {
        console.error('Failed to create conversation:', error);
        return;
      }
    } else {
      store.setSelectedChat(chatId);
      // Load messages for the selected chat if not already loaded
      if (!store.messages[chatId]) {
        await store.loadChatMessages(chatId);
      }
    }
    store.setContactPanelVisible(false);
  };

  const filteredUsers = allUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full flex bg-input overflow-hidden gap-3 p-4">
      {/* Chat List Sidebar */}
      {/* w-full h-full flex bg-input overflow-hidden gap-3 p-4  */}
      <div className="flex-1 flex flex-col border-r bg-white overflow-hidden shrink-0 rounded-2xl gap-3 p-4 ">
        {/* top side */}
        <div className="flex flex-col gap-3">
          {/* Row 1: Title and New Message button */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">All Messages</h2>
            <NewMessageDropdown
              users={filteredUsers}
              currentUserId={store.currentUser?.id || ''}
              onSelectUser={(userId) => {
                // create or select conversation
                handleSelectChat(`new-${userId}`);
              }}
              trigger={
                <Button
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                  title="New Message"
                >
                  <WandSparkles className="w-4 h-4" />
                  New Message
                </Button>
              }
            />
          </div>

          {/* Row 2: Search input and Clear button */}
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => store.setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={() => store.setSearchQuery('')}
              variant="outline"
              size="icon"
              className="flex-shrink-0"
              title="Clear Search"
            >
              <Funnel className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <ChatSidebar
            sessions={sessions}
            allUsers={filteredUsers}
            selectedChatId={store.selectedChatId}
            onlineUsers={store.onlineUsers}
            onSelectChat={handleSelectChat}
            onNewMessage={() => store.setShowNewMessageModal(true)}
            isLoadingSessions={isLoadingSessions}
            isLoadingUsers={isLoadingUsers}
          />
        </div>
      </div>

      <div className="flex-2 flex flex-col min-w-0 bg-background overflow-hidden rounded-2xl">
        {children}
      </div>
    </div>
  );
}

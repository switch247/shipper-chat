'use client';

import { useEffect, useRef } from 'react';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { useChatStore } from '@/lib/store/chat-store';
import { Funnel, WandSparkles } from 'lucide-react';
import { NewMessageDropdown } from '@/components/chat/NewMessageDropdown';
import { joinConversation } from '@/lib/socket';
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
        // Ensure current user is loaded from the backend so IDs match seeded data
        try {
          await store.checkAuth();
        } catch (err) {
          console.warn('[ChatLayout] checkAuth failed', err);
        }

        await Promise.all([
          store.loadChatSessions(),
          store.loadUsers()
        ]);

        // Do not auto-select a conversation on load. Leave selection empty
        // so users can choose which conversation to open.
      } catch (error) {
        console.error('[ShipperChat] Error loading data:', error);
      }
    };

    loadData();
  }, [store.currentUser]);

  const handleSelectChat = async (chatId: string) => {
    console.debug('[ChatLayout] handleSelectChat called', { chatId, prevSelected: store.selectedChatId });
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
      // Join socket room for this conversation so emits are delivered
      try {
        joinConversation(chatId);
      } catch (err) {
        console.warn('[ChatLayout] joinConversation failed', err);
      }

      // Load messages for the selected chat if not already loaded
      if (!store.messages[chatId]) {
        console.debug('[ChatLayout] loading messages for', chatId);
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
    <div className="w-full h-full flex overflow-hidden gap-3 px-0 pt-4">
      {/* Chat List Sidebar */}
      {/* w-full h-full flex bg-input overflow-hidden gap-3 p-4  */}
      <div className="w-[400px] flex flex-col shrink-0 bg-white overflow-hidden rounded-2xl gap-3 p-6">
        {/* top side */}
        <div className="flex flex-col gap-3">
          {/* Row 1: Title and New Message button */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#111625]">All Messages</h2>
            <NewMessageDropdown
              users={filteredUsers}
              currentUserId={store.currentUser?.id || ''}
              onSelectUser={async (userId) => {
                // create or select conversation immediately
                try {
                  await store.createConversation(userId);
                  const sel = store.selectedChatId;
                  if (sel) await handleSelectChat(sel);
                } catch (err) {
                  console.error('[ChatLayout] failed to create conversation from NewMessageDropdown', err);
                }
              }}
              trigger={
                <Button
                  className="flex items-center gap-1.5 bg-[#1E9A80] rounded-lg h-8 px-3 text-white"
                  title="New Message"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-[18px] h-[18px] overflow-hidden relative "
                  >
                    <path
                      d="M10.125 4.875L13.125 7.875M12 13.5H15M13.5 12V15M6 15L13.875 7.12504C14.072 6.92806 14.2282 6.69421 14.3348 6.43684C14.4415 6.17947 14.4963 5.90362 14.4963 5.62504C14.4963 5.34647 14.4415 5.07062 14.3348 4.81325C14.2282 4.55588 14.072 4.32203 13.875 4.12504C13.678 3.92806 13.4442 3.77181 13.1868 3.6652C12.9294 3.55859 12.6536 3.50372 12.375 3.50372C12.0964 3.50372 11.8206 3.55859 11.5632 3.6652C11.3058 3.77181 11.072 3.92806 10.875 4.12504L3 12V15H6Z"
                      stroke="white"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {/* <WandSparkles className="w-4 h-4" /> */}
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
              className="h-10 rounded-[10px] border border-[#E8E5DF] pl-3"
            />
            <Button
              onClick={() => store.setSearchQuery('')}
              className="w-10 h-10 rounded-[10px] border border-[#E8E5DF] bg-white flex-shrink-0 text-black"
              title="Clear Search"
            >
              <Funnel className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* <div className="flex-1 overflow-y-auto no-scrollbar"> */}
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
        {/* </div> */}
      </div>

      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-white rounded-3xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useChatStore } from '@/lib/store';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { ContactInfoPanel } from '@/components/chat/ContactInfoPanel';
import { NewMessageModal } from '@/components/chat/NewMessageModal';
import { ContactInfo } from '@/lib/types';
import { sendMessage, getContactInfoForUser, getUsers } from '@/lib/api/chat';
import { CURRENT_USER, MOCK_USERS } from '@/lib/mocks/data';

export default function ChatPage() {
  const store = useChatStore();
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [allUsers, setAllUsers] = useState([]);

  // Load all users for new message modal
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await getUsers();
        setAllUsers(users);
      } catch (error) {
        console.error('[v0] Error loading users:', error);
      }
    };
    loadUsers();
  }, []);

  // Load contact info when chat is selected
  useEffect(() => {
    if (store.selectedChatId && store.showContactPanel) {
      const loadContactInfo = async () => {
        try {
          const info = await getContactInfoForUser(store.selectedChatId!);
          setContactInfo(info);
        } catch (error) {
          console.error('[v0] Error loading contact info:', error);
        }
      };
      loadContactInfo();
    }
  }, [store.selectedChatId, store.showContactPanel]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!store.selectedChatId) return;

    try {
      const newMessage = await sendMessage(store.selectedChatId, content);
      store.addMessage(store.selectedChatId, newMessage);
    } catch (error) {
      console.error('[v0] Error sending message:', error);
    }
  }, [store]);

  const handleContactInfoClick = async () => {
    if (!store.selectedChatId) return;

    try {
      const info = await getContactInfoForUser(store.selectedChatId);
      setContactInfo(info);
      store.setContactPanelVisible(true);
    } catch (error) {
      console.error('[v0] Error loading contact info:', error);
    }
  };

  const selectedChatId = store.selectedChatId;
  const currentMessages = store.messages[selectedChatId || ''] || [];

  if (!selectedChatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-muted-foreground text-lg">Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  const participant = MOCK_USERS.find(u => u.id === selectedChatId) || {
    id: selectedChatId || '',
    name: 'Unknown User',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedChatId}`,
    email: 'user@example.com',
    status: 'offline' as const,
  };

  return (
    <div className=" rounded-2xl p-4 flex-1 flex flex-col bg-white overflow-hidden">
      {/* <div className=" rounded-2xl flex-1 flex flex-col h-full"> */}

      <ChatHeader
        user={participant}
        isOnline={store.onlineUsers.has(selectedChatId || '')}
        onContactInfoClick={handleContactInfoClick}
        onMenuAction={(action) => {
          if (action === 'contact-info') {
            handleContactInfoClick();
          }
        }}
      />
      <MessageList
        messages={currentMessages}
        currentUserId={CURRENT_USER.id}
      />
      <ChatInput onSendMessage={handleSendMessage} />
      {/* </div > */}

      {store.showContactPanel && contactInfo && (
        <ContactInfoPanel
          contactInfo={contactInfo}
          onClose={() => store.setContactPanelVisible(false)}
        />
      )}

      <NewMessageModal
        open={store.showNewMessageModal}
        onOpenChange={store.setShowNewMessageModal}
        users={allUsers}
        currentUserId={CURRENT_USER.id}
        onSelectUser={(userId) => {
          store.setSelectedChat(userId);
          store.setShowNewMessageModal(false);
        }}
      />
    </div>
  );
}

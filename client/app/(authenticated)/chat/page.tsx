'use client';

import { useEffect, useState, useCallback } from 'react';
import { useChatStore } from '@/lib/store/chat-store';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { ContactInfoPanel } from '@/components/chat/ContactInfoPanel';
import { NewMessageModal } from '@/components/chat/NewMessageModal';
import { ContactInfo } from '@/lib/types';
import { getContactInfoForUser, getUsers } from '@/lib/api/chat';

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

  // Load contact info when chat is selected (fetch by participant user id)
  useEffect(() => {
    if (store.selectedChatId && store.showContactPanel) {
      const loadContactInfo = async () => {
        try {
          const chatSession = store.chatSessions.find(session => session.id === store.selectedChatId);
          const userId = chatSession?.participant?.id;
          if (!userId) return;

          const info = await getContactInfoForUser(userId);
          setContactInfo(info);
        } catch (error) {
          console.error('[v0] Error loading contact info:', error);
        }
      };
      loadContactInfo();
    }
  }, [store.selectedChatId, store.showContactPanel, store.chatSessions]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!store.selectedChatId) return;

    try {
      await store.sendMessage(store.selectedChatId, content);
    } catch (error) {
      console.error('[v0] Error sending message:', error);
    }
  }, [store]);

  const handleContactInfoClick = async (userId?: string) => {
    try {
      let idToFetch = userId;

      if (!idToFetch) {
        if (!store.selectedChatId) return;
        const chatSession = store.chatSessions.find(session => session.id === store.selectedChatId);
        if (!chatSession?.participant) return;
        idToFetch = chatSession.participant.id;
      }

      const info = await getContactInfoForUser(idToFetch!);
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
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 bg-[#F3F3EE] rounded-2xl flex items-center justify-center">
          <div className="w-full max-w-3xl text-center px-6">
            <p className="text-sm text-[#596881] mb-2">No conversation selected</p>
            <p className="text-lg font-medium text-[#111625]">Select a conversation to start messaging</p>
          </div>
        </div>
      </div>
    );
  }

  // Try to find the session by conversation id OR by participant id (handles mock vs real API shape)
  const chatSession = store.chatSessions.find(session => session.id === selectedChatId || session.participantId === selectedChatId || session.participant?.id === selectedChatId);
  const participant = chatSession?.participant;

  // If there's no participant (IDs mismatch or no session), render the MessageList area
  // (no header or input) so the right pane matches the regular chat view sizing.
  if (!participant) {
    return (
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        <MessageList
            messages={[]}
            currentUserId={store.currentUser?.id || ''}
            emptyText="Select a conversation to start messaging"
          />
      </div>
    );
  }

  // Use participant.id (user id) for online lookups; fallback to selectedChatId for messages map
  const participantIdForOnline = chatSession?.participant?.id || participant.id || selectedChatId || '';
  const messageKey = chatSession?.id || selectedChatId || participantIdForOnline;

  return (
    <div className=" rounded-2xl p-4 flex-1 flex flex-col bg-white overflow-hidden min-h-0">
      {/* <div className=" rounded-2xl flex-1 flex flex-col h-full"> */}

      <ChatHeader
        user={participant}
        isOnline={store.onlineUsers.has(participantIdForOnline)}
        onContactInfoClick={handleContactInfoClick}
        onMenuAction={(action) => {
          if (action === 'contact-info') {
            handleContactInfoClick();
          }
        }}
      />
      <MessageList
        messages={store.messages[messageKey] || currentMessages}
        isLoading={Boolean(store.isLoadingMessages[messageKey])}
        emptyText="No messages yet. Send the first message."
        currentUserId={store.currentUser?.id || ''}
      />
      <ChatInput onSendMessage={handleSendMessage} />
      {/* </div > */}

      {contactInfo && (
        <ContactInfoPanel
          contactInfo={contactInfo}
          isOpen={Boolean(store.showContactPanel)}
          onClose={() => store.setContactPanelVisible(false)}
        />
      )}

      <NewMessageModal
        open={store.showNewMessageModal}
        onOpenChange={store.setShowNewMessageModal}
        users={allUsers}
        currentUserId={store.currentUser?.id || ''}
        onSelectUser={async (userId) => {
          try {
            await store.createConversation(userId);
          } catch (error) {
            console.error('Failed to create conversation from NewMessageModal:', error);
          } finally {
            store.setShowNewMessageModal(false);
          }
        }}
      />
    </div>
  );
}

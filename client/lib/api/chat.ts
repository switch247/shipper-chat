import { User, ChatSession, Message, ContactInfo } from '../types';
import * as mocks from '../mocks/data';
import { apiClient } from './client';

// Allow enabling mocks via environment variable
const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

// Use shared apiClient for consistent headers/retries/timeouts
// apiClient lives in ./client and exposes typed methods returning { data, success, error }

/**
 * Get all users for the chat sidebar
 */
export async function getUsers(): Promise<User[]> {
  if (MOCK_MODE) return [mocks.CURRENT_USER, ...mocks.MOCK_USERS];
  const resp = await apiClient.getUsers();
  if (!resp.success) throw new Error(resp.error || 'Failed to fetch users');
  return resp.data || [];
}

/**
 * Get chat sessions for the sidebar
 */
export async function getChatSessions(): Promise<ChatSession[]> {
  if (MOCK_MODE) return mocks.MOCK_USERS.map((_, index) => mocks.createChatSession(mocks.MOCK_USERS[index].id, index));
  const resp = await apiClient.getChatSessions();
  if (!resp.success) throw new Error(resp.error || 'Failed to fetch chat sessions');
  return resp.data || [];
}

/**
 * Get messages for a specific chat
 */
export async function getChatMessages(chatId: string): Promise<Message[]> {
  if (MOCK_MODE) return mocks.createChatSession(chatId, 0).messages;
  const resp = await apiClient.getChatMessages(chatId);
  if (!resp.success) throw new Error(resp.error || 'Failed to fetch chat messages');
  return resp.data || [];
}

/**
 * Send a new message
 */
export async function sendMessage(chatId: string, content: string): Promise<Message> {
  if (MOCK_MODE) return {
    id: Date.now().toString(),
    senderId: 'current-user',
    content,
    timestamp: new Date(),
    read: false,
  } as any;
  const resp = await apiClient.sendMessage(chatId, content);
  if (!resp.success) throw new Error(resp.error || 'Failed to send message');
  return resp.data as Message;
}

/**
 * Mark message as read
 */
export async function markMessageAsRead(messageId: string): Promise<void> {
  if (MOCK_MODE) return;
  const resp = await apiClient.put(`/chat/messages/${messageId}/read` as any);
  if (!resp.success) throw new Error(resp.error || 'Failed to mark message as read');
}

/**
 * Get contact information for a user
 */
export async function getContactInfoForUser(userId: string): Promise<ContactInfo> {
  if (MOCK_MODE) {
    const user = mocks.MOCK_USERS.find(u => u.id === userId) || mocks.MOCK_USERS[0];
    return mocks.getContactInfo(user);
  }
  const resp = await apiClient.getContactInfo(userId);
  if (!resp.success) throw new Error(resp.error || 'Failed to fetch contact info');
  return resp.data as ContactInfo;
}

/**
 * Start or get a 1:1 conversation with the AI assistant
 */
export async function startAIConversation(): Promise<any> {
  if (MOCK_MODE) return null;
  const resp = await apiClient.post('/ai/start');
  if (!resp.success) throw new Error(resp.error || 'Failed to start AI conversation');
  return resp.data;
}

/**
 * Archive a chat
 */
export async function archiveChat(chatId: string): Promise<void> {
  if (MOCK_MODE) return;
  const resp = await apiClient.put(`/chat/conversations/${chatId}/archive` as any);
  if (!resp.success) throw new Error(resp.error || 'Failed to archive chat');
}

/**
 * AI Chat interaction
 */
export async function sendAIMessage(chatId: string, content: string): Promise<Message> {
  const resp = await apiClient.post('/ai/chat', { conversationId: chatId, content });
  if (!resp.success) throw new Error(resp.error || 'Failed to send AI message');
  return resp.data as Message;
}

/**
 * Create a 1:1 conversation (or return existing) with a participant
 * Returns an object shaped like an ApiResponse for parity with other callers
 */
export async function createConversation(participantId: string, name?: string): Promise<{ success: boolean; data?: ChatSession; error?: string }> {
  try {
    if (MOCK_MODE) {
      const index = mocks.MOCK_USERS.findIndex(u => u.id === participantId);
      const session = mocks.createChatSession(participantId, index >= 0 ? index : 0);
      return { success: true, data: session };
    }
    // Use the shared apiClient which returns a normalized ApiResponse<T>
    const resp = await apiClient.createConversation(participantId, name);
    return { success: resp.success, data: resp.data as ChatSession, error: resp.error };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to create conversation' };
  }
}

import { User, ChatSession, Message, ContactInfo } from '../types';
import * as mocks from '../mocks/data';

const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function authenticatedFetch(url: string, options: RequestInit = {}) {
  if (MOCK_MODE) return null; // Logic will switch to mock call below
  const token = localStorage.getItem('chat-token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'API Request failed');
  }

  return response.json();
}

/**
 * Get all users for the chat sidebar
 */
export async function getUsers(): Promise<User[]> {
  if (MOCK_MODE) return [mocks.CURRENT_USER, ...mocks.MOCK_USERS];
  return authenticatedFetch('/chat/users'); 
}

/**
 * Get chat sessions for the sidebar
 */
export async function getChatSessions(): Promise<ChatSession[]> {
  if (MOCK_MODE) return mocks.MOCK_USERS.map((_, index) => mocks.createChatSession(mocks.MOCK_USERS[index].id, index));
  return authenticatedFetch('/chat/conversations');
}

/**
 * Get messages for a specific chat
 */
export async function getChatMessages(chatId: string): Promise<Message[]> {
  if (MOCK_MODE) return mocks.createChatSession(chatId, 0).messages;
  return authenticatedFetch(`/chat/messages/${chatId}`);
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
  };
  return authenticatedFetch('/chat/messages', {
    method: 'POST',
    body: JSON.stringify({ conversationId: chatId, content }),
  });
}

/**
 * Mark message as read
 */
export async function markMessageAsRead(messageId: string): Promise<void> {
  if (MOCK_MODE) return;
  return authenticatedFetch(`/chat/messages/${messageId}/read`, {
    method: 'PATCH',
  });
}

/**
 * Get contact information for a user
 */
export async function getContactInfoForUser(userId: string): Promise<ContactInfo> {
  if (MOCK_MODE) {
    const user = mocks.MOCK_USERS.find(u => u.id === userId) || mocks.MOCK_USERS[0];
    return mocks.getContactInfo(user);
  }
  return authenticatedFetch(`/chat/users/${userId}/contact-info`);
}

/**
 * Archive a chat
 */
export async function archiveChat(chatId: string): Promise<void> {
  if (MOCK_MODE) return;
  return authenticatedFetch(`/chat/conversations/${chatId}/archive`, {
    method: 'PATCH',
  });
}

/**
 * AI Chat interaction
 */
export async function sendAIMessage(chatId: string, content: string): Promise<Message> {
  return authenticatedFetch('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ conversationId: chatId, content }),
  });
}

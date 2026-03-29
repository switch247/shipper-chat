import { MOCK_USERS, CURRENT_USER, createChatSession, getContactInfo } from '../mocks/data';
import { User, ChatSession, Message, ContactInfo } from '../types';

/**
 * TODO: Replace with real API calls to backend
 * Expected endpoints:
 * - GET /api/users
 * - GET /api/chats/:userId/messages
 * - POST /api/messages
 * - GET /api/users/:userId/contact-info
 */

// Simulate network delay
const DELAY = 300;

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get all users for the chat sidebar
 * TODO: Implement with real API: GET /api/users
 */
export async function getUsers(): Promise<User[]> {
  await delay(DELAY);
  return [CURRENT_USER, ...MOCK_USERS];
}

/**
 * Get chat sessions for the sidebar
 * TODO: Implement with real API: GET /api/chats
 */
export async function getChatSessions(): Promise<ChatSession[]> {
  await delay(DELAY);
  return MOCK_USERS.map((_, index) => createChatSession(MOCK_USERS[index].id, index));
}

/**
 * Get messages for a specific chat
 * TODO: Implement with real API: GET /api/chats/:userId/messages
 */
export async function getChatMessages(userId: string): Promise<Message[]> {
  await delay(DELAY);
  // In a real app, you'd fetch messages from the backend
  const session = createChatSession(userId, 0);
  return session.messages;
}

/**
 * Send a new message
 * TODO: Implement with real API: POST /api/messages
 */
export async function sendMessage(chatId: string, content: string): Promise<Message> {
  await delay(DELAY);
  return {
    id: Date.now().toString(),
    senderId: 'current-user',
    content,
    timestamp: new Date(),
    read: false,
  };
}

/**
 * Mark message as read
 * TODO: Implement with real API: PATCH /api/messages/:messageId/read
 */
export async function markMessageAsRead(messageId: string): Promise<void> {
  await delay(DELAY);
  // Mark message as read in backend
}

/**
 * Get contact information for a user
 * TODO: Implement with real API: GET /api/users/:userId/contact-info
 */
export async function getContactInfoForUser(userId: string): Promise<ContactInfo> {
  await delay(DELAY);
  const user = MOCK_USERS.find(u => u.id === userId) || MOCK_USERS[0];
  return getContactInfo(user);
}

/**
 * Archive a chat
 * TODO: Implement with real API: PATCH /api/chats/:chatId/archive
 */
export async function archiveChat(chatId: string): Promise<void> {
  await delay(DELAY);
  // Archive chat in backend
}

/**
 * Delete a chat
 * TODO: Implement with real API: DELETE /api/chats/:chatId
 */
export async function deleteChat(chatId: string): Promise<void> {
  await delay(DELAY);
  // Delete chat in backend
}

/**
 * Mute a chat
 * TODO: Implement with real API: PATCH /api/chats/:chatId/mute
 */
export async function muteChat(chatId: string): Promise<void> {
  await delay(DELAY);
  // Mute chat in backend
}

/**
 * Search messages
 * TODO: Implement with real API: GET /api/chats/:chatId/messages/search
 */
export async function searchMessages(chatId: string, query: string): Promise<Message[]> {
  await delay(DELAY);
  const session = createChatSession(chatId, 0);
  return session.messages.filter(m => 
    m.content.toLowerCase().includes(query.toLowerCase())
  );
}

/**
 * Clear chat history
 * TODO: Implement with real API: DELETE /api/chats/:chatId/messages
 */
export async function clearChatHistory(chatId: string): Promise<void> {
  await delay(DELAY);
  // Clear chat history in backend
}

/**
 * Export chat
 * TODO: Implement with real API: GET /api/chats/:chatId/export
 */
export async function exportChat(chatId: string): Promise<string> {
  await delay(DELAY);
  return `Chat export for ${chatId}`;
}

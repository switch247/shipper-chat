export type UserStatus = 'online' | 'offline' | 'away';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: UserStatus;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface ChatSession {
  id: string;
  participantId: string;
  participant: User;
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'document';
  title: string;
  url: string;
  thumbnail?: string;
  uploadedAt: Date;
}

export interface Link {
  id: string;
  title: string;
  url: string;
  description?: string;
}

export interface ContactInfo {
  user: User;
  media: MediaItem[];
  links: Link[];
  docs: MediaItem[];
}

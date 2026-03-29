import { User, Message, ChatSession, MediaItem, Link, ContactInfo } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Adrian Kurt',
    email: 'adrian@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    status: 'online',
  },
  {
    id: '2',
    name: 'Yomi Immanuel',
    email: 'yomi@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    status: 'online',
  },
  {
    id: '3',
    name: 'Bianca Nubia',
    email: 'bianca@example.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    status: 'offline',
  },
  {
    id: '5',
    name: 'Palmer Dian',
    email: 'palmer@example.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop',
    status: 'online',
  },
  {
    id: '6',
    name: 'Yuki Tanaka',
    email: 'yuki@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    status: 'offline',
  },
  {
    id: '7',
    name: 'Daniel CH',
    email: 'daniel@example.com',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop',
    status: 'online',
  },
];

export const CURRENT_USER: User = {
  id: 'current-user',
  name: 'You',
  email: 'you@example.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
  status: 'online',
};

export const MOCK_MESSAGES: Record<string, Message[]> = {
  '1': [
    {
      id: '1',
      senderId: '1',
      content: 'Hey, did you check the updated design tokens for the shipping platform?',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: true,
    },
    {
      id: '2',
      senderId: 'current-user',
      content: "Not yet! I'm currently finishing up the warehouse integration task.",
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
      read: true,
    },
    {
      id: '3',
      senderId: '1',
      content: 'No problem! Just let me know when you have time to review. The colors in Figma seem a bit dark.',
      timestamp: new Date(Date.now() - 20 * 60 * 1000),
      read: true,
    },
    {
      id: '4',
      senderId: 'current-user',
      content: 'Got it. I will review it in about an hour. Thanks, Adrian!',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: true,
    },
  ],
  '2': [
    {
      id: '1',
      senderId: '2',
      content: 'Can you please review the manifest for Flight 104? There seems to be a discrepancy in the gross weight.',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      read: false,
    },
    {
      id: '2',
      senderId: 'current-user',
      content: "On it! I'm double-checking the scale bridge logs now.",
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      read: true,
    },
    {
      id: '3',
      senderId: '2',
      content: 'Any updates? The ground handling crew is waiting to start loading.',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      read: false,
    },
  ],
  '3': [
    {
      id: '1',
      senderId: '3',
      content: "The cargo for the New York shipment has been cleared by Customs. We are ready for pickup! 🚚",
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      read: true,
    },
    {
      id: '2',
      senderId: 'current-user',
      content: 'Perfect. I will dispatch the truck from the depot immediately.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: true,
    },
  ],
  '4': [
    {
      id: '1',
      senderId: '4',
      content: 'The insurance documents for the fragile crates are missing the signature from the inspector.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true,
    },
  ],
};

export const MEDIA_ITEMS: MediaItem[] = [
  {
    id: '1',
    type: 'image',
    title: 'Design Preview',
    url: 'https://images.unsplash.com/photo-1579546929662-711aa33e3ff0?w=300&h=300&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1579546929662-711aa33e3ff0?w=100&h=100&fit=crop',
    uploadedAt: new Date(),
  },
  {
    id: '2',
    type: 'image',
    title: 'Project Mockup',
    url: 'https://images.unsplash.com/photo-1557672172-298e090d0f80?w=300&h=300&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1557672172-298e090d0f80?w=100&h=100&fit=crop',
    uploadedAt: new Date(),
  },
  {
    id: '3',
    type: 'image',
    title: 'Color Palette',
    url: 'https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=300&h=300&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=100&h=100&fit=crop',
    uploadedAt: new Date(),
  },
  {
    id: '4',
    type: 'image',
    title: 'UI Components',
    url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=300&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=100&h=100&fit=crop',
    uploadedAt: new Date(),
  },
  {
    id: '5',
    type: 'image',
    title: 'Frontend Design',
    url: 'https://images.unsplash.com/photo-1546034954-c86d8eac01c2?w=300&h=300&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1546034954-c86d8eac01c2?w=100&h=100&fit=crop',
    uploadedAt: new Date(),
  },
  {
    id: '6',
    type: 'image',
    title: 'Dashboard',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a775?w=300&h=300&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a775?w=100&h=100&fit=crop',
    uploadedAt: new Date(),
  },
  {
    id: '7',
    type: 'image',
    title: 'Mobile App',
    url: 'https://images.unsplash.com/photo-1512941691920-25bda36dc643?w=300&h=300&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1512941691920-25bda36dc643?w=100&h=100&fit=crop',
    uploadedAt: new Date(),
  },
  {
    id: '8',
    type: 'image',
    title: 'Backend Architecture',
    url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=300&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=100&h=100&fit=crop',
    uploadedAt: new Date(),
  },
];

export const CONTACT_LINKS: Link[] = [
  {
    id: '1',
    title: 'https://basecamp.io/',
    url: 'https://basecamp.io',
  },
  {
    id: '2',
    title: 'https://chatflow.com/',
    url: 'https://chatflow.com',
  },
  {
    id: '3',
    title: 'https://zapata.com/',
    url: 'https://zapata.com',
  },
  {
    id: '4',
    title: 'https://table.com/',
    url: 'https://table.com',
  },
];

export const CONTACT_DOCS: MediaItem[] = [
  {
    id: '1',
    type: 'document',
    title: 'Document Replacement.pdf',
    url: '#',
    uploadedAt: new Date(),
  },
  {
    id: '2',
    type: 'document',
    title: 'User Flow.pdf',
    url: '#',
    uploadedAt: new Date(),
  },
  {
    id: '3',
    type: 'document',
    title: 'Editing App fig',
    url: '#',
    uploadedAt: new Date(),
  },
  {
    id: '4',
    type: 'document',
    title: 'Product Illustrations.ai',
    url: '#',
    uploadedAt: new Date(),
  },
  {
    id: '5',
    type: 'document',
    title: 'Quotation–References–May.pdf',
    url: '#',
    uploadedAt: new Date(),
  },
];

export function createChatSession(userId: string, index: number): ChatSession {
  const user = MOCK_USERS[index];
  const messages = MOCK_MESSAGES[userId] || [];

  return {
    id: userId,
    participantId: userId,
    participant: user,
    messages,
    lastMessage: messages[messages.length - 1],
    unreadCount: messages.filter(m => m.senderId !== 'current-user' && !m.read).length,
  };
}

export function getContactInfo(user: User): ContactInfo {
  return {
    user,
    media: MEDIA_ITEMS,
    links: CONTACT_LINKS,
    docs: CONTACT_DOCS,
  };
}

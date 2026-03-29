import {
  Home,
  MessageCircle,
  Sparkles,
  FolderClosed,
  LayoutGrid,
  User,
  Settings,
} from 'lucide-react';

export const NAV_ITEMS = [
  { icon: Home, label: 'Home', href: '/chat' },
  { icon: MessageCircle, label: 'Messages', href: '/chat' },
  { icon: Sparkles, label: 'Chat with AI', href: '/ai' },
  { icon: FolderClosed, label: 'Files', href: '/files' },
  { icon: LayoutGrid, label: 'Analytics', href: '/analytics' },
];

export const SECONDARY_NAV = [
  { icon: Settings, label: 'Settings', href: '/settings' },
  { icon: User, label: 'Profile', href: '/profile' },
];

export const getNavIcon = (href: string) => {
  const item = NAV_ITEMS.find((i) => i.href === href) || SECONDARY_NAV.find((i) => i.href === href);
  return item?.icon;
};

export const getNavLabel = (href: string) => {
  const item = NAV_ITEMS.find((i) => i.href === href) || SECONDARY_NAV.find((i) => i.href === href);
  return item?.label || 'Dashboard';
};

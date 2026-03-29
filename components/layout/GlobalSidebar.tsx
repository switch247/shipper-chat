'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/use-auth';
import { User } from '@/lib/types';
import Image from 'next/image';
import {
  Home,
  MessageSquare,
  MessageCircle,
  Compass,
  FolderClosed,
  LayoutGrid,
  Sparkles,
  LogOut,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function GlobalSidebar() {
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();

  if (!currentUser) return null;

  const isActive = (path: string) => pathname.startsWith(path);

  const navItems = [
    { icon: Home, label: 'Home', href: '/chat' },
    { icon: MessageCircle, label: 'Messages', href: '/chat' },
    { icon: Compass, label: 'Explore', href: '/explore' },
    { icon: FolderClosed, label: 'Files', href: '/files' },
    { icon: LayoutGrid, label: 'Analytics', href: '/analytics' },
  ];

  return (
    <div className="w-20 bg-white rounded-2xl shadow-md flex flex-col items-center justify-between py-4 sticky left-0 top-0">
      {/* Top Section */}
      <div className="flex flex-col items-center gap-6">
        {/* Logo */}
        <Link href="/home" className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
          <MessageSquare className="w-6 h-6" />
        </Link>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-4">
          {navItems.map(({ icon: Icon, label, href, isActive: active }) => (
            <Link
              key={label}
              href={href}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
                }`}
              title={label}
            >
              <Icon className="w-5 h-5" />
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col items-center gap-4">
        {/* AI Assistant */}
        <Link
          href="/ai"
          className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
          title="AI Assistant"
        >
          <Sparkles className="w-5 h-5" />
        </Link>

        {/* Divider */}
        <div className="w-8 h-px bg-border" />

        {/* User Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary hover:opacity-80 transition-opacity flex-shrink-0">
              <Image
                src={currentUser.avatar}
                alt={currentUser.name}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="right" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium text-foreground">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground">{currentUser.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">Preferences</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

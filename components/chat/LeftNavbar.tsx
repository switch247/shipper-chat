'use client';

import { Home, MessageCircle, Settings, Plus, HelpCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface LeftNavbarProps {
  currentUser?: any;
  onNewMessage?: () => void;
}

export function LeftNavbar({ currentUser, onNewMessage }: LeftNavbarProps) {
  return (
    <div className="w-20 h-screen bg-background border-r border-border flex flex-col items-center py-6 gap-4">
      {/* Logo */}
      <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
        <MessageCircle className="w-6 h-6" />
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col items-center gap-4 mt-4">
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-lg text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
          title="Home"
        >
          <Home className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-lg text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
          title="Messages"
        >
          <MessageCircle className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-lg text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
          title="More"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </Button>
      </nav>

      {/* Bottom Items */}
      <div className="flex flex-col items-center gap-4 pb-4">
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-lg text-foreground hover:bg-muted transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </Button>

        {/* Divider */}
        <div className="w-8 h-px bg-border" />

        {/* User Avatar */}
        <button className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary flex-shrink-0 hover:opacity-80 transition-opacity">
          <Image
            src={currentUser?.avatar || '/placeholder.svg?height=40&width=40'}
            alt={currentUser?.name || 'User'}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        </button>
      </div>
    </div>
  );
}

'use client';

import { Search, Bell, Settings, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';

interface TopNavbarProps {
  currentUser?: any;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function TopNavbar({ currentUser, searchQuery = '', onSearchChange }: TopNavbarProps) {
  return (
    <div className="rounded-full h-16 border-b border-border bg-background flex items-center px-6 gap-4">
      {/* Search Bar */}
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search"
          className="pl-10 bg-muted border-none focus-visible:ring-primary"
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
        />
        <kbd className="hidden sm:inline-flex absolute right-3 top-1/2 transform -translate-y-1/2 h-6 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘K</span>
        </kbd>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <Button variant="ghost" size="icon">
          <Bell className="w-5 h-5" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-transparent hover:border-primary">
                <Image
                  src={currentUser?.avatar || '/placeholder.svg?height=32&width=32'}
                  alt={currentUser?.name || 'User'}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center gap-3 px-2 py-2 border-b border-border">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src={currentUser?.avatar || '/placeholder.svg?height=40&width=40'}
                  alt={currentUser?.name || 'User'}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{currentUser?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{currentUser?.email || 'user@example.com'}</p>
              </div>
            </div>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

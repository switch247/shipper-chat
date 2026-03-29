'use client';

import { User } from '@/lib/types';
import { Phone, Video, Search, MoreVertical } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatHeaderProps {
  user: User;
  isOnline?: boolean;
  onContactInfoClick?: () => void;
  onSearch?: () => void;
  onCall?: () => void;
  onVideo?: () => void;
  onMenuAction?: (action: string) => void;
}

export function ChatHeader({
  user,
  isOnline = false,
  onContactInfoClick,
  onSearch,
  onCall,
  onVideo,
  onMenuAction,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white m-4 mb-0 rounded-t-2xl">
      <div className="flex items-center gap-3">
        <Image
          src={user.avatar}
          alt={user.name}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <h2 className="font-semibold text-foreground">{user.name}</h2>
          <p className="text-xs text-muted-foreground">
            {isOnline ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSearch}
          className="h-9 w-9 p-0"
        >
          <Search className="w-5 h-5 text-foreground" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onCall}
          className="h-9 w-9 p-0"
        >
          <Phone className="w-5 h-5 text-foreground" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onVideo}
          className="h-9 w-9 p-0"
        >
          <Video className="w-5 h-5 text-foreground" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0"
            >
              <MoreVertical className="w-5 h-5 text-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => onMenuAction?.('contact-info')}>
              Contact Info
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMenuAction?.('search')}>
              Search in chat
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMenuAction?.('mute')}>
              Mute
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMenuAction?.('archive')}>
              Archive
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMenuAction?.('export')}>
              Export chat
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMenuAction?.('clear')}>
              Clear chat
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onMenuAction?.('delete')}
              className="text-destructive focus:text-destructive"
            >
              Delete chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

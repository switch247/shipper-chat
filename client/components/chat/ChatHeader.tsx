'use client';

import { User } from '@/lib/types';
import { Phone, Video, Search, MoreVertical, Info, Archive, MessageCircleX, Download, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ChatHeaderProps {
  user: User;
  isOnline?: boolean;
  onContactInfoClick?: (userId?: string) => void;
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
  const getAvatarSrc = (avatar: any) => {
    if (!avatar) return '/placeholder-user.jpg';
    if (typeof avatar === 'string') return avatar;
    if (typeof avatar === 'object' && 'src' in avatar) return String(avatar.src);
    return '/placeholder-user.jpg';
  };
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-background shrink-0">
      <div className="flex items-center gap-3">
        <Image
          src={getAvatarSrc(user.avatar)}
          alt={user.name || 'User avatar'}
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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSearch}
                className="h-9 w-9 p-0 bg-gray-50 hover:bg-muted"
              >
                <Search className="w-5 h-5 text-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Search messages</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCall}
                className="h-9 w-9 p-0 bg-gray-50 hover:bg-muted"
              >
                <Phone className="w-5 h-5 text-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Voice call</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onVideo}
                className="h-9 w-9 p-0 bg-gray-50 hover:bg-muted"
              >
                <Video className="w-5 h-5 text-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Video call</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 bg-gray-50 hover:bg-muted"
            >
              <MoreVertical className="w-5 h-5 text-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onContactInfoClick?.(user.id)}>
              <Info className="w-4 h-4 mr-2" />
              <span>Contact Info</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onMenuAction?.('archive')}>
              <Archive className="w-4 h-4 mr-2" />
              <span>Archive</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMenuAction?.('mute')}>
              <MessageCircleX className="w-4 h-4 mr-2" />
              <span>Mute</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onMenuAction?.('export')}>
              <Download className="w-4 h-4 mr-2" />
              <span>Export chat</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMenuAction?.('clear')}>
              <Phone className="w-4 h-4 mr-2" />
              <span>Clear chat</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onMenuAction?.('delete')} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              <span>Delete chat</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

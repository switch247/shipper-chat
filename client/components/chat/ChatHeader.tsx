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
  const getAvatarSrc = (avatar: any, seed?: string) => {
    if (!avatar) return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed || 'unknown'}`;
    if (typeof avatar === 'string') return avatar;
    if (typeof avatar === 'object' && 'src' in avatar) return String(avatar.src);
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed || 'unknown'}`;
  };
  return (
    <div className="flex items-center justify-between pt-1 pr-3 pb-4 pl-3 shrink-0">
      <div className="flex items-center gap-3">
        <Image
          src={getAvatarSrc(user.avatar, user.id)}
          alt={user.name || 'User avatar'}
          width={40}
          height={40}
          className="w-10 h-10 rounded-[1000px] object-cover"
        />
        <div>
          <h2 title={user.name} className="text-sm font-medium text-[#111625] tracking-[-0.006em]">{user.name}</h2>
          <p className="text-xs font-medium text-[#38C793]">{isOnline ? 'Online' : 'Offline'}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSearch}
                className="w-8 h-8 rounded-lg border border-[#E8E5DF] bg-white p-0"
              >
                <Search className="w-4 h-4 text-[#262626]" />
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
                className="w-8 h-8 rounded-lg border border-[#E8E5DF] bg-white p-0"
              >
                <Phone className="w-4 h-4 text-[#262626]" />
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
                className="w-8 h-8 rounded-lg border border-[#E8E5DF] bg-white p-0"
              >
                <Video className="w-4 h-4 text-[#262626]" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Video call</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-8 h-8 rounded-lg border border-[#E8E5DF] bg-white p-0">
              <MoreVertical className="w-4 h-4 text-[#262626]" />
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

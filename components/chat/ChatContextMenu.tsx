'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  EyeOff,
  Archive,
  Volume2,
  Info,
  Download,
  Trash2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatContextMenuProps {
  onMarkAsUnread?: () => void;
  onArchive?: () => void;
  onMute?: () => void;
  onContactInfo?: () => void;
  onExport?: () => void;
  onClear?: () => void;
  onDelete?: () => void;
}

export function ChatContextMenu({
  onMarkAsUnread,
  onArchive,
  onMute,
  onContactInfo,
  onExport,
  onClear,
  onDelete,
}: ChatContextMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onMarkAsUnread} className="gap-2">
          <EyeOff className="w-4 h-4" />
          <span>Mark as unread</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onArchive} className="gap-2">
          <Archive className="w-4 h-4" />
          <span>Archive</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onMute} className="gap-2">
          <Volume2 className="w-4 h-4" />
          <span>Mute</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onContactInfo} className="gap-2">
          <Info className="w-4 h-4" />
          <span>Contact Info</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onExport} className="gap-2">
          <Download className="w-4 h-4" />
          <span>Export chat</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onClear} className="gap-2">
          <X className="w-4 h-4" />
          <span>Clear chat</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onDelete}
          className="gap-2 text-destructive focus:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete chat</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

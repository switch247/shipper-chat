'use client';

import { ChatSession, User } from '@/lib/types';
import { Check, CheckCheck, MoreVertical, Phone, Download, Trash2, MessageCircleX, Info, Archive } from 'lucide-react';
import Image from 'next/image';
import { useState, useRef } from 'react';
import { useChatStore } from '@/lib/store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserListItemProps {
  session: ChatSession;
  isSelected?: boolean;
  isUserOnline?: boolean;
  onClick?: () => void;
  onArchive?: () => void;
  onMute?: () => void;
  onContactInfo?: () => void;
  onExport?: () => void;
  onClearChat?: () => void;
  onDeleteChat?: () => void;
}

export function UserListItem({
  session,
  isSelected = false,
  isUserOnline = false,
  onClick,
  onArchive,
  onMute,
  onContactInfo,
  onExport,
  onClearChat,
  onDeleteChat,
}: UserListItemProps) {
  const { participant, lastMessage, unreadCount } = session;
  const store = useChatStore();
  const isBeingSwiped = store.swipedChatId === session.id;
  const [localSwipeX, setLocalSwipeX] = useState(0);
  const touchStartX = useRef(0);
  const itemRef = useRef<HTMLDivElement>(null);

  const messagePreview = lastMessage?.content
    ? lastMessage.content.substring(0, 50) + (lastMessage.content.length > 50 ? '...' : '')
    : 'No messages yet';

  const timeString = lastMessage
    ? getTimeString(new Date(lastMessage.timestamp))
    : '';

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    store.setSwipedChatId(session.id);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX.current;

    // Allow swiping both left and right, cap at ±80px
    if (Math.abs(diff) > 0) {
      setLocalSwipeX(Math.max(Math.min(diff, 80), -80));
    }
  };

  const handleTouchEnd = () => {
    if (localSwipeX < -50) {
      onArchive?.();
    } else if (localSwipeX > 50) {
      // Mark as unread action
      onMute?.(); // Placeholder - can be replaced with markUnread
    }
    setLocalSwipeX(0);
    store.setSwipedChatId(null);
  };

  // Calculate card shrink based on swipe distance
  const shrinkAmount = Math.abs(localSwipeX) * 0.3; // Shrink proportionally to swipe
  const cardScale = Math.max(1 - shrinkAmount / 100, 0.85); // Min scale 0.85
  const cardRadius = isBeingSwiped && Math.abs(localSwipeX) > 10 ? 'rounded-xl' : 'rounded-2xl';

  return (
    <div
      ref={itemRef}
      className="w-full overflow-visible px-2 py-2"
      style={{
        perspective: '1000px',
      }}
    >
      {/* Action zones background container */}
      <div className="relative w-full">
        {/* Left action zone (Mark unread) */}
        {localSwipeX > 10 && (
          <div className="absolute left-2 inset-y-2 flex items-center z-0 pointer-events-none">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-sm">
              <Check className="w-6 h-6 text-white" />
            </div>
          </div>
        )}

        {/* Right action zone (Archive) */}
        {localSwipeX < -10 && (
          <div className="absolute right-2 inset-y-2 flex items-center justify-end z-0 pointer-events-none">
            <div className="w-12 h-12 rounded-xl bg-[var(--primary)] flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h18v2H3V3zm0 4v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7H3zm5 8h6v-2H8v2z" />
              </svg>
            </div>
          </div>
        )}

        {/* Swipeable Content Card */}
        <div
          className={`relative z-10 ${cardRadius} transition-all overflow-hidden`}
          style={{
            transform: `translateX(${localSwipeX}px) scale(${cardScale})`,
            transformOrigin: localSwipeX > 0 ? 'left center' : 'right center',
            transition: localSwipeX === 0 ? 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
          }}
        >
          <div
            className={`px-3 py-3 flex gap-3 items-start transition-colors group cursor-pointer ${isSelected ? 'bg-[#F8FAFC]' : 'bg-white hover:bg-[#F8FAFC]/50'
              }`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={(e) => {
              if (e.button === 0) {
                touchStartX.current = e.clientX;
                store.setSwipedChatId(session.id);
              }
            }}
            onMouseMove={(e) => {
              if (e.buttons === 1) {
                const currentX = e.clientX;
                const diff = currentX - touchStartX.current;
                if (Math.abs(diff) > 0) {
                  setLocalSwipeX(Math.max(Math.min(diff, 80), -80));
                }
              }
            }}
            onMouseUp={() => {
              if (localSwipeX < -50) {
                onArchive?.();
              } else if (localSwipeX > 50) {
                onMute?.();
              }
              setLocalSwipeX(0);
              store.setSwipedChatId(null);
            }}
            onMouseLeave={() => {
              setLocalSwipeX(0);
              store.setSwipedChatId(null);
            }}
            style={{
              transform: `translateX(${localSwipeX}px)`,
              transition: localSwipeX === 0 ? 'transform 0.2s ease-out' : 'none',
            }}
          >
            <button
              onClick={onClick}
              className="flex-1 flex gap-3 items-start"
            >
              {/* Avatar with online indicator */}
              <div className="relative flex-shrink-0">
                <Image
                  src={participant.avatar}
                  alt={participant.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {isUserOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-[var(--online-status)] rounded-full border-2 border-white" />
                )}
              </div>

              {/* User info */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-sm text-foreground truncate">
                    {participant.name}
                  </h3>
                  {timeString && (
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {timeString}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {messagePreview}
                </p>
              </div>

              {/* Unread indicator */}
              {unreadCount > 0 && (
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 rounded-full bg-[var(--online-status)] flex items-center justify-center text-xs font-semibold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
                </div>
              )}
            </button>

            {/* Context Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded flex-shrink-0">
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onContactInfo}>
                  <Info className="w-4 h-4 mr-2" />
                  <span>Contact Info</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onArchive}>
                  <Archive className="w-4 h-4 mr-2" />
                  <span>Archive</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onMute}>
                  <MessageCircleX className="w-4 h-4 mr-2" />
                  <span>Mute</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onExport}>
                  <Download className="w-4 h-4 mr-2" />
                  <span>Export chat</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onClearChat}>
                  <Phone className="w-4 h-4 mr-2" />
                  <span>Clear chat</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDeleteChat} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  <span>Delete chat</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTimeString(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

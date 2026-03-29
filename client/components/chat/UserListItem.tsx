'use client';

import { ChatSession, User } from '@/lib/types';
import { Check, CheckCheck, MoreVertical, Phone, Download, Trash2, MessageCircleX, Info, Archive, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
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
  const [containerWidth, setContainerWidth] = useState(320); // Default fallback

  useEffect(() => {
    if (itemRef.current) {
      setContainerWidth(itemRef.current.offsetWidth);
    }
    const handleResize = () => {
      if (itemRef.current) setContainerWidth(itemRef.current.offsetWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const swipeLimit = containerWidth * 0.25;

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

    // Allow swiping both left and right, cap at swipeLimit
    if (Math.abs(diff) > 0) {
      setLocalSwipeX(Math.max(Math.min(diff, swipeLimit), -swipeLimit));
    }
  };

  const handleTouchEnd = () => {
    if (localSwipeX < -swipeLimit * 0.6) {
      onArchive?.();
    } else if (localSwipeX > swipeLimit * 0.6) {
      // Mark as unread action
      onMute?.();
    }
    setLocalSwipeX(0);
    store.setSwipedChatId(null);
  };

  // Binary snapping logic: As soon as sliding starts, jump to 0.75 scale and full offset
  const swipeActive = Math.abs(localSwipeX) > 5;
  const cardScale = swipeActive ? 0.8 : 1.0;
  const displayTranslateX = swipeActive ? (localSwipeX > 0 ? swipeLimit : -swipeLimit) : 0;
  const cardRadius = swipeActive ? 'rounded-xl' : 'rounded-2xl';

  return (
    <div
      ref={itemRef}
      className="w-full overflow-hidden"
    >
      {/* Action zones background container */}
      <div className="relative w-full group">
        {/* Left action zone (Mark unread) */}
        {localSwipeX > 5 && (
          <div className="rounded-2xl absolute left-0 inset-y-0 w-1/6 flex items-center justify-center z-0 pointer-events-none bg-blue-500 text-white">
            <MessageCircle className="w-6 h-6" />
          </div>
        )}

        {/* Right action zone (Archive) */}
        {localSwipeX < -5 && (
          <div className="rounded-2xl absolute right-0 inset-y-0 w-1/6 flex items-center justify-center z-0 pointer-events-none bg-primary text-white">
            <Archive className="w-6 h-6" />
          </div>
        )}

        {/* Swipeable Content */}
        <div
          className={`${cardRadius} relative z-10 transition-all flex items-start gap-4 p-4 cursor-pointer select-none ${isSelected ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'
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
                setLocalSwipeX(Math.max(Math.min(diff, swipeLimit), -swipeLimit));
              }
            }
          }}
          onMouseUp={() => {
            if (localSwipeX < -swipeLimit * 0.6) {
              onArchive?.();
            } else if (localSwipeX > swipeLimit * 0.6) {
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
            transform: `translateX(${displayTranslateX}px) scaleX(${cardScale})`,
            transformOrigin: localSwipeX > 0 ? 'left center' : 'right center',
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
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

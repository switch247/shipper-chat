'use client';

import { ChatSession, User } from '@/lib/types';
import { Check, CheckCheck, MoreVertical, Phone, Download, Trash2, MessageCircleX, Info, Archive, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/lib/store/chat-store';
import { getTimeString } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserListItemProps {
  user?: User;
  session?: ChatSession;
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
  user,
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
  // Use session data if available, otherwise use user data
  const displayUser = session?.participant || user;
  const lastMessage = session?.lastMessage;
  const unreadCount = session?.unreadCount || 0;
  const sessionId = session?.id || (user?.id ? `new-${user.id}` : '');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.debug('[UserListItem] render', { sessionId, displayUser: displayUser?.id, isSelected });
    }
  }, [sessionId, displayUser?.id, isSelected]);

  if (!displayUser || !displayUser.id || !displayUser.name) return null;

  const store = useChatStore();
  const isBeingSwiped = store.swipedChatId === sessionId;
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
    store.setSwipedChatId(sessionId);
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

  // Keep item radius consistent with Figma
  const swipeActive = Math.abs(localSwipeX) > 5;
  const cardScale = 1.0;
  const displayTranslateX = localSwipeX; // follow finger for natural reveal
  const cardRadius = 'rounded-xl';

  return (
    <div
      ref={itemRef}
      className="w-full relative overflow-hidden z-0 isolate"
    >
      {/* Action zones background container */}
      <div className="relative w-full group">
        {/* Left action zone (Mark unread) - hidden behind content, revealed on right swipe */}
        <div className="absolute left-0 inset-y-0 flex items-center pl-3 z-0 pointer-events-none">
          <button
            onClick={onMute}
            className="cursor-pointer text-nowrap flex flex-col justify-center items-center gap-2 rounded-xl bg-[#1E9A80] w-16 h-16 text-white pointer-events-auto"
            title="Mark unread"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs font-medium">Unread</span>
          </button>
        </div>

        {/* Right action zone (Archive) - hidden behind content, revealed on left swipe */}
        <div className="absolute right-0 inset-y-0 flex items-center pr-3 z-0 pointer-events-none">
          <button
            onClick={onArchive}
            className="cursor-pointer text-nowrap flex flex-col justify-center items-center gap-2 rounded-xl bg-[#1E9A80] w-16 h-16 text-white pointer-events-auto"
            title="Archive"
          >
            <Archive className="w-4 h-4" />
            <span className="text-xs font-medium">Archive</span>
          </button>
        </div>

        {/* Swipeable Content */}
        <div
          className={`${cardRadius} relative ${swipeActive ? 'z-20' : 'z-10'} transition-transform duration-150 ease-out cursor-pointer select-none ${isSelected ? 'bg-[#F3F3EE]' : 'bg-white hover:bg-[#F8F8F5]'} `}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={(e) => {
            if (e.button === 0) {
              touchStartX.current = e.clientX;
              store.setSwipedChatId(sessionId);
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
          onClick={() => {
            // only treat as click when not swiping
            if (Math.abs(localSwipeX) < 8) onClick?.();
          }}
          style={{
            transform: `translateX(${displayTranslateX}px)`,
            transformOrigin: localSwipeX > 0 ? 'left center' : 'right center',
            willChange: 'transform',
          }}
        >
          <div className="flex items-center gap-3 p-3">
            <div className="flex justify-center items-center rounded-[1000px] bg-[#F7F9FB] w-10 h-10 overflow-hidden flex-shrink-0">
              <Image
                src={typeof displayUser.avatar === 'string' && displayUser.avatar.trim() !== '' ? displayUser.avatar : `/api/avatars/${displayUser.id}`}
                alt={displayUser.name || 'image'}
                width={40}
                height={40}
                className="shrink-0 rounded-[40px] w-10 h-10 max-w-none object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 min-w-0">
                  <p onClick={() => { console.debug('[UserListItem] name click', { sessionId }); onClick?.(); }} className="text-[#111625] font-inter text-sm font-medium leading-5 tracking-[-0.006em] truncate" title={displayUser.name}>
                    {displayUser.name}
                  </p>
                </div>
                {timeString && <p className="text-[#596881] font-inter text-xs leading-4 flex-shrink-0">{timeString}</p>}
              </div>

              <div className="flex items-center justify-between mt-1">
                <p onClick={() => { console.debug('[UserListItem] preview click', { sessionId }); onClick?.(); }} className="text-[#8B8B8B] text-xs line-clamp-1 truncate min-w-0">{messagePreview}</p>
                {lastMessage && lastMessage.senderId === store.currentUser?.id ? (
                  <span className="ml-2 flex-shrink-0">
                    {lastMessage.read ? (
                      <CheckCheck className="w-4 h-4 text-[#1E9A80]" />
                    ) : (
                      <Check className="w-4 h-4 text-[#8796AF]" />
                    )}
                  </span>
                ) : null}
              </div>
            </div>
            {unreadCount > 0 && (
              <div className="ml-3 flex-shrink-0">
                <div className="w-6 h-6 rounded-full bg-[#1E9A80] flex items-center justify-center text-xs font-semibold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              </div>
            )}
          </div>
          </div>

          {/* Context Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                  <button className="absolute right-3 top-3 z-20 opacity-0 group-hover:opacity-70 group-hover:pointer-events-auto pointer-events-none transition-opacity p-1 rounded bg-transparent" aria-label="More actions">
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
    
  );
}

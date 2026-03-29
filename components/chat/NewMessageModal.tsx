'use client';

import { useState, useMemo } from 'react';
import { User } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NewMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
  currentUserId: string;
  onSelectUser: (userId: string) => void;
  trigger?: React.ReactNode;
}

export function NewMessageModal({
  open,
  onOpenChange,
  users,
  currentUserId,
  onSelectUser,
  trigger,
}: NewMessageModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch && user.id !== currentUserId;
    });
  }, [users, searchQuery, currentUserId]);

  const handleSelectUser = (userId: string) => {
    onSelectUser(userId);
    setSearchQuery('');
    onOpenChange(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        {trigger || <div />}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72 p-3" align="start">
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-input border border-input text-sm"
              autoFocus
            />
          </div>

          <div className="max-h-80 overflow-y-auto space-y-1">
            {filteredUsers.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">
                No users found
              </p>
            ) : (
              filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user.id)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate text-sm">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

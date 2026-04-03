'use client';

import { useState, useMemo } from 'react';
import { User } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface NewMessageDropdownProps {
  users: User[];
  currentUserId: string;
  onSelectUser: (userId: string) => void;
  trigger?: React.ReactNode;
}

export function NewMessageDropdown({ users, currentUserId, onSelectUser, trigger }: NewMessageDropdownProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);

  const filteredUsers = useMemo(() => {
    const list = users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch && user.id !== currentUserId;
    });

    // Pin bot to top if present
    return list.sort((a, b) => {
      if (a.id === 'bot-assistant') return -1;
      if (b.id === 'bot-assistant') return 1;
      return a.name.localeCompare(b.name);
    });
  }, [users, searchQuery, currentUserId]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        {trigger ?? (
          <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
            New Message
          </Button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent side="bottom" className="w-72 p-3">
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
            className="pl-9 h-10 bg-muted/50 border-0 text-sm rounded-md"
            autoFocus
          />
        </div>

        <div className="max-h-64 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-2 text-center">
              <p className="text-foreground font-medium">No users found</p>
              <p className="text-xs text-muted-foreground mt-1">Try searching for a different name or email</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    try {
                      onSelectUser(user.id);
                    } finally {
                      setOpen(false);
                    }
                  }}
                  className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-all text-left"
                >
                  <div className="relative flex-shrink-0">
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {user.status === 'online' && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

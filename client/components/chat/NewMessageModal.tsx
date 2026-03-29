'use client';

import { useState, useMemo } from 'react';
import { User } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-4 gap-4">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">New Message</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-11 bg-muted/50 border-0 text-sm rounded-xl focus-visible:ring-primary"
              autoFocus
            />
          </div>

          <div className="max-h-[60vh] overflow-y-auto pr-1">
            {filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Search className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-foreground font-medium">No users found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try searching for a different name or email
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-all active:scale-[0.98] text-left"
                  >
                    <div className="relative flex-shrink-0">
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        width={44}
                        height={44}
                        className="w-11 h-11 rounded-full object-cover"
                      />
                      {user.status === 'online' && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

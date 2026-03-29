'use client';

import { usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bell,
  Settings,
  Search,
  ChevronDown,
  LogOut,
  Home,
  MessageSquare,
  Sparkles,
  FolderClosed,
  LayoutGrid,
  User,
} from 'lucide-react';
import { useAuth } from '@/lib/use-auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export function GlobalTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useAuth();

  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  // Get breadcrumb title and icon based on current path
  const getBreadcrumb = () => {
    if (pathname.startsWith('/chat')) return { icon: MessageSquare, title: 'Messages' };
    if (pathname.startsWith('/ai')) return { icon: Sparkles, title: 'Chat with AI' };
    if (pathname.startsWith('/home')) return { icon: Home, title: 'Home' };
    if (pathname.startsWith('/files')) return { icon: FolderClosed, title: 'Files' };
    if (pathname.startsWith('/analytics')) return { icon: LayoutGrid, title: 'Analytics' };
    if (pathname.startsWith('/profile')) return { icon: User, title: 'Profile' };
    if (pathname.startsWith('/settings')) return { icon: Settings, title: 'Settings' };
    return { icon: Home, title: 'Dashboard' };
  };

  const breadcrumb = getBreadcrumb();
  const BreadcrumbIcon = breadcrumb.icon;

  return (
    <div className="h-16 bg-white  px-6 py-4 flex items-center justify-between sticky top-1 z-40 rounded-2xl shadow-md">
      {/* Left: Breadcrumb/Title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
          <BreadcrumbIcon className="w-5 h-5 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">{breadcrumb.title}</h1>
      </div>

      {/* Center: Search */}
      <div className="flex-1 mx-8 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search... (⌘K)"
            className="pl-10 pr-4 h-10 bg-muted border-0 text-sm"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative w-10 h-10"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
        </Button>

        {/* Settings */}
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10"
        >
          <Settings className="w-5 h-5 text-muted-foreground" />
        </Button>

        {/* Workspace/Profile Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 h-10">
              <div className="w-6 h-6 rounded-full overflow-hidden">
                <Image
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  width={24}
                  height={24}
                  className="w-full h-full object-cover"
                />
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium text-foreground">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
            <hr className="my-2" />
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              <span>Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

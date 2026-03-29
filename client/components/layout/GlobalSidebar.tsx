'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
// import { User } from '@/lib/types';
import Image from 'next/image';
import {
  Home,
  MessageSquare,
  MessageCircle,
  Compass,
  FolderClosed,
  LayoutGrid,
  Sparkles,
  LogOut,
  User,
  ArrowLeft,
  CreditCard,
  Gift,
  Sun,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function GlobalSidebar() {
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();

  if (!currentUser) return null;

  const isActive = (path: string) => pathname.startsWith(path);

  const navItems = [
    { icon: Home, label: 'Home', href: '/home' },
    { icon: MessageCircle, label: 'Messages', href: '/chat' },
    { icon: Compass, label: 'Explore', href: '/explore' },
    { icon: FolderClosed, label: 'Files', href: '/files' },
    { icon: LayoutGrid, label: 'Analytics', href: '/analytics' },
  ];

  return (
    <aside className="w-20 bg-input  flex flex-col items-center justify-between py-6 shrink-0 z-50">
      {/* Top Section */}
      <div className="flex flex-col items-center gap-8 w-full">
        {/* Logo Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-12 h-12 rounded-xl flex items-center justify-center  shadow-lg shadow-primary/20 transition-transform active:scale-95 group">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="green" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-110 transition-transform">
                <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 13.4876 3.36093 14.891 4 16.1247V21H8.87533C10.109 21.6391 11.5124 22 13 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 12C12 11.4477 11.5523 11 11 11C10.4477 11 10 11.4477 10 12C10 12.5523 10.4477 13 11 13C11.5523 13 12 12.5523 12 12Z" fill="white" />
                <path d="M15 12C15 11.4477 14.5523 11 14 11C13.4477 11 13 11.4477 13 12C13 12.5523 13.4477 13 14 13C14.5523 13 15 12.5523 15 12Z" fill="white" />
                <path d="M9 12C9 11.4477 8.55228 11 8 11C7.44772 11 7 11.4477 7 12C7 12.5523 7.44772 13 8 13C8.55228 13 9 12.5523 9 12Z" fill="white" />
              </svg>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" side="right" className="w-64">
            <div className="px-3 py-3">
              <DropdownMenuItem asChild>
                <Link href="/"> 
                  <div className="flex items-center gap-3">
                    <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Go back to dashboard</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { /* rename action placeholder */ }}>
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Rename file</span>
                </div>
              </DropdownMenuItem>
            </div>

            <div className="px-3 py-2 bg-muted/5">
              <p className="text-sm font-medium text-foreground">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground">{currentUser.email}</p>
              <div className="mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <div className="text-sm">Credits</div>
                  </div>
                  <div className="text-sm font-semibold">{(currentUser as any).credits ?? '20'}</div>
                </div>

                <div className="mt-2">
                  <div className="w-full bg-amber-100 rounded-full h-2 overflow-hidden">
                    <div className="h-2 bg-primary rounded-full" style={{ width: '60%' }} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{(currentUser as any).renewal ?? 'Renews in 6h 24m'}</div>
                </div>
              </div>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/credits" className="flex items-center gap-3">
                <Gift className="w-4 h-4" />
                <span>Win free credits</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/theme" className="flex items-center gap-3">
                <Sun className="w-4 h-4" />
                <span>Theme Style</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={logout} className="flex items-center gap-3">
              <LogOut className="w-4 h-4 mr-2" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-4">
          {navItems.map(({ icon: Icon, label, href }) => {
            const active = isActive(href);
            return (
              <Link
                key={label}
                href={href}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${active
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'text-muted-foreground hover:bg-muted'
                  }`}
                title={label}
              >
                <Icon className="w-5 h-5" />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col items-center gap-4">
        {/* AI Assistant */}
        <Link
          href="/ai"
          className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
          title="AI Assistant"
        >
          <Sparkles className="w-5 h-5" />
        </Link>

        {/* Divider */}
        <div className="w-8 h-px bg-border" />

        {/* User Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative w-12 h-12 rounded-full border-2 border-primary overflow-hidden hover:opacity-90 transition-all active:scale-95 flex-shrink-0 group">
              <Image
                src={typeof currentUser.avatar === 'string' ? currentUser.avatar : '/placeholder-user.jpg'}
                alt={currentUser.name || 'User avatar'}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="right" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium text-foreground">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground">{currentUser.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">Preferences</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

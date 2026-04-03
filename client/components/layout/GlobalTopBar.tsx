'use client';

import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { useChatStore } from '@/lib/store/chat-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

// ─── Icon SVGs (exact from demo/page.tsx) ────────────────────────────────────

const MessageBreadcrumbIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 overflow-hidden">
    <path d="M2.5 16.6666L3.58333 13.4166C2.64704 12.0319 2.30833 10.392 2.63018 8.80188C2.95204 7.21179 3.91255 5.77969 5.33314 4.77186C6.75373 3.76403 8.53772 3.24905 10.3534 3.32266C12.1691 3.39628 13.8929 4.05349 15.2044 5.1721C16.5159 6.2907 17.3257 7.79458 17.4834 9.40412C17.641 11.0137 17.1358 12.6193 16.0616 13.9226C14.9873 15.2258 13.4172 16.138 11.6432 16.4894C9.86911 16.8409 8.01183 16.6077 6.41667 15.8333L2.5 16.6666Z" stroke="#596881" strokeWidth="1.875" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 w-3.5 h-3.5">
    <path d="M12.25 12.25L8.75 8.75M1.75 5.83333C1.75 6.36956 1.85562 6.90054 2.06083 7.39596C2.26603 7.89137 2.56681 8.34151 2.94598 8.72069C3.32515 9.09986 3.7753 9.40063 4.27071 9.60584C4.76612 9.81105 5.2971 9.91667 5.83333 9.91667C6.36956 9.91667 6.90054 9.81105 7.39596 9.60584C7.89137 9.40063 8.34151 9.09986 8.72069 8.72069C9.09986 8.34151 9.40063 7.89137 9.60584 7.39596C9.81105 6.90054 9.91667 6.36956 9.91667 5.83333C9.91667 5.2971 9.81105 4.76612 9.60584 4.27071C9.40063 3.7753 9.09986 3.32515 8.72069 2.94598C8.34151 2.56681 7.89137 2.26603 7.39596 2.06083C6.90054 1.85562 6.36956 1.75 5.83333 1.75C5.2971 1.75 4.76612 1.85562 4.27071 2.06083C3.7753 2.26603 3.32515 2.56681 2.94598 2.94598C2.56681 3.32515 2.26603 3.7753 2.06083 4.27071C1.85562 4.76612 1.75 5.2971 1.75 5.83333Z" stroke="#8796AF" strokeWidth="1.05" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 w-4 h-4">
    <path d="M5.99984 11.3333V12C5.99984 12.5304 6.21055 13.0391 6.58562 13.4142C6.9607 13.7893 7.4694 14 7.99984 14C8.53027 14 9.03898 13.7893 9.41405 13.4142C9.78912 13.0391 9.99984 12.5304 9.99984 12V11.3333M6.6665 3.33333C6.6665 2.97971 6.80698 2.64057 7.05703 2.39052C7.30708 2.14048 7.64622 2 7.99984 2C8.35346 2 8.6926 2.14048 8.94265 2.39052C9.19269 2.64057 9.33317 2.97971 9.33317 3.33333C10.0988 3.69535 10.7514 4.25888 11.2212 4.96353C11.691 5.66818 11.9601 6.48738 11.9998 7.33333V9.33333C12.05 9.7478 12.1968 10.1447 12.4284 10.4921C12.66 10.8395 12.9699 11.1276 13.3332 11.3333H2.6665C3.0298 11.1276 3.33971 10.8395 3.5713 10.4921C3.80288 10.1447 3.94967 9.7478 3.99984 9.33333V7.33333C4.03954 6.48738 4.3087 5.66818 4.77847 4.96353C5.24824 4.25888 5.9009 3.69535 6.6665 3.33333Z" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 w-4 h-4">
    <path d="M6.88333 2.878C7.16733 1.70733 8.83267 1.70733 9.11667 2.878C9.15928 3.05387 9.24281 3.21719 9.36047 3.35467C9.47813 3.49215 9.62659 3.5999 9.79377 3.66916C9.96094 3.73843 10.1421 3.76723 10.3225 3.75325C10.5029 3.73926 10.6775 3.68287 10.832 3.58867C11.8607 2.962 13.0387 4.13933 12.412 5.16867C12.3179 5.3231 12.2616 5.49756 12.2477 5.67785C12.2337 5.85814 12.2625 6.03918 12.3317 6.20625C12.4009 6.37333 12.5085 6.52172 12.6458 6.63937C12.7831 6.75702 12.9463 6.8406 13.122 6.88333C14.2927 7.16733 14.2927 8.83267 13.122 9.11667C12.9461 9.15928 12.7828 9.24281 12.6453 9.36047C12.5079 9.47813 12.4001 9.62659 12.3308 9.79377C12.2616 9.96094 12.2328 10.1421 12.2468 10.3225C12.2607 10.5029 12.3171 10.6775 12.4113 10.832C13.038 11.8607 11.8607 13.0387 10.8313 12.412C10.6769 12.3179 10.5024 12.2616 10.3222 12.2477C10.1419 12.2337 9.96082 12.2625 9.79375 12.3317C9.62667 12.4009 9.47828 12.5085 9.36063 12.6458C9.24298 12.7831 9.1594 12.9463 9.11667 13.122C8.83267 14.2927 7.16733 14.2927 6.88333 13.122C6.84072 12.9461 6.75719 12.7828 6.63953 12.6453C6.52187 12.5079 6.37341 12.4001 6.20623 12.3308C6.03906 12.2616 5.85789 12.2328 5.67748 12.2468C5.49706 12.2607 5.3225 12.3171 5.168 12.4113C4.13933 13.038 2.96133 11.8607 3.588 10.8313C3.68207 10.6769 3.73837 10.5024 3.75232 10.3222C3.76628 10.1419 3.7375 9.96082 3.66831 9.79375C3.59913 9.62667 3.49151 9.47828 3.35418 9.36063C3.21686 9.24298 3.05371 9.1594 2.878 9.11667C1.70733 8.83267 1.70733 7.16733 2.878 6.88333C3.05387 6.84072 3.21719 6.75719 3.35467 6.63953C3.49215 6.52187 3.5999 6.37341 3.66916 6.20623C3.73843 6.03906 3.76723 5.85789 3.75325 5.67748C3.73926 5.49706 3.68287 5.3225 3.58867 5.168C2.962 4.13933 4.13933 2.96133 5.16867 3.588C5.83533 3.99333 6.69933 3.63467 6.88333 2.878Z" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 8C6 8.53043 6.21071 9.03914 6.58579 9.41421C6.96086 9.78929 7.46957 10 8 10C8.53043 10 9.03914 9.78929 9.41421 9.41421C9.78929 9.03914 10 8.53043 10 8C10 7.46957 9.78929 6.96086 9.41421 6.58579C9.03914 6.21071 8.53043 6 8 6C7.46957 6 6.96086 6.21071 6.58579 6.58579C6.21071 6.96086 6 7.46957 6 8Z" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
    <path d="M4 6L8 10L12 6" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Page breadcrumb config ──────────────────────────────────────────────────
interface BreadcrumbConfig {
  icon: React.ReactNode;
  title: string;
}

function useBreadcrumb(pathname: string): BreadcrumbConfig {
  if (pathname.startsWith('/chat')) {
    return { icon: <MessageBreadcrumbIcon />, title: 'Message' };
  }
  return { icon: <MessageBreadcrumbIcon />, title: 'Dashboard' };
}

// ─── Component ───────────────────────────────────────────────────────────────
export function GlobalTopBar() {
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();
  const { searchQuery, setSearchQuery } = useChatStore();
  const { icon, title } = useBreadcrumb(pathname);

  const getAvatarSrc = () => {
    if (!currentUser?.avatar) return null;
    if (typeof currentUser.avatar === 'string') return currentUser.avatar;
    if (typeof currentUser.avatar === 'object' && 'src' in currentUser.avatar) return String((currentUser.avatar as { src: string }).src);
    return null;
  };
  const avatarSrc = getAvatarSrc();

  return (
    <header className="shrink-0 px-0 pb-0 pt-0">
      {/* White inner card — py-3 px-6 matching demo line 137 */}
      <div className="flex py-3 px-6 flex-col items-start gap-6 rounded-2xl bg-white w-full overflow-hidden">
        <div className="flex justify-between items-center w-full">

          {/* Left: breadcrumb icon + title */}
          <div className="flex items-start gap-2 w-fit">
            {icon}
            <p className="text-[#111625] font-inter text-sm font-medium leading-5 w-fit tracking-[-0.006em]">
              {title}
            </p>
          </div>

          {/* Right cluster: search + actions + divider + user */}
          <div className="flex items-center gap-4 w-fit">
            <div className="flex items-center gap-3 w-fit">

              {/* Search bar */}
              <div className="flex pt-2.5 pr-1 pb-2.5 pl-2.5 items-center gap-2 rounded-[10px] border border-[#E8E5DF] w-[300px] h-8">
                <SearchIcon />
                <div className="flex items-center gap-2.5 w-full">
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-[#8796AF] font-inter text-xs leading-4 w-full bg-transparent border-none outline-none placeholder:text-[#8796AF]"
                  />
                  <div className="flex py-[5px] px-1.5 items-center gap-1 rounded-md bg-[#F3F3EE] w-fit h-6 shrink-0">
                    <p className="text-[#404040] font-inter text-xs leading-4 w-fit">⌘+K</p>
                  </div>
                </div>
              </div>

              {/* Bell */}
              <button className="flex justify-center items-center gap-1 rounded-lg border border-[#E8E5DF] bg-white w-8 h-8 hover:bg-[#F3F3EE] transition-colors">
                <BellIcon />
              </button>

              {/* Settings */}
              <button className="flex justify-center items-center gap-1 rounded-lg border border-[#E8E5DF] bg-white w-8 h-8 hover:bg-[#F3F3EE] transition-colors">
                <SettingsIcon />
              </button>
            </div>

            {/* Vertical divider */}
            <svg width="1" height="20" viewBox="0 0 1 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5">
              <path d="M0.5 0L0.500001 20" stroke="#E8E5DF" />
            </svg>

            {/* User avatar + chevron dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 w-fit focus:outline-none hover:opacity-80 transition-opacity">
                  <div className="flex justify-center items-center rounded-[1000px] bg-[#F7F9FB] w-8 h-8 overflow-hidden">
                    {avatarSrc ? (
                      <Image
                        src={avatarSrc}
                        alt={currentUser?.name || 'User'}
                        width={32}
                        height={32}
                        className="shrink-0 rounded-[32px] w-8 h-8 object-cover max-w-none"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-8 h-8 rounded-[32px] bg-[#1E9A80] text-white text-xs font-semibold">
                        {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <ChevronDownIcon />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48 rounded-xl border border-[#E8E5DF] bg-white shadow-sm p-1">
                <DropdownMenuItem
                  className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm text-[#111625] font-medium hover:bg-[#F3F3EE] cursor-pointer"
                  onClick={() => {/* navigate to profile */}}
                >
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm text-[#DF1C41] font-medium hover:bg-[#FFF0F2] cursor-pointer"
                  onClick={logout}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

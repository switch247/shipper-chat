'use client';

import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ─── Nav item definition ─────────────────────────────────────────────────────
interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

// ─── Exact SVG icons from demo/page.tsx ──────────────────────────────────────

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
    <path d="M17.5 9.375V16.875C17.5 17.0408 17.4342 17.1997 17.3169 17.3169C17.1997 17.4342 17.0408 17.5 16.875 17.5H12.5C12.3342 17.5 12.1753 17.4342 12.0581 17.3169C11.9408 17.1997 11.875 17.0408 11.875 16.875V12.8125C11.875 12.7296 11.8421 12.6501 11.7835 12.5915C11.7249 12.5329 11.6454 12.5 11.5625 12.5H8.4375C8.35462 12.5 8.27513 12.5329 8.21653 12.5915C8.15792 12.6501 8.125 12.7296 8.125 12.8125V16.875C8.125 17.0408 8.05915 17.1997 7.94194 17.3169C7.82473 17.4342 7.66576 17.5 7.5 17.5H3.125C2.95924 17.5 2.80027 17.4342 2.68306 17.3169C2.56585 17.1997 2.5 17.0408 2.5 16.875V9.375C2.50015 9.04354 2.63195 8.72571 2.86641 8.49141L9.11641 2.24141C9.3508 2.00716 9.66862 1.87558 10 1.87558C10.3314 1.87558 10.6492 2.00716 10.8836 2.24141L17.1336 8.49141C17.368 8.72571 17.4998 9.04354 17.5 9.375Z" fill="#151515" />
  </svg>
);

const ChatIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
    <path d="M9.99982 1.875C8.59706 1.87469 7.21811 2.23757 5.9972 2.9283C4.77629 3.61904 3.75501 4.6141 3.03277 5.81664C2.31052 7.01918 1.91192 8.38822 1.87575 9.79052C1.83958 11.1928 2.16709 12.5806 2.82638 13.8188L1.93966 16.4789C1.86621 16.6992 1.85556 16.9355 1.90888 17.1615C1.96221 17.3874 2.07741 17.5941 2.24158 17.7582C2.40575 17.9224 2.61239 18.0376 2.83836 18.0909C3.06432 18.1443 3.30067 18.1336 3.52091 18.0602L6.18107 17.1734C7.27073 17.753 8.47811 18.0767 9.71156 18.12C10.945 18.1633 12.1721 17.925 13.2997 17.4232C14.4273 16.9215 15.4258 16.1694 16.2194 15.2241C17.0129 14.2789 17.5807 13.1652 17.8796 11.9678C18.1785 10.7703 18.2007 9.52047 17.9445 8.31315C17.6882 7.10584 17.1603 5.97276 16.4008 4.99993C15.6413 4.02711 14.6701 3.24009 13.561 2.69864C12.4519 2.15718 11.234 1.87551 9.99982 1.875ZM9.99982 16.875C8.79121 16.8758 7.6038 16.5575 6.55763 15.9523C6.48104 15.9079 6.39587 15.8803 6.30779 15.8713C6.2197 15.8622 6.13071 15.872 6.0467 15.9L3.12482 16.875L4.09904 13.9531C4.12712 13.8692 4.13705 13.7802 4.12816 13.6921C4.11927 13.604 4.09177 13.5188 4.04748 13.4422C3.28964 12.132 2.98537 10.6083 3.18187 9.10747C3.37837 7.60667 4.06466 6.21267 5.13426 5.14171C6.20387 4.07076 7.597 3.38271 9.09755 3.18431C10.5981 2.98592 12.1222 3.28826 13.4334 4.04444C14.7445 4.80062 15.7695 5.96837 16.3493 7.36652C16.9291 8.76468 17.0313 10.3151 16.64 11.7773C16.2487 13.2394 15.3858 14.5316 14.1852 15.4533C12.9846 16.375 11.5134 16.8748 9.99982 16.875Z" fill="#151515" />
  </svg>
);

const ExploreIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
    <path d="M10 1.875C8.39303 1.875 6.82214 2.35152 5.486 3.24431C4.14985 4.1371 3.10844 5.40605 2.49348 6.8907C1.87852 8.37535 1.71762 10.009 2.03112 11.5851C2.34463 13.1612 3.11846 14.6089 4.25476 15.7452C5.39106 16.8815 6.8388 17.6554 8.41489 17.9689C9.99099 18.2824 11.6247 18.1215 13.1093 17.5065C14.594 16.8916 15.8629 15.8502 16.7557 14.514C17.6485 13.1779 18.125 11.607 18.125 10C18.1227 7.84581 17.266 5.78051 15.7427 4.25727C14.2195 2.73403 12.1542 1.87727 10 1.875ZM10 16.875C8.64026 16.875 7.31105 16.4718 6.18046 15.7164C5.04987 14.9609 4.16868 13.8872 3.64833 12.6309C3.12798 11.3747 2.99183 9.99237 3.2571 8.65875C3.52238 7.32513 4.17716 6.10013 5.13864 5.13864C6.10013 4.17715 7.32514 3.52237 8.65876 3.2571C9.99238 2.99183 11.3747 3.12798 12.631 3.64833C13.8872 4.16868 14.9609 5.04987 15.7164 6.18045C16.4718 7.31104 16.875 8.64025 16.875 10C16.8729 11.8227 16.1479 13.5702 14.8591 14.8591C13.5702 16.1479 11.8227 16.8729 10 16.875ZM13.4703 5.69062L8.47032 8.19062C8.34943 8.25135 8.25135 8.34943 8.19063 8.47031L5.69063 13.4703C5.64293 13.5656 5.6204 13.6716 5.62519 13.7781C5.62997 13.8845 5.66191 13.988 5.71796 14.0787C5.77402 14.1693 5.85233 14.2442 5.94545 14.296C6.03857 14.3479 6.14341 14.3751 6.25 14.375C6.34703 14.3749 6.44273 14.3524 6.52969 14.3094L11.5297 11.8094C11.6506 11.7487 11.7487 11.6506 11.8094 11.5297L14.3094 6.52969C14.3684 6.41229 14.3888 6.27929 14.3679 6.14958C14.347 6.01988 14.2857 5.90006 14.1928 5.80716C14.0999 5.71426 13.9801 5.653 13.8504 5.63208C13.7207 5.61116 13.5877 5.63164 13.4703 5.69062ZM10.7813 10.7812L7.64766 12.3523L9.21875 9.21875L12.3555 7.65078L10.7813 10.7812Z" fill="#151515" />
  </svg>
);

const FilesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
    <path d="M16.875 5.62501H10.2586L8.125 3.49141C8.00935 3.37483 7.87168 3.28241 7.71999 3.21951C7.5683 3.1566 7.40562 3.12448 7.24141 3.12501H3.125C2.79348 3.12501 2.47554 3.2567 2.24112 3.49112C2.0067 3.72554 1.875 4.04349 1.875 4.37501V15.6734C1.87541 15.992 2.00214 16.2974 2.22739 16.5226C2.45263 16.7479 2.75802 16.8746 3.07656 16.875H16.9445C17.2575 16.8746 17.5575 16.7501 17.7788 16.5288C18.0001 16.3075 18.1246 16.0075 18.125 15.6945V6.87501C18.125 6.54349 17.9933 6.22554 17.7589 5.99112C17.5245 5.7567 17.2065 5.62501 16.875 5.62501ZM3.125 4.37501H7.24141L8.49141 5.62501H3.125V4.37501ZM16.875 15.625H3.125V6.87501H16.875V15.625Z" fill="#151515" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
    <path d="M16.25 2.5H6.25C5.91848 2.5 5.60054 2.6317 5.36612 2.86612C5.1317 3.10054 5 3.41848 5 3.75V5H3.75C3.41848 5 3.10054 5.1317 2.86612 5.36612C2.6317 5.60054 2.5 5.91848 2.5 6.25V16.25C2.5 16.5815 2.6317 16.8995 2.86612 17.1339C3.10054 17.3683 3.41848 17.5 3.75 17.5H13.75C14.0815 17.5 14.3995 17.3683 14.6339 17.1339C14.8683 16.8995 15 16.5815 15 16.25V15H16.25C16.5815 15 16.8995 14.8683 17.1339 14.6339C17.3683 14.3995 17.5 14.0815 17.5 13.75V3.75C17.5 3.41848 17.3683 3.10054 17.1339 2.86612C16.8995 2.6317 16.5815 2.5 16.25 2.5ZM6.25 3.75H16.25V9.17031L14.9453 7.86563C14.7109 7.63138 14.3931 7.4998 14.0617 7.4998C13.7303 7.4998 13.4125 7.63138 13.1781 7.86563L7.29453 13.75H6.25V3.75ZM13.75 16.25H3.75V6.25H5V13.75C5 14.0815 5.1317 14.3995 5.36612 14.6339C5.60054 14.8683 5.91848 15 6.25 15H13.75V16.25ZM16.25 13.75H9.0625L14.0625 8.75L16.25 10.9375V13.75ZM9.375 8.75C9.74584 8.75 10.1084 8.64003 10.4167 8.43401C10.725 8.22798 10.9654 7.93514 11.1073 7.59253C11.2492 7.24992 11.2863 6.87292 11.214 6.50921C11.1416 6.14549 10.963 5.8114 10.7008 5.54917C10.4386 5.28695 10.1045 5.10837 9.74079 5.03603C9.37708 4.96368 9.00008 5.00081 8.65747 5.14273C8.31486 5.28464 8.02202 5.52496 7.81599 5.83331C7.60997 6.14165 7.5 6.50416 7.5 6.875C7.5 7.37228 7.69754 7.84919 8.04917 8.20083C8.40081 8.55246 8.87772 8.75 9.375 8.75ZM9.375 6.25C9.49861 6.25 9.61945 6.28666 9.72223 6.35533C9.82501 6.42401 9.90512 6.52162 9.95242 6.63582C9.99973 6.75003 10.0121 6.87569 9.98799 6.99693C9.96388 7.11817 9.90435 7.22953 9.81694 7.31694C9.72953 7.40435 9.61817 7.46388 9.49693 7.48799C9.37569 7.51211 9.25003 7.49973 9.13582 7.45242C9.02162 7.40512 8.92401 7.32501 8.85533 7.22223C8.78666 7.11945 8.75 6.99861 8.75 6.875C8.75 6.70924 8.81585 6.55027 8.93306 6.43306C9.05027 6.31585 9.20924 6.25 9.375 6.25Z" fill="#151515" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
    <path d="M17.9298 8.82811L12.9735 7.02655L11.172 2.0703C11.0832 1.83108 10.9233 1.62476 10.7138 1.47907C10.5043 1.33337 10.2552 1.25528 10.0001 1.25528C9.74491 1.25528 9.49585 1.33337 9.28636 1.47907C9.07688 1.62476 8.917 1.83108 8.8282 2.0703L7.02664 7.02655L2.07039 8.82811C1.83117 8.91691 1.62485 9.07679 1.47916 9.28627C1.33346 9.49576 1.25537 9.74482 1.25537 9.99999C1.25537 10.2552 1.33346 10.5042 1.47916 10.7137C1.62485 10.9232 1.83117 11.0831 2.07039 11.1719L7.02664 12.9742L8.8282 17.9297C8.917 18.1689 9.07688 18.3752 9.28636 18.5209C9.49585 18.6666 9.74491 18.7447 10.0001 18.7447C10.2552 18.7447 10.5043 18.6666 10.7138 18.5209C10.9233 18.3752 11.0832 18.1689 11.172 17.9297L12.9743 12.9734L17.9298 11.1719C18.169 11.0831 18.3753 10.9232 18.521 10.7137C18.6667 10.5042 18.7448 10.2552 18.7448 9.99999C18.7448 9.74482 18.6667 9.49576 18.521 9.28627C18.3753 9.07679 18.169 8.91691 17.9298 8.82811ZM12.272 11.8984C12.1862 11.9296 12.1084 11.9792 12.0439 12.0438C11.9793 12.1083 11.9297 12.1861 11.8985 12.2719L10.0001 17.4922L8.10164 12.2719C8.07042 12.1861 8.02082 12.1083 7.9563 12.0438C7.89179 11.9792 7.81393 11.9296 7.7282 11.8984L2.50789 9.99999L7.7282 8.10155C7.81393 8.07033 7.89179 8.02072 7.9563 7.95621C8.02082 7.8917 8.07042 7.81384 8.10164 7.72811L10.0001 2.5078L11.8985 7.72811C11.9297 7.81384 11.9793 7.8917 12.0439 7.95621C12.1084 8.02072 12.1862 8.07033 12.272 8.10155L17.4923 9.99999L12.272 11.8984Z" fill="#151515" />
  </svg>
);

// Logo SVG (white package icon) from demo/page.tsx lines 10–31
const LogoIcon = () => (
  <svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 w-5 h-[22px]">
    <g clipPath="url(#logo-clip)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 8.25V17.05H2.75C3.0389 17.05 3.32498 17.1069 3.59192 17.2175C3.85879 17.328 4.10137 17.4901 4.3056 17.6944C4.50991 17.8987 4.67198 18.1412 4.78256 18.4081C4.89306 18.675 4.95 18.9611 4.95 19.25V22H11.55L19.8 13.75V4.95H17.05C16.7611 4.95 16.475 4.8931 16.2081 4.78254C15.9412 4.67198 15.6986 4.50992 15.4944 4.30564C15.2901 4.10135 15.128 3.85881 15.0174 3.5919C14.9069 3.32499 14.85 3.03892 14.85 2.75V0H8.25L0 8.25ZM9.35 16.5H5.5V10.45L10.45 5.5H14.3V11.55L9.35 16.5Z"
        fill="white"
      />
    </g>
    <defs>
      <clipPath id="logo-clip">
        <rect width="19.8" height="22" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

// ─── Dropdown Divider (SVG line matching demo) ────────────────────────────────
const DropdownDivider = () => (
  <svg width="307" height="1" viewBox="0 0 307 1" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full my-0.5">
    <path d="M10 0.5H297" stroke="#E8E5DF" />
  </svg>
);

// ─── Logo Dropdown Icon SVGs (from demo lines 906–1110) ───────────────────────
const RenameIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
    <path d="M2 14H14M9.18961 3.54114C9.18961 3.54114 9.18961 4.63089 10.2794 5.72064C11.3691 6.81039 12.4589 6.81039 12.4589 6.81039M4.87975 11.992L7.16823 11.6651C7.49833 11.618 7.80424 11.465 8.04003 11.2292L13.5486 5.72064C14.1505 5.11879 14.1505 4.14299 13.5486 3.54114L12.4589 2.45139C11.857 1.84954 10.8812 1.84954 10.2794 2.45139L4.77078 7.95997C4.53499 8.19576 4.38203 8.50167 4.33488 8.83177L4.00795 11.1202C3.9353 11.6288 4.3712 12.0647 4.87975 11.992Z" stroke="#28303F" strokeLinecap="round" />
  </svg>
);

const GiftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
    <g clipPath="url(#gift-clip)">
      <path d="M2.66683 7.33333H13.3335M2.66683 7.33333C1.93045 7.33333 1.3335 6.73637 1.3335 6V5.33333C1.3335 4.59695 1.93045 3.99999 2.66683 3.99999H13.3335C14.0699 3.99999 14.6668 4.59695 14.6668 5.33333V6C14.6668 6.73637 14.0699 7.33333 13.3335 7.33333M2.66683 7.33333L2.66683 13.3333C2.66683 14.0697 3.26378 14.6667 4.00016 14.6667H12.0002C12.7365 14.6667 13.3335 14.0697 13.3335 13.3333V7.33333M8.00016 3.99999H10.6668C11.4032 3.99999 12.0002 3.40304 12.0002 2.66666C12.0002 1.93028 11.4032 1.33333 10.6668 1.33333C9.19407 1.33333 8.00016 2.52724 8.00016 3.99999ZM8.00016 3.99999H5.3335C4.59712 3.99999 4.00016 3.40304 4.00016 2.66666C4.00016 1.93028 4.59712 1.33333 5.3335 1.33333C6.80626 1.33333 8.00016 2.52724 8.00016 3.99999ZM8.00016 3.99999V14.6667" stroke="#28303F" strokeLinecap="round" />
    </g>
    <defs><clipPath id="gift-clip"><rect width="16" height="16" fill="white" /></clipPath></defs>
  </svg>
);

const ThemeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
    <g clipPath="url(#theme-clip)">
      <path d="M8.00016 1.33334V2M8.00016 14V14.6667M12.7142 3.28596L12.2428 3.75737M3.75753 12.2426L3.28612 12.714M14.6668 8H14.0002M2.00016 8H1.3335M12.7142 12.714L12.2428 12.2426M3.75753 3.75737L3.28612 3.28596M12.0002 8C12.0002 10.2091 10.2093 12 8.00016 12C5.79102 12 4.00016 10.2091 4.00016 8C4.00016 5.79086 5.79102 4 8.00016 4C10.2093 4 12.0002 5.79086 12.0002 8Z" stroke="#28303F" strokeLinecap="round" />
    </g>
    <defs><clipPath id="theme-clip"><rect width="16" height="16" fill="white" /></clipPath></defs>
  </svg>
);

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
    <path d="M6 8H13.3333M10.6667 5.33333L13.3333 8L10.6667 10.6667M8.66667 3.33333H3.33333C2.97971 3.33333 2.64057 3.47381 2.39052 3.72386C2.14048 3.97391 2 4.31304 2 4.66667V11.3333C2 11.687 2.14048 12.0261 2.39052 12.2761C2.64057 12.5262 2.97971 12.6667 3.33333 12.6667H8.66667" stroke="#28303F" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

export function GlobalSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useAuth();

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', href: '/', icon: <HomeIcon /> },
    { id: 'chat', label: 'Messages', href: '/chat', icon: <ChatIcon /> },
    { id: 'explore', label: 'Explore', href: '/explore', icon: <ExploreIcon /> },
    { id: 'files', label: 'Files', href: '/files', icon: <FilesIcon /> },
    { id: 'analytics', label: 'Analytics', href: '/analytics', icon: <AnalyticsIcon /> },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const getAvatarSrc = () => {
    if (!currentUser?.avatar) return null;
    if (typeof currentUser.avatar === 'string') return currentUser.avatar;
    if (typeof currentUser.avatar === 'object' && 'src' in currentUser.avatar) return String((currentUser.avatar as { src: string }).src);
    return null;
  };

  const avatarSrc = getAvatarSrc();

  return (
    <div className="flex py-2 px-4 flex-col justify-between items-start w-fit h-full shrink-0">
      {/* Top: Logo + Nav */}
      <div className="flex flex-col justify-center items-start gap-8 w-fit">
        {/* Logo Button with Dropdown */}
        <div className="flex items-center gap-3 w-full">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex p-[11px] justify-center items-center gap-[9px] rounded-[915px] bg-[#1E9A80] w-fit hover:bg-[#1a8a72] transition-colors focus:outline-none"
                aria-label="Open menu"
              >
                <div className="flex py-0 px-px justify-center items-center w-[22px] h-[22px]">
                  <LogoIcon />
                </div>
              </button>
            </DropdownMenuTrigger>

            {/* Logo Dropdown — matches demo lines 874–1119 */}
            <DropdownMenuContent
              side="right"
              align="start"
              sideOffset={12}
              className="flex py-1 px-0 flex-col items-start gap-1 rounded-2xl bg-white shadow-[0_1px_13.8px_1px_rgba(18,18,18,0.10)] w-[307px] overflow-hidden p-0 border-0"
            >
              {/* Navigation section */}
              <div className="flex py-0 px-1 flex-col justify-center items-center gap-2 w-full">
                <div className="flex p-1 flex-col justify-center items-start gap-1 rounded-xl w-full overflow-hidden">
                  {/* Go back */}
                  <button
                    onClick={() => router.back()}
                    className="flex p-1.5 flex-col justify-center items-start gap-2 rounded-lg w-full overflow-hidden hover:bg-[#F8F8F5] transition-colors"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div className="flex p-1.5 items-center gap-2.5 rounded-md bg-[#F3F3EE] w-fit overflow-hidden">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <svg width="4" height="8" viewBox="0 0 4 8" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-1 h-2">
                            <path fillRule="evenodd" clipRule="evenodd" d="M3.47901 7.55713C3.69465 7.38463 3.72961 7.06998 3.5571 6.85435L1.14031 3.83337L3.5571 0.81238C3.72961 0.596749 3.69465 0.282103 3.47901 0.109598C3.26338 -0.0629072 2.94874 -0.027946 2.77623 0.187685L0.109566 3.52102C-0.0365215 3.70363 -0.0365215 3.9631 0.109566 4.14571L2.77623 7.47905C2.94874 7.69468 3.26338 7.72964 3.47901 7.55713Z" fill="#09090B" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-[#09090B] font-inter text-sm font-medium leading-5 w-fit tracking-[-0.01em]">Go back to dashboard</p>
                    </div>
                  </button>

                  {/* Rename file */}
                  <button className="flex p-1.5 flex-col justify-center items-start gap-2 rounded-lg bg-[#F8F8F5] w-full overflow-hidden hover:bg-[#F0F0EB] transition-colors">
                    <div className="flex items-center gap-2 w-full">
                      <div className="flex p-1.5 items-center gap-2.5 rounded-md bg-white w-fit overflow-hidden">
                        <RenameIcon />
                      </div>
                      <p className="text-[#09090B] font-inter text-sm font-medium leading-5 w-fit tracking-[-0.01em]">Rename file</p>
                    </div>
                  </button>
                </div>
              </div>

              <DropdownDivider />

              {/* User info */}
              <div className="flex py-0 px-1 flex-col items-start gap-2 w-full">
                <div className="flex p-2 items-center gap-3 rounded-lg w-full overflow-hidden">
                  <div className="flex flex-col justify-center items-start gap-0.5 w-full">
                    <p className="text-[#1C1C1C] font-inter text-sm font-semibold leading-5 w-fit tracking-[-0.01em]">
                      {currentUser?.name || 'User'}
                    </p>
                    <p className="text-[#8B8B8B] font-inter text-xs w-full tracking-[-0.01em]">
                      {currentUser?.email || ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Credits card */}
              <div className="flex flex-col items-start gap-2 w-full">
                <div className="flex py-0 px-2.5 flex-col items-start gap-2 bg-white w-full">
                  <div className="flex p-2 flex-col justify-center items-start gap-2 rounded-lg bg-[#F8F8F5] w-full overflow-hidden">
                    <div className="flex items-start gap-2 w-full">
                      <div className="flex flex-col justify-center items-start gap-0.5 w-full">
                        <p className="text-[#8B8B8B] font-inter text-xs leading-[18px] w-full">Credits</p>
                        <p className="text-[#09090B] font-inter text-sm font-medium leading-5 w-fit">20 left</p>
                      </div>
                      <div className="flex flex-col justify-center items-end gap-0.5 w-full">
                        <p className="text-[#8B8B8B] font-inter text-xs leading-[18px] w-full text-right">Renews in</p>
                        <p className="text-[#09090B] font-inter text-sm font-medium leading-5 w-fit">6h 24m</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-start gap-2 w-full">
                      <div className="flex items-center rounded bg-[#E8E5DF] w-full h-2 overflow-hidden">
                        <div className="rounded bg-[#1E9A80] w-[60%] h-2 overflow-hidden" />
                      </div>
                      <div className="flex justify-between items-center w-full">
                        <p className="text-[#5F5F5D] font-inter text-xs leading-5 w-fit tracking-[-0.01em]">5 of 25 used today</p>
                        <p className="text-[#1E9A80] font-inter text-xs leading-[18px] w-fit">+25 tomorrow</p>
                      </div>
                    </div>
                  </div>
                </div>
                <DropdownDivider />
              </div>

              {/* Win credits + Theme */}
              <div className="flex py-0 px-1 flex-col items-start gap-2 w-full">
                <div className="flex flex-col items-start w-full">
                  <div className="flex p-1 flex-col justify-center items-start gap-1 rounded-xl w-full overflow-hidden">
                    <button className="flex p-1.5 flex-col justify-center items-start gap-2 rounded-lg w-full overflow-hidden hover:bg-[#F8F8F5] transition-colors">
                      <div className="flex items-center gap-2 w-full">
                        <div className="flex p-1.5 items-center gap-2.5 rounded-md bg-[#F3F3EE] w-fit overflow-hidden">
                          <GiftIcon />
                        </div>
                        <p className="text-[#1C1C1C] font-inter text-sm font-medium leading-5 w-fit tracking-[-0.01em]">Win free credits</p>
                      </div>
                    </button>
                    <button className="flex p-1.5 flex-col justify-center items-start gap-2 rounded-lg w-full overflow-hidden hover:bg-[#F8F8F5] transition-colors">
                      <div className="flex items-center gap-2 w-full">
                        <div className="flex p-1.5 items-center gap-2.5 rounded-md bg-[#F3F3EE] w-fit overflow-hidden">
                          <ThemeIcon />
                        </div>
                        <p className="text-[#1C1C1C] font-inter text-sm font-medium leading-5 w-fit tracking-[-0.01em]">Theme Style</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <DropdownDivider />

              {/* Logout */}
              <div className="flex py-0 px-1 flex-col items-start gap-2 w-full pb-1">
                <div className="flex flex-col items-start w-full">
                  <div className="flex p-1 flex-col justify-center items-start gap-1 rounded-xl w-full overflow-hidden">
                    <button
                      onClick={logout}
                      className="flex p-1.5 flex-col justify-center items-start gap-2 rounded-lg w-full overflow-hidden hover:bg-[#F8F8F5] transition-colors"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className="flex p-1.5 items-center gap-2.5 rounded-md bg-[#F3F3EE] w-fit overflow-hidden">
                          <LogoutIcon />
                        </div>
                        <p className="text-[#1C1C1C] font-inter text-sm font-medium leading-5 w-fit tracking-[-0.01em]">Log out</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Nav Items */}
        <div className="flex flex-col items-start gap-2 w-fit">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              title={item.label}
              className={`flex min-w-[44px] max-w-[44px] py-2 px-3 items-center gap-2 rounded-lg w-full h-11 transition-colors ${
                isActive(item.href)
                  ? 'border border-[#1E9A80] bg-[#F0FDF4]'
                  : 'hover:bg-black/5'
              }`}
            >
              {item.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom: AI sparkle + Avatar */}
      <div className="flex flex-col justify-center items-center gap-6 w-11">
        <button
          title="AI Assistant"
          className="flex min-w-[44px] max-w-[44px] py-2 px-3 items-center gap-2 rounded-lg w-full h-11 hover:bg-black/5 transition-colors"
        >
          <SparkleIcon />
        </button>

        <button
          onClick={() => router.push('/profile')}
          title="Profile"
          className="rounded-[44px] w-11 h-11 overflow-hidden focus:outline-none hover:opacity-90 transition-opacity"
        >
          {avatarSrc ? (
            <Image
              src={avatarSrc}
              alt={currentUser?.name || 'User avatar'}
              width={44}
              height={44}
              className="rounded-[44px] w-11 h-11 object-cover"
            />
          ) : (
            <div className="rounded-[44px] w-11 h-11 bg-[#1E9A80] flex items-center justify-center text-white text-sm font-semibold">
              {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
        </button>
      </div>
    </div>
  );
}

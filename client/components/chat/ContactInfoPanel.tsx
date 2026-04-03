'use client';

import { ContactInfo } from '@/lib/types';
import { X, Phone, Video, FileText, Link as LinkIcon, FileJson, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface ContactInfoPanelProps {
  contactInfo: ContactInfo;
  onClose: () => void;
  isOpen?: boolean;
}

export function ContactInfoPanel({ contactInfo, onClose, isOpen = true }: ContactInfoPanelProps) {
  if (!contactInfo) return null;
  const { user, media, links, docs } = contactInfo;

  if (!user) return null;

  const getAvatarSrc = (avatar: any) => {
    if (!avatar) return '/placeholder-user.jpg';
    if (typeof avatar === 'string') return avatar;
    if (typeof avatar === 'object' && 'src' in avatar) return String(avatar.src);
    return '/placeholder-user.jpg';
  };
  const [activeTab, setActiveTab] = useState<'media' | 'links' | 'docs'>('media');
  // Handle outside click and mount/unmount animation state
  const [mounted, setMounted] = useState<boolean>(isOpen);
  const [show, setShow] = useState<boolean>(isOpen);

  useEffect(() => {
    let t: any;
    if (isOpen) {
      setMounted(true);
      // allow next frame for transition
      requestAnimationFrame(() => setShow(true));
    } else {
      setShow(false);
      t = setTimeout(() => setMounted(false), 320);
    }
    return () => clearTimeout(t);
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (mounted) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mounted, onClose]);

  // Helper: group items (media/links/docs) by month-year for rendering
  const groupByMonth = (items: any[] = []) => {
    const groups: Record<string, any[]> = {};
    (items || []).forEach((m: any) => {
      const dt = m?.uploadedAt ? new Date(m.uploadedAt) : new Date(m?.timestamp || Date.now());
      const month = dt.toLocaleString(undefined, { month: 'long' });
      const year = dt.getFullYear();
      const key = `${month} ${year}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    });

    const sortedKeys = Object.keys(groups).sort((a, b) => {
      const aDate = new Date(groups[a][0]?.uploadedAt || groups[a][0]?.timestamp || Date.now()).getTime();
      const bDate = new Date(groups[b][0]?.uploadedAt || groups[b][0]?.timestamp || Date.now()).getTime();
      return bDate - aDate;
    });

    return sortedKeys.map((key) => {
      const groupDate = new Date(groups[key][0]?.uploadedAt || groups[key][0]?.timestamp || Date.now());
      const monthLabel = groupDate.toLocaleString(undefined, { month: 'long' });
      const year = groupDate.getFullYear();
      const displayLabel = year === new Date().getFullYear() ? monthLabel : `${monthLabel} ${year}`;
      return { key, displayLabel, items: groups[key] };
    });
  };

  const groupedMedia = groupByMonth(media);
  const groupedLinks = groupByMonth(links);
  const groupedDocs = groupByMonth(docs);
  // Slide in from right on open, always slide out to the right on close
  const panelTranslateClass = show ? 'translate-x-0' : 'translate-x-full';
  const panelClass = ['flex','p-6','flex-col','items-start','gap-6','absolute','right-3','top-3','rounded-3xl','bg-white','shadow-xl','w-[450px]','h-[1000px]','overflow-hidden','z-50','transform','transition-transform','duration-300','ease-in-out', panelTranslateClass].join(' ');

  if (!mounted) return null;

  return (
    <>
          <div
            className={`fixed inset-0 z-40 bg-black transition-opacity duration-300 ${show ? 'opacity-40' : 'opacity-0 pointer-events-none'}`}
            onClick={onClose}
            aria-hidden="true"
          />

          <div className={panelClass}>
        <button onClick={onClose} className="cursor-pointer text-nowrap flex justify-center items-center gap-2.5 w-full">
          <p className="text-[#111625] font-interDisplay text-xl font-semibold leading-7 w-full">Contact Info</p>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 overflow-hidden relative ">
            <path d="M18 6L6 18M6 6L18 18" stroke="#596881" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="flex flex-col items-center gap-4 w-full">
          <div className="flex justify-center items-center rounded-[1800px] bg-[#F7F9FB] w-[72px] h-[72px] overflow-hidden">
            <img src={getAvatarSrc(user.avatar)} className="shrink-0 rounded-[72px] w-[72px] h-[72px] max-w-none" alt={user.name || 'avatar'} />
          </div>
          <div className="flex flex-col items-center gap-1 w-full">
            <p className="text-[#111625] font-inter text-base font-medium leading-6 w-full text-center tracking-[-0.011em]">{user.name}</p>
            <p className="text-[#8B8B8B] font-inter text-xs leading-4 w-fit">{user.email}</p>
          </div>
        </div>

        <div className="flex items-start gap-4 w-full">
          <button className="cursor-pointer text-nowrap flex p-2 justify-center items-center gap-1.5 rounded-lg border border-[#E8E5DF] bg-[#FFF] w-full h-8 overflow-hidden">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px] overflow-hidden relative ">
              <path d="M3.75 3H6.75L8.25 6.75L6.375 7.875C7.17822 9.50365 8.49635 10.8218 10.125 11.625L11.25 9.75L15 11.25V14.25C15 14.6478 14.842 15.0294 14.5607 15.3107C14.2794 15.592 13.8978 15.75 13.5 15.75C10.5744 15.5722 7.81511 14.3299 5.74262 12.2574C3.67013 10.1849 2.42779 7.42555 2.25 4.5C2.25 4.10218 2.40804 3.72064 2.68934 3.43934C2.97064 3.15804 3.35218 3 3.75 3Z" stroke="#111625" strokeWidth="0.975" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-[#111625] font-inter text-sm font-medium leading-5 w-fit tracking-[-0.006em]">Audio</p>
          </button>
          <button className="cursor-pointer text-nowrap flex p-2 justify-center items-center gap-1.5 rounded-lg border border-[#E8E5DF] bg-[#FFF] w-full h-8 overflow-hidden">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px] overflow-hidden relative ">
              <path d="M11.25 7.5L14.6647 5.793C14.7791 5.73587 14.9061 5.70891 15.0337 5.71466C15.1614 5.72041 15.2855 5.75868 15.3942 5.82585C15.5029 5.89302 15.5927 5.98685 15.6549 6.09845C15.7172 6.21005 15.7499 6.3357 15.75 6.4635V11.5365C15.7499 11.6643 15.7172 11.7899 15.6549 11.9015C15.5927 12.0131 15.5029 12.107 15.3942 12.1741C15.2855 12.2413 15.1614 12.2796 15.0337 12.2853C14.9061 12.2911 14.7791 12.2641 14.6647 12.207L11.25 10.5V7.5Z" stroke="#111625" strokeWidth="0.975" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2.25 6C2.25 5.60218 2.40804 5.22064 2.68934 4.93934C2.97064 4.65804 3.35218 4.5 3.75 4.5H9.75C10.1478 4.5 10.5294 4.65804 10.8107 4.93934C11.092 5.22064 11.25 5.60218 11.25 6V12C11.25 12.3978 11.092 12.7794 10.8107 13.0607C10.5294 13.342 10.1478 13.5 9.75 13.5H3.75C3.35218 13.5 2.97064 13.342 2.68934 13.0607C2.40804 12.7794 2.25 12.3978 2.25 12V6Z" stroke="#111625" strokeWidth="0.975" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-[#111625] font-inter text-sm font-medium leading-5 w-fit tracking-[-0.006em]">Video</p>
          </button>
        </div>

        <div className="flex flex-col items-start gap-3 w-full h-full">
          <div className="flex p-0.5 justify-center items-center rounded-xl bg-[#F3F3EE] w-fit overflow-hidden">
            <button
              onClick={() => setActiveTab('media')}
              className={`cursor-pointer text-nowrap flex py-2 px-2.5 justify-center items-center gap-2 rounded-[10px] transition-colors ${
                activeTab === 'media'
                  ? 'bg-[#FFF] shadow-[0016px0rgba(0,0,0,0.06)]'
                  : 'text-[#8B8B8B]'
              }`}
            >
              <p className="text-[#111625] font-inter text-sm font-medium leading-5 w-fit tracking-[-0.006em]">Media</p>
            </button>
            <button
              onClick={() => setActiveTab('links')}
              className={`cursor-pointer text-nowrap flex py-2 px-2.5 justify-center items-center gap-2 rounded-[10px] transition-colors ${
                activeTab === 'links' ? 'bg-[#FFF] shadow-[0016px0rgba(0,0,0,0.06)]' : 'text-[#8B8B8B]'
              }`}
            >
              <p className="font-inter text-sm font-medium leading-5 w-fit tracking-[-0.006em]">Link</p>
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`cursor-pointer text-nowrap flex py-2 px-2.5 justify-center items-center gap-2 rounded-[10px] transition-colors ${
                activeTab === 'docs' ? 'bg-[#FFF] shadow-[0016px0rgba(0,0,0,0.06)]' : 'text-[#8B8B8B]'
              }`}
            >
              <p className="font-inter text-sm font-medium leading-5 w-fit tracking-[-0.006em]">Docs</p>
            </button>
          </div>

          <div className="flex flex-col items-start gap-2 rounded-xl w-full h-full overflow-hidden">
            {activeTab === 'media' && (
              <div className="flex flex-col gap-4">
                {(!media || media.length === 0) ? (
                  <div className="col-span-4 flex items-center justify-center py-10 bg-[#F8F8F5] rounded-lg">
                    <div className="text-center">
                      <FileText className="mx-auto text-[#B0B7BD] w-6 h-6" />
                      <p className="text-[#8B8B8B] text-sm mt-2">No media shared</p>
                    </div>
                  </div>
                ) : (
                  groupedMedia.map(group => (
                    <div key={group.key} className="flex flex-col gap-3">
                      <div className="flex py-2 px-3 items-center gap-3 rounded-lg bg-[#F8F8F5] w-full overflow-hidden">
                        <p className="text-[#8B8B8B] font-inter text-xs font-medium leading-4 w-fit">{group.displayLabel}</p>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {group.items.map((item: any) => (
                          <button key={item.id} className="relative group overflow-hidden rounded-lg aspect-square hover:opacity-80 transition-opacity">
                            <img src={item.thumbnail || item.url} alt={item.title} className="object-cover w-full h-full" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-white text-xs font-semibold">View</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'links' && (
              <div className="space-y-3 w-full">
                {(!links || links.length === 0) ? (
                  <p className="text-center text-muted-foreground text-sm py-8">No links shared</p>
                ) : (
                  groupedLinks.map(group => (
                    <div key={group.key} className="flex flex-col gap-3">
                      <div className="flex py-2 px-3 items-center gap-3 rounded-lg bg-[#F8F8F5] w-full overflow-hidden">
                        <p className="text-[#8B8B8B] font-inter text-xs font-medium leading-4 w-fit">{group.displayLabel}</p>
                      </div>
                      <div className="space-y-2 w-full">
                        {group.items.map((link: any) => (
                          <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 p-3 rounded-lg bg-white border border-[#E8E5DF] hover:bg-[#F8F8F5] transition-colors group">
                            <LinkIcon className="w-4 h-4 text-[#8B8B8B] flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">{link.title}</p>
                              <p className="text-xs text-[#8B8B8B] truncate">{link.url}</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'docs' && (
              <div className="space-y-2 w-full">
                {(!docs || docs.length === 0) ? (
                  <p className="text-center text-muted-foreground text-sm py-8">No docs shared</p>
                ) : (
                  groupedDocs.map(group => (
                    <div key={group.key} className="flex flex-col gap-3">
                      <div className="flex py-2 px-3 items-center gap-3 rounded-lg bg-[#F8F8F5] w-full overflow-hidden">
                        <p className="text-[#8B8B8B] font-inter text-xs font-medium leading-4 w-fit">{group.displayLabel}</p>
                      </div>
                      <div className="space-y-2 w-full">
                        {group.items.map((doc: any) => {
                          const getDocIcon = (filename: string) => {
                            if (filename.endsWith('.pdf')) return <FileText className="w-4 h-4 text-red-500" />;
                            if (filename.endsWith('.json')) return <FileJson className="w-4 h-4 text-yellow-500" />;
                            if (filename.endsWith('.js') || filename.endsWith('.ts')) return <FileCode className="w-4 h-4 text-blue-500" />;
                            return <FileText className="w-4 h-4 text-muted-foreground" />;
                          };

                          return (
                            <button key={doc.id} className="w-full flex items-center gap-3 p-3 rounded-lg bg-white border border-[#E8E5DF] hover:bg-[#F8F8F5] transition-colors text-left group">
                              <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center flex-shrink-0">{getDocIcon(doc.title)}</div>
                              <div className="flex-1 min-w-0"><p className="text-xs font-medium text-foreground truncate">{doc.title}</p></div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

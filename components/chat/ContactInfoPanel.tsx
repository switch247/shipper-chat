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
  const { user, media, links, docs } = contactInfo;
  const [activeTab, setActiveTab] = useState<'media' | 'links' | 'docs'>('media');

  // Handle outside click
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-80 bg-background border-l border-border shadow-lg z-50 flex flex-col overflow-y-auto transition-transform duration-300 ease-out animate-in slide-in-from-right-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-background z-10">
          <h3 className="font-semibold text-foreground">Contact Info</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* User Profile Section */}
        <div className="px-6 py-6 border-b border-border text-center">
          <Image
            src={user.avatar}
            alt={user.name}
            width={80}
            height={80}
            className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
          />
          <h2 className="text-lg font-semibold text-foreground mb-1">{user.name}</h2>
          <p className="text-sm text-muted-foreground mb-6">{user.email}</p>

          <div className="flex gap-2 justify-center">
            <Button className="flex-1 gap-2 bg-[var(--primary)] hover:bg-[var(--primary)] text-[var(--primary-foreground)]">
              <Phone className="w-4 h-4" />
              Audio
            </Button>
            <Button className="flex-1 gap-2 bg-[var(--primary)] hover:bg-[var(--primary)] text-[var(--primary-foreground)]">
              <Video className="w-4 h-4" />
              Video
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 py-4 border-b border-border sticky top-16 bg-background z-10">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('media')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'media'
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Media
            </button>
            {links.length > 0 && (
              <button
                onClick={() => setActiveTab('links')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'links'
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Links
              </button>
            )}
            {docs.length > 0 && (
              <button
                onClick={() => setActiveTab('docs')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'docs'
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Docs
              </button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-6 py-6 flex-1 overflow-y-auto">
          {/* Media Tab */}
          {activeTab === 'media' && (
            <div>
              <div className="grid grid-cols-4 gap-2">
                {media.length === 0 ? (
                  <p className="col-span-4 text-center text-muted-foreground text-sm py-8">
                    No media shared
                  </p>
                ) : (
                  media.map((item) => (
                    <button
                      key={item.id}
                      className="relative group overflow-hidden rounded-lg aspect-square hover:opacity-80 transition-opacity"
                    >
                      <Image
                        src={item.thumbnail || item.url}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">View</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Links Tab */}
          {activeTab === 'links' && (
            <div className="space-y-3">
              {links.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">
                  No links shared
                </p>
              ) : (
                links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors group"
                  >
                    <LinkIcon className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {link.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {link.url}
                      </p>
                    </div>
                  </a>
                ))
              )}
            </div>
          )}

          {/* Docs Tab */}
          {activeTab === 'docs' && (
            <div className="space-y-2">
              {docs.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">
                  No docs shared
                </p>
              ) : (
                docs.map((doc) => {
                  const getDocIcon = (filename: string) => {
                    if (filename.endsWith('.pdf')) {
                      return <FileText className="w-4 h-4 text-red-500" />;
                    }
                    if (filename.endsWith('.json')) {
                      return <FileJson className="w-4 h-4 text-yellow-500" />;
                    }
                    if (filename.endsWith('.js') || filename.endsWith('.ts')) {
                      return <FileCode className="w-4 h-4 text-blue-500" />;
                    }
                    return <FileText className="w-4 h-4 text-muted-foreground" />;
                  };

                  return (
                    <button
                      key={doc.id}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-left group"
                    >
                      <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center flex-shrink-0">
                        {getDocIcon(doc.title)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {doc.title}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

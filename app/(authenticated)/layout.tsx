'use client';

import { useAuth } from '@/lib/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { GlobalSidebar } from '@/components/layout/GlobalSidebar';
import { GlobalTopBar } from '@/components/layout/GlobalTopBar';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="w-screen h-screen flex bg-gray-50 overflow-hidden p-3">
      {/* Global Sidebar */}
      <GlobalSidebar />

      {/* Right Section */}
      <div className="flex-1 flex flex-col overflow-hidden  ml-3">
        {/* Global Top Bar */}
        <GlobalTopBar />

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-gray-50">
          {children}
        </div>
      </div>
    </div>
  );
}

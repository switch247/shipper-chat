'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { GlobalSidebar } from '@/components/layout/GlobalSidebar';
import { GlobalTopBar } from '@/components/layout/GlobalTopBar';
import { usePresence } from '@/hooks/use-presence';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, checkAuth } = useAuth();
  const router = useRouter();
  

  useEffect(() => {
    // Check authentication on mount
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Initialize socket presence using a dedicated hook
  usePresence();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="w-screen h-screen flex overflow-hidden p-2 bg-input">
      {/* Global Sidebar */}
      <GlobalSidebar />

      {/* Right Section */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/50">
        {/* Global Top Bar */}
        <GlobalTopBar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50/50">
          {children}
        </main>
      </div>
    </div>
  );
}

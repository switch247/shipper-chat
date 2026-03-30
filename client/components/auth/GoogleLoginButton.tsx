"use client";

import { GoogleLogin } from '@react-oauth/google';
import { useToast } from '@/components/ui/use-toast';
import { useChatStore } from '@/lib/store/chat-store';

export function GoogleLoginButton({ isLoading: propLoading }: { isLoading?: boolean } = {}) {
  const toast = useToast();
  const googleLogin = useChatStore((s) => s.googleLogin);
  const storeLoading = useChatStore((s) => s.isLoading);
  const loading = propLoading ?? storeLoading;

  if (loading) {
    return (
      <button className="w-full h-11 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-md font-medium flex items-center justify-center" disabled>
        <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin mr-2" />
        Signing in...
      </button>
    );
  }

  return (
    <GoogleLogin
      onSuccess={async (credentialResponse) => {
        const token = (credentialResponse as any)?.credential;
        if (!token) {
          toast.toast({ title: 'Google login failed', description: 'No credential received' });
          return;
        }

        try {
          await googleLogin(token);
          toast.toast({ title: 'Signed in', description: 'Welcome back' });
        } catch (err) {
          console.error('Google login error', err);
          toast.toast({ title: 'Login failed', description: 'Could not sign in with Google' });
        }
      }}
      onError={() => {
        toast.toast({ title: 'Google login failed', description: 'Authentication error' });
      }}
    />
  );
}

export default GoogleLoginButton;

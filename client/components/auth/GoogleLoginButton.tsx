"use client";

import { GoogleLogin } from '@react-oauth/google';
import { useToast } from '@/components/ui/use-toast';
import { useChatStore } from '@/lib/store/chat-store';
import { useRouter } from 'next/navigation';

export function GoogleLoginButton() {
  const toast = useToast();
  const googleLogin = useChatStore((s) => s.googleLogin);
  const router = useRouter();

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
          // Redirect to chat after successful login
          try { router.push('/chat'); } catch (err) { /* ignore */ }
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

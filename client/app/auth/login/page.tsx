'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, ArrowRight, Zap, Lock, Users } from 'lucide-react';

// Google Sign-In types
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { login, googleLogin, isLoading } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [error, setError] = useState('');

  // Initialize Google Sign-In
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        callback: handleGoogleCallback,
      });
    }
  }, []);

  const handleGoogleCallback = async (response: any) => {
    setIsLoadingGoogle(true);
    setError('');
    
    try {
      await googleLogin(response.credential);
      router.push('/chat');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google login failed. Please try again.';
      setError(message);
      toast.toast({ title: 'Google login failed', description: message, variant: 'destructive' });
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleGoogleLogin = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
      router.push('/chat');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(message);
      toast.toast({ title: 'Login failed', description: message, variant: 'destructive' });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      {/* Left: Login Form */}
      <div className="flex flex-col justify-center px-6 sm:px-8 lg:px-12 py-12">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg bg-[var(--primary)] flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-[var(--primary-foreground)]" />
            </div>
            <span className="text-xl font-bold text-foreground">ChatFlow</span>
          </div>

          {/* Headline */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Welcome back
            </h1>
            <p className="text-muted-foreground">
              Stay connected with your team. Sign in to continue.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 mb-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-sm text-[var(--primary)] hover:underline">
                  Forgot?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>

            {error && (
              <div className="px-3 py-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[var(--primary)] hover:bg-[var(--primary)] text-[var(--primary-foreground)] h-11 font-medium"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px bg-border flex-1" />
            <span className="text-xs text-muted-foreground">OR</span>
            <div className="h-px bg-border flex-1" />
          </div>

          {/* Social Buttons */}
          <div className="space-y-3 mb-8">
            {/* React OAuth Google login button */}
            <div className="w-full">
              {/* lazy-load component to avoid SSR issues */}
              {typeof window !== 'undefined' && (
                // @ts-ignore - dynamic import component
                <DynamicGoogleLogin />
              )}
            </div>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-[var(--primary)] font-semibold hover:underline">
              Sign up free
            </Link>
          </p>
        </div>
      </div>

      {/* Right: Promotional Content */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[var(--primary)]/10 to-[var(--primary)]/5 px-12 py-12">
        <div className="flex-1 flex flex-col justify-center">
          {/* Hero Section */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Real-time communication for teams
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Stay synchronized, reduce emails, and build stronger team connections with instant messaging and file sharing.
            </p>

            {/* Features Grid */}
            <div className="space-y-6">
              {[
                { icon: Zap, title: 'Lightning Fast', desc: 'Messages delivered instantly' },
                { icon: Lock, title: 'Fully Secure', desc: 'End-to-end encryption for all chats' },
                { icon: Users, title: 'Team Focused', desc: 'Perfect for groups and channels' },
              ].map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="flex gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-[var(--primary-foreground)]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="border-t border-border pt-8">
          <p className="text-sm text-muted-foreground mb-4">Trusted by thousands of teams worldwide</p>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-muted border-2 border-background"
                  style={{
                    backgroundImage: `url(https://api.dicebear.com/7.x/avataaars/svg?seed=user${i})`,
                  }}
                />
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">50K+</p>
              <p className="text-xs text-muted-foreground">Active users</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dynamically import the GoogleLoginButton to avoid SSR errors
const DynamicGoogleLogin = (props: any) => {
  const GoogleLoginButton = require('@/components/auth/GoogleLoginButton').GoogleLoginButton;
  return <GoogleLoginButton {...props} />;
};

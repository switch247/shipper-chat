'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react';

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

export default function SignupPage() {
  const router = useRouter();
  const { signup, googleLogin, isLoading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      setError(err instanceof Error ? err.message : 'Google signup failed. Please try again.');
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleGoogleSignup = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      await signup(fullName, email, password);
      router.push('/chat');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed. Please try again.');
    }
  };

  const passwordStrength = password ? (
    password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 'strong' : 
    password.length >= 6 ? 'medium' : 'weak'
  ) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      {/* Left: Signup Form */}
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
              Join ChatFlow
            </h1>
            <p className="text-muted-foreground">
              Start connecting with your team in seconds.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-4 mb-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full"
              />
            </div>

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
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
              {passwordStrength && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        passwordStrength === 'strong' ? 'bg-green-500 w-full' :
                        passwordStrength === 'medium' ? 'bg-yellow-500 w-2/3' :
                        'bg-red-500 w-1/3'
                      }`}
                    />
                  </div>
                  <span className={`text-xs font-medium ${
                    passwordStrength === 'strong' ? 'text-green-600' :
                    passwordStrength === 'medium' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full"
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-2 text-xs text-red-600">Passwords do not match</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading || password !== confirmPassword}
              className="w-full bg-[var(--primary)] hover:bg-[var(--primary)] text-[var(--primary-foreground)] h-11 font-medium"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin mr-2" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Terms */}
          <p className="text-xs text-muted-foreground mb-8">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-[var(--primary)] hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-[var(--primary)] hover:underline">
              Privacy Policy
            </Link>
          </p>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px bg-border flex-1" />
            <span className="text-xs text-muted-foreground">OR</span>
            <div className="h-px bg-border flex-1" />
          </div>

          {/* Social Buttons */}
          <div className="space-y-3 mb-8">
            <Button
              variant="outline"
              className="w-full h-11 font-medium"
              onClick={handleGoogleSignup}
              disabled={isLoadingGoogle}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </Button>
          </div>

          {/* Sign In Link */}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[var(--primary)] font-semibold hover:underline">
              Sign in
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
              Communication made simple
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Join thousands of teams already using ChatFlow to streamline their workflow and boost productivity.
            </p>

            {/* Checklist */}
            <div className="space-y-4">
              {[
                'Unlimited messaging and file sharing',
                'Organize conversations into channels',
                'Search through all your chat history',
                'Works seamlessly on all devices',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[var(--primary)] flex-shrink-0" />
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="border-t border-border pt-8">
          <blockquote className="mb-4">
            <p className="text-sm italic text-muted-foreground mb-2">
              "ChatFlow transformed how our team communicates. We've cut our email clutter by 80% and collaboration has never been better."
            </p>
            <footer className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted" />
              <div>
                <p className="text-sm font-semibold text-foreground">Sarah Johnson</p>
                <p className="text-xs text-muted-foreground">Product Manager at TechCorp</p>
              </div>
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}

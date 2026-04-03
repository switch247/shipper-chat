'use client';

import { useState } from 'react';
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
  const { signup, isLoading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [error, setError] = useState('');

  // Google signup handled by `GoogleLoginButton` component
  const DynamicGoogleLogin = (props: any) => {
    const GoogleLoginButton = require('@/components/auth/GoogleLoginButton').GoogleLoginButton;
    return <GoogleLoginButton {...props} />;
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
            <span className="text-xl font-bold text-foreground">ShipperChat</span>
          </div>

          {/* Headline */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Join ShipperChat
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
            <div className="w-full">
              {/* lazy-load component to avoid SSR issues */}
              {typeof window !== 'undefined' && (
                // @ts-ignore - dynamic import component
                <DynamicGoogleLogin />
              )}
            </div>
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
              Join thousands of teams already using ShipperChat to streamline their workflow and boost productivity.
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
              "ShipperChat transformed how our team communicates. We've cut our email clutter by 80% and collaboration has never been better."
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

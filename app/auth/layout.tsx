import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | Chat App',
  description: 'Connect and communicate instantly with your team.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}

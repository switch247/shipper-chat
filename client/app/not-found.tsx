import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, MessageCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
            <MessageCircle className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Page Not Found
          </CardTitle>
          <CardDescription className="text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-500">
            Error 404
          </div>
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/" className="flex items-center justify-center gap-2">
                <Home className="h-4 w-4" />
                Go Home
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/authenticated/chat" className="flex items-center justify-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Go to Chat
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Camera } from 'lucide-react';

export default function ProfilePage() {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Manage your account and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-4">Profile Picture</label>
            <div className="flex items-end gap-4">
              <div className="relative">
                <Image
                  src={typeof currentUser.avatar === 'string' && currentUser.avatar.trim() !== '' ? currentUser.avatar : '/placeholder-user.jpg'}
                  alt={currentUser.name || 'User avatar'}
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full object-cover"
                />
                <button className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">JPG, GIF or PNG. Max 5MB.</p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-semibold text-foreground">Personal Information</h3>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <Input
                id="name"
                defaultValue={currentUser.name}
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
                defaultValue={currentUser.email}
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-foreground mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                placeholder="Tell us about yourself"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={4}
              />
            </div>
          </div>

          {/* Password Section */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-sm font-semibold text-foreground">Password</h3>
            
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-foreground mb-2">
                Current Password
              </label>
              <Input
                id="current-password"
                type="password"
                placeholder="••••••••"
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-foreground mb-2">
                  New Password
                </label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-foreground mb-2">
                  Confirm Password
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                <span className="text-sm text-foreground">Email me about new messages</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                <span className="text-sm text-foreground">Email me about mentions</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4 rounded" />
                <span className="text-sm text-foreground">Email me about activity digests</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button className="bg-primary hover:bg-primary text-primary-foreground">
              Save Changes
            </Button>
            <Button variant="outline">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, User, Mail, Camera, Footprints, Star, Edit2, Save, X, Lock, AlertTriangle } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import { useSession } from '@/lib/auth';
import Link from 'next/link';
import { ProfileForm } from '@/components/ProfileForm';
import { ProfileImageUpload } from '@/components/ProfileImageUpload';
import { PasswordChangeForm } from '@/components/PasswordChangeForm';
import { EmailChangeForm } from '@/components/EmailChangeForm';
import { AccountDeletion } from '@/components/AccountDeletion';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  footShape?: string;
  onboardingComplete: boolean;
  favoriteShoe?: {
    id: string;
    name: string;
    brand: string;
    imageUrl?: string;
  };
}

const footShapeLabels: Record<string, string> = {
  egyptian: 'Egyptian',
  roman: 'Roman',
  greek: 'Greek',
  germanic: 'Germanic',
  celtic: 'Celtic',
};

export default function ProfilePage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    async function loadProfile() {
      if (!session?.user) return;
      
      try {
        const data = await fetchApi<UserProfile>('/api/v1/profile');
        setProfile(data);
        setEditName(data.name);
      } catch (err) {
        console.error('Failed to load profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    if (!sessionLoading) {
      if (session?.user) {
        loadProfile();
      } else {
        setLoading(false);
      }
    }
  }, [session, sessionLoading]);

  const handleSave = async () => {
    if (!editName.trim()) return;
    
    setSaving(true);
    setError(null);

    try {
      const updated = await fetchApi<{ success: boolean; data: UserProfile }>('/api/v1/profile', {
        method: 'PUT',
        body: JSON.stringify({ name: editName }),
      });
      
      if (updated.success) {
        setProfile(prev => prev ? { ...prev, name: editName } : null);
        setEditing(false);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (sessionLoading || loading) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex min-h-svh w-full flex-col items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Not Logged In</CardTitle>
            <CardDescription>Please log in to view your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/login">
              <Button className="w-full">Log In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh w-full flex-col p-6 md:p-10">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your profile information and account settings
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Edit2 className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="picture" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Picture
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="danger" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Danger
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Profile Overview</CardTitle>
                <CardDescription>Your current profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {profile?.image ? (
                      <img
                        src={profile.image}
                        alt={profile.name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{profile?.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {profile?.email}
                    </p>
                  </div>
                </div>

                {/* Foot Shape Section */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Footprints className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Foot Shape</span>
                    </div>
                    {profile?.footShape ? (
                      <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                        {footShapeLabels[profile.footShape] || profile.footShape}
                      </span>
                    ) : (
                      <Link href="/footchecker">
                        <Button variant="outline" size="sm">
                          Set Up
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Favorite Shoe Section */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Favorite Shoe</span>
                    </div>
                    {profile?.favoriteShoe ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {profile.favoriteShoe.brand} {profile.favoriteShoe.name}
                        </span>
                      </div>
                    ) : (
                      <Link href="/footchecker">
                        <Button variant="outline" size="sm">
                          Choose
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Onboarding Status */}
                {!profile?.onboardingComplete && (
                  <div className="border-t pt-4">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                      <p className="text-sm text-amber-600 dark:text-amber-400 mb-2">
                        Get personalized shoe recommendations in 3 simple steps:
                      </p>
                      <ol className="text-sm text-amber-600 dark:text-amber-400 space-y-1 mb-3">
                        <li>1. Set up your foot profile in Foot Lab</li>
                        <li>2. Add your first shoe with comfort ratings</li>
                        <li>3. Find your perfect match in Sole Mate</li>
                      </ol>
                      <Link href="/footchecker">
                        <Button size="sm" className="mt-2">
                          Start Setup
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <ProfileForm />
          </TabsContent>

          <TabsContent value="picture" className="space-y-6">
            <ProfileImageUpload 
              currentImage={profile?.image}
              onImageUpdate={(url) => {
                setProfile(prev => prev ? { ...prev, image: url } : null);
              }}
            />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <PasswordChangeForm />
            <EmailChangeForm currentEmail={profile?.email || ''} />
          </TabsContent>

          <TabsContent value="danger" className="space-y-6">
            <AccountDeletion />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

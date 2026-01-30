'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User, Mail, Camera, Footprints, Star, Edit2, Save, X } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import { useSession } from '@/lib/auth';
import Link from 'next/link';

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
    <div className="flex min-h-svh w-full flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">My Profile</CardTitle>
                <CardDescription>Manage your account settings</CardDescription>
              </div>
              {!editing && (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
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
                <button className="absolute bottom-0 right-0 p-1.5 bg-primary rounded-full text-primary-foreground hover:bg-primary/90">
                  <Camera className="h-3 w-3" />
                </button>
              </div>
              <div>
                {editing ? (
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold">{profile?.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {profile?.email}
                    </p>
                  </>
                )}
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

            {error && (
              <div className="text-sm text-red-500">{error}</div>
            )}

            {/* Edit Actions */}
            {editing && (
              <div className="flex gap-2 justify-end border-t pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                    setEditName(profile?.name || '');
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

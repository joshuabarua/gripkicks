'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from 'react';
import { User, Mail, Camera, Footprints, Star, Edit2, Lock, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import { useSession } from '@/lib/auth';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ProfileForm } from '@/components/ProfileForm';
import { ProfileImageUpload } from '@/components/ProfileImageUpload';
import { PasswordChangeForm } from '@/components/PasswordChangeForm';
import { EmailChangeForm } from '@/components/EmailChangeForm';
import { AccountDeletion } from '@/components/AccountDeletion';
import { FullPageLoading } from '@/components/ui/loading';

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

const tabs = [
  { key: 'overview', label: 'Overview', icon: User },
  { key: 'profile', label: 'Profile', icon: Edit2 },
  { key: 'picture', label: 'Picture', icon: Camera },
  { key: 'security', label: 'Security', icon: Lock },
  { key: 'danger', label: 'Danger', icon: AlertTriangle },
] as const;

type TabKey = typeof tabs[number]['key'];

export default function ProfilePage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  useEffect(() => {
    async function loadProfile() {
      if (!session?.user) return;
      
      try {
        const data = await fetchApi<UserProfile>('/api/v1/profile');
        if (data.isOk()) {
          setProfile(data.value);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
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

  if (sessionLoading || loading) {
    return <FullPageLoading text="Loading Profile" />;
  }

  if (!session?.user) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="font-tanker text-4xl mb-4">NOT LOGGED IN</h1>
          <p className="font-sora text-neutral-500 mb-6">Please log in to view your profile</p>
          <Link href="/auth/login">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-orange-500 hover:bg-orange-600 text-black font-tanker text-lg px-8 py-3 rounded-2xl transition-colors"
            >
              LOG IN
            </motion.button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      <section className="px-6 md:px-12 lg:px-16 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <p className="font-mono text-xs text-orange-500 mb-2 tracking-[0.3em]">[ACCOUNT]</p>
            <div className="flex items-center gap-6">
              <div className="relative">
                {profile?.image ? (
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-orange-500/20"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                    <User className="h-10 w-10 text-neutral-600" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="font-tanker text-4xl md:text-5xl">{profile?.name}</h1>
                <p className="font-sora text-neutral-500 flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4" />
                  {profile?.email}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex gap-2 mb-8 overflow-x-auto pb-2"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-sora text-sm transition-all whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'bg-orange-500 text-black font-medium'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:border-orange-500/30'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </motion.button>
              );
            })}
          </motion.div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                        <Footprints className="w-5 h-5 text-orange-500" />
                      </div>
                      {!profile?.footShape && (
                        <Link href="/footchecker">
                          <motion.span whileHover={{ scale: 1.05 }} className="font-mono text-[10px] text-orange-500 cursor-pointer">[SET UP]</motion.span>
                        </Link>
                      )}
                    </div>
                    <p className="font-mono text-[10px] text-neutral-600 mb-1">FOOT SHAPE</p>
                    <p className="font-tanker text-2xl text-white capitalize">
                      {profile?.footShape ? footShapeLabels[profile.footShape] || profile.footShape : 'Not set'}
                    </p>
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                        <Star className="w-5 h-5 text-orange-500" />
                      </div>
                      {!profile?.favoriteShoe && (
                        <Link href="/stash">
                          <motion.span whileHover={{ scale: 1.05 }} className="font-mono text-[10px] text-orange-500 cursor-pointer">[CHOOSE]</motion.span>
                        </Link>
                      )}
                    </div>
                    <p className="font-mono text-[10px] text-neutral-600 mb-1">FAVORITE SHOE</p>
                    <p className="font-tanker text-2xl text-white">
                      {profile?.favoriteShoe ? `${profile.favoriteShoe.brand} ${profile.favoriteShoe.name}` : 'Not set'}
                    </p>
                  </div>
                </div>

                {/* Onboarding CTA */}
                {!profile?.onboardingComplete && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl p-8 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-black/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/30 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />
                    </div>
                    <div className="relative">
                      <p className="font-mono text-[10px] text-black/60 mb-2">[SETUP_REQUIRED]</p>
                      <h3 className="font-tanker text-3xl text-black mb-3">COMPLETE YOUR PROFILE</h3>
                      <ol className="font-sora text-sm text-black/70 space-y-1 mb-4">
                        <li>1. Set up your foot profile in Foot Lab</li>
                        <li>2. Add your first shoe with comfort ratings</li>
                        <li>3. Find your perfect match</li>
                      </ol>
                      <Link href="/footchecker">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="bg-black text-orange-500 font-tanker text-lg px-6 py-3 rounded-2xl flex items-center gap-2"
                        >
                          START SETUP
                          <ArrowUpRight className="w-5 h-5" />
                        </motion.button>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8">
                <ProfileForm />
              </div>
            )}

            {activeTab === 'picture' && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8">
                <ProfileImageUpload 
                  currentImage={profile?.image}
                  onImageUpdate={(url) => {
                    setProfile(prev => prev ? { ...prev, image: url } : null);
                  }}
                />
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-4">
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8">
                  <PasswordChangeForm />
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8">
                  <EmailChangeForm currentEmail={profile?.email || ''} />
                </div>
              </div>
            )}

            {activeTab === 'danger' && (
              <div className="bg-neutral-900 border border-red-500/20 rounded-3xl p-6 md:p-8">
                <AccountDeletion />
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </main>
  );
}

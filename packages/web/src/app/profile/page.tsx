"use client";

import { useState, useEffect } from "react";
import {
  Footprints,
  Star,
  Edit2,
  Lock,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import { fetchApi } from "@/lib/api-client";
import { useSession } from "@/lib/auth";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileForm } from "@/components/ProfileForm";
import { PasswordChangeForm } from "@/components/PasswordChangeForm";
import { EmailChangeForm } from "@/components/EmailChangeForm";
import { AccountDeletion } from "@/components/AccountDeletion";
import { FullPageLoading } from "@/components/ui/loading";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Button } from "@/components/ui/button";

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
  egyptian: "Egyptian",
  roman: "Roman",
  greek: "Greek",
  germanic: "Germanic",
  celtic: "Celtic",
};

export default function ProfilePage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const displayName = profile?.name || session?.user?.name || "User";
  const displayEmail = profile?.email || session?.user?.email || "";
  const displayUserId = profile?.id || session?.user?.id;

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleProfileUpdated = (updatedProfile: { name: string }) => {
    setProfile((current) => {
      if (!current) {
        return {
          id: displayUserId || "",
          name: updatedProfile.name,
          email: displayEmail,
          onboardingComplete: false,
        };
      }

      return {
        ...current,
        name: updatedProfile.name,
      };
    });
  };

  useEffect(() => {
    async function loadProfile() {
      if (!session?.user) return;

      try {
        const data = await fetchApi<UserProfile>("/api/v1/profile");
        if (data.isOk()) {
          setProfile(data.value);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
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
          <p className="font-sora text-neutral-500 mb-6">
            Please log in to view your profile
          </p>
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
            <p className="font-mono text-xs text-orange-500 mb-2 tracking-[0.3em]">
              [ACCOUNT]
            </p>
            <div className="flex items-center gap-6">
              <div className="relative">
                <UserAvatar
                  userId={displayUserId}
                  name={displayName}
                  email={displayEmail}
                  className="w-20 h-20 rounded-2xl border-2 border-orange-500/20"
                  size={160}
                />
              </div>
              <div>
                <h1 className="font-tanker text-4xl md:text-5xl">
                  {displayName}
                </h1>
                <p className="font-sora text-neutral-500 mt-1">
                  {displayEmail}
                </p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-6">
            {/* Info Cards */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                    <Footprints className="w-5 h-5 text-orange-500" />
                  </div>
                  {!profile?.footShape && (
                    <Link href="/footchecker">
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        className="font-mono text-[10px] text-orange-500 cursor-pointer"
                      >
                        [SET UP]
                      </motion.span>
                    </Link>
                  )}
                </div>
                <p className="font-mono text-[10px] text-neutral-600 mb-1">
                  FOOT SHAPE
                </p>
                <p className="font-tanker text-2xl text-white capitalize">
                  {profile?.footShape
                    ? footShapeLabels[profile.footShape] || profile.footShape
                    : "Not set"}
                </p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                    <Star className="w-5 h-5 text-orange-500" />
                  </div>
                  {!profile?.favoriteShoe && (
                    <Link href="/stash">
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        className="font-mono text-[10px] text-orange-500 cursor-pointer"
                      >
                        [CHOOSE]
                      </motion.span>
                    </Link>
                  )}
                </div>
                <p className="font-mono text-[10px] text-neutral-600 mb-1">
                  FAVORITE SHOE
                </p>
                <p className="font-tanker text-2xl text-white">
                  {profile?.favoriteShoe
                    ? `${profile.favoriteShoe.brand} ${profile.favoriteShoe.name}`
                    : "Not set"}
                </p>
              </div>
            </motion.div>

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
                  <p className="font-mono text-[10px] text-black/60 mb-2">
                    [SETUP_REQUIRED]
                  </p>
                  <h3 className="font-tanker text-3xl text-black mb-3">
                    COMPLETE YOUR PROFILE
                  </h3>
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

            {/* Settings Sections */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="space-y-4"
            >
              {/* Profile Information */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden">
                <div 
                  className="p-6 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => toggleSection("profile")}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                      <Edit2 className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-tanker text-2xl text-white">Profile Information</h3>
                      <p className="font-sora text-sm text-neutral-500">Update your name and avatar</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="hidden sm:flex border border-white/10 rounded-full px-6">
                    {expandedSection === "profile" ? "Close" : "Edit"}
                  </Button>
                </div>
                <AnimatePresence>
                  {expandedSection === "profile" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-neutral-800 bg-black/20"
                    >
                      <div className="p-6 md:p-8">
                        <ProfileForm
                          initialProfile={{ name: displayName }}
                          email={displayEmail}
                          userId={displayUserId}
                          onProfileUpdated={handleProfileUpdated}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Security */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden">
                <div 
                  className="p-6 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => toggleSection("security")}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                      <Lock className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-tanker text-2xl text-white">Security</h3>
                      <p className="font-sora text-sm text-neutral-500">Change your password and email address</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="hidden sm:flex border border-white/10 rounded-full px-6">
                    {expandedSection === "security" ? "Close" : "Edit"}
                  </Button>
                </div>
                <AnimatePresence>
                  {expandedSection === "security" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-neutral-800 bg-black/20"
                    >
                      <div className="p-6 md:p-8 space-y-6">
                        <PasswordChangeForm />
                        <div className="h-px w-full bg-neutral-800" />
                        <EmailChangeForm currentEmail={profile?.email || ""} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Danger Zone */}
              <div className="bg-neutral-900 border border-red-500/20 rounded-3xl overflow-hidden">
                <div 
                  className="p-6 flex justify-between items-center cursor-pointer hover:bg-red-500/5 transition-colors"
                  onClick={() => toggleSection("danger")}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-tanker text-2xl text-red-500">Danger Zone</h3>
                      <p className="font-sora text-sm text-neutral-500">Permanently delete your account</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="hidden sm:flex border border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-400 rounded-full px-6">
                    {expandedSection === "danger" ? "Close" : "Manage"}
                  </Button>
                </div>
                <AnimatePresence>
                  {expandedSection === "danger" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-red-500/20 bg-black/20"
                    >
                      <div className="p-6 md:p-8">
                        <AccountDeletion />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Edit2,
  Lock,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import { fetchApi } from "@/lib/api-client";
import { useRequireAuth } from "@/lib/auth";
import Link from "@/components/ui/NavLink";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileForm } from "@/components/ProfileForm";
import { PasswordChangeForm } from "@/components/PasswordChangeForm";
import { EmailChangeForm } from "@/components/EmailChangeForm";
import { AccountDeletion } from "@/components/AccountDeletion";
import { useLoading } from "@/contexts/LoadingContext";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { FullPageLoading } from "@/components/ui/loading";
import { PageSurface } from "@/components/ui/PageSurface";
import { LabHeader } from "@/components/ui/LabHeader";
import { riseDelay, expandMotion } from "@/lib/motion";
import { useUserData } from "@/hooks/useUserData";
import { useFootProfile } from "@/hooks/useFootProfile";
import { cn } from "@/lib/utils";

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
  const { data: session, isPending: sessionLoading } = useRequireAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const { showLoader, hideLoader } = useLoading();
  const { profile: footProfile, isLoading: footProfileLoading } =
    useFootProfile();
  const displayName = profile?.name || session?.user?.name || "User";
  const displayEmail = profile?.email || session?.user?.email || "";
  const displayUserId = profile?.id ?? session?.user?.id ?? null;

  const { userStashData } = useUserData();

  const hasFootProfile = !!(footProfile?.shape && footProfile?.volume);
  const hasShoesInStash = userStashData && userStashData.length > 0;
  const shouldSkipOnboarding = hasFootProfile && hasShoesInStash;

  const favouriteUserShoe = userStashData?.find((item) => item.isFavourite);
  const favouriteShoe = favouriteUserShoe?.shoe;

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

  const handleProfileSaved = () => {
    setExpandedSection(null);
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
        setIsLoading(false);
      }
    }

    if (!sessionLoading) {
      if (session?.user) {
        loadProfile();
      }
    }
  }, [session, sessionLoading]);

  useEffect(() => {
    if (sessionLoading || (session?.user && isLoading)) {
      showLoader('profile');
    } else {
      hideLoader('profile');
    }
    return () => hideLoader('profile');
  }, [session?.user, sessionLoading, isLoading, showLoader, hideLoader]);

  if (!session?.user) {
    return <FullPageLoading text="Loading profile" />;
  }

  const sections = [
    {
      key: "profile",
      title: "Profile Information",
      subtitle: "Update your name",
      icon: Edit2,
      actionLabel: "Edit",
      danger: false,
      content: (
        <div className="p-6 md:p-8">
          <ProfileForm
            initialProfile={{ name: displayName }}
            onProfileUpdated={handleProfileUpdated}
            onSuccess={handleProfileSaved}
          />
        </div>
      ),
    },
    {
      key: "security",
      title: "Security",
      subtitle: "Change your password and email address",
      icon: Lock,
      actionLabel: "Edit",
      danger: false,
      content: (
        <div className="p-6 md:p-8 space-y-6">
          <PasswordChangeForm />
          <div className="h-px w-full bg-white/6" />
          <EmailChangeForm currentEmail={profile?.email || ""} />
        </div>
      ),
    },
    {
      key: "danger",
      title: "Danger Zone",
      subtitle: "Permanently delete your account",
      icon: AlertTriangle,
      actionLabel: "Manage",
      danger: true,
      content: (
        <div className="p-6 md:p-8">
          <AccountDeletion />
        </div>
      ),
    },
  ];

  return (
    <PageSurface>
      <div className="lab-container">
        <LabHeader title="Profile" />

        <div className="space-y-6">
          <section aria-label="Account identity" style={riseDelay(1)} className="lab-card lab-rise flex items-center gap-6 p-6">
            <UserAvatar
              userId={displayUserId}
              name={displayName}
              email={displayEmail}
              className="h-20 w-20 rounded-lg border border-white/10"
              size={160}
            />
            <div className="min-w-0">
              <h2 className="truncate font-ball-pill text-3xl">{displayName}</h2>
              <p className="mt-1 truncate font-mono text-sm text-brand-putty">{displayEmail}</p>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <div style={riseDelay(2)} className="lab-card lab-rise p-6">
              <div className="flex items-start justify-between gap-4">
                <p className="lab-label">Foot Shape</p>
                {!profile?.footShape && (
                  <Link href="/footlab" className="lab-button-ghost">Set up</Link>
                )}
              </div>
              <p className="mt-3 font-ball-pill text-2xl capitalize">
                {profile?.footShape
                  ? footShapeLabels[profile.footShape] || profile.footShape
                  : "Not set"}
              </p>
            </div>

            <div style={riseDelay(3)} className="lab-card lab-rise p-6">
              <div className="flex items-start justify-between gap-4">
                <p className="lab-label">Favourite Shoe</p>
                {!favouriteShoe && (
                  <Link href="/stash" className="lab-button-ghost">Choose</Link>
                )}
              </div>
              <p className="mt-3 font-ball-pill text-2xl">
                {favouriteShoe
                  ? `${favouriteShoe.brand} ${favouriteShoe.name}`
                  : "Not set"}
              </p>
            </div>
          </div>

          {!profile?.onboardingComplete &&
            !footProfileLoading &&
            userStashData !== undefined &&
            !shouldSkipOnboarding && (
            <section aria-labelledby="onboarding-cta-title" style={riseDelay(4)} className="lab-card lab-card-active lab-rise flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                <p className="lab-label mb-2">Next step</p>
                <h2 id="onboarding-cta-title" className="font-ball-pill text-3xl leading-tight">Complete your profile</h2>
                <p className="mt-2 max-w-lg font-mono text-sm leading-relaxed text-brand-putty">Set your foot profile, add a rated shoe, then compare matches.</p>
              </div>
              <Link href="/footlab" className="lab-button shrink-0">
                Start setup<ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </section>
          )}

          <div className="space-y-4">
            {sections.map((section, index) => {
              const isExpanded = expandedSection === section.key;
              const Icon = section.icon;
              return (
                <div
                  key={section.key}
                  style={riseDelay(5 + index)}
                  className={cn("lab-card lab-rise", section.danger && "border-red-500/20")}
                >
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls={`profile-section-${section.key}`}
                    onClick={() => toggleSection(section.key)}
                    className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-white/3"
                  >
                    <span className="flex items-center gap-4">
                      <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg", section.danger ? "bg-red-500/10" : "bg-white/5")}>
                        <Icon aria-hidden="true" className={cn("h-5 w-5", section.danger ? "text-red-500" : "text-brand-putty")} />
                      </span>
                      <span>
                        <span className="block font-ball-pill text-2xl text-brand-chalk">{section.title}</span>
                        <span className="block font-mono text-sm text-brand-putty">{section.subtitle}</span>
                      </span>
                    </span>
                    <span aria-hidden="true" className="lab-button-ghost hidden sm:inline-flex">
                      {isExpanded ? "Close" : section.actionLabel}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        key="section-body"
                        id={`profile-section-${section.key}`}
                        {...expandMotion}
                        className="overflow-hidden border-t border-white/6"
                      >
                        {section.content}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PageSurface>
  );
}

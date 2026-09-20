"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useSession } from "@/lib/auth";
import { fetchApi } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import ShoeImage from "@/components/ShoeImage";
import { ShoeSearch } from "@/components/ShoeSearch";
import { shoeSizes } from "@/constants/shoe-data";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FullPageLoading } from "@/components/ui/loading";
import type { Shoe } from "@/types/api";
import {
  useFootProfileStore,
  normalizeBackendFootProfile,
} from "@/stores/footProfileStore";
import { RatingButton, BackButton } from "@/components/onboarding/OnboardingHelpers";

type ShoeSizeOption = { value: string; label: string };
const isShoeSizeOption = (
  size: (typeof shoeSizes)[number],
): size is ShoeSizeOption => {
  return "value" in size;
};

interface ApiSuccessResponse {
  success: boolean;
}

type OnboardingStep = "welcome" | "foot-data" | "first-shoe" | "complete";
type ProfileResponse = {
  footShape?: string | null;
  footVolume?: string | null;
  onboardingComplete?: boolean;
};

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedShoe, setSelectedShoe] = useState<Shoe | null>(null);
  const [shoeFormData, setShoeFormData] = useState({
    size: "",
    condition: "new" as string,
    comfort: 5,
    performance: 5,
    notes: "",
  });

  const setFootProfile = useFootProfileStore((s) => s.setProfile);
  const addToStash = useMutation(api.stash.addToStash);
  const updateUserShoeStats = useMutation(api.stash.updateUserShoeStats);
  const convexUser = useQuery(
    api.users.findByBetterAuthId,
    session?.user ? { betterAuthId: session.user.id } : "skip",
  );
  const [footShape, setFootShape] = useState("");
  const [footVolume, setFootVolume] = useState("");
  const hasFootProfile = !!footShape && !!footVolume;

  const steps = useMemo(
    () =>
      [
        {
          key: "welcome",
          title: "Welcome to GripKicks",
          description: "Let&apos;s set up your profile",
        },
        {
          key: "foot-data",
          title: "Foot Profile",
          description: "Help us understand your feet",
        },
        {
          key: "first-shoe",
          title: "Your First Shoe",
          description: "Add a climbing shoe to your collection",
        },
        {
          key: "complete",
          title: "All Set!",
          description: "You&apos;re ready to climb",
        },
      ] as const,
    [],
  );

  const progress = ((steps.findIndex((step) => step.key === currentStep) + 1) / steps.length) * 100;

  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.push("/auth");
    }
  }, [session?.user, sessionLoading, router]);

  useEffect(() => {
    if (!session?.user) return;

    let ignore = false;

    async function loadProfile() {
      const response = await fetchApi<ProfileResponse>("/api/v1/profile");
      if (ignore || response.isErr()) return;

      const { footShape: savedFootShape, footVolume: savedFootVolume, onboardingComplete } = response.value;
      if (savedFootShape) setFootShape(savedFootShape);
      if (savedFootVolume) setFootVolume(savedFootVolume);

      const normalized = normalizeBackendFootProfile({
        footShape: savedFootShape ?? null,
        footVolume: savedFootVolume ?? null,
      });
      if (normalized) setFootProfile(normalized);

      if (onboardingComplete) {
        router.push("/stash");
        return;
      }

      if (savedFootShape && savedFootVolume) {
        setCurrentStep("first-shoe");
      }
    }

    loadProfile();

    return () => {
      ignore = true;
    };
  }, [router, session?.user, setFootProfile]);

  const handleNext = async () => {
    if (currentStep === "welcome") {
      setCurrentStep(hasFootProfile ? "first-shoe" : "foot-data");
    }
    else if (currentStep === "foot-data") {
      setIsLoading(true);
      try {
        await fetchApi("/api/v1/profile", {
          method: "PUT",
          body: JSON.stringify({ footShape, footVolume }),
        });
        const normalized = normalizeBackendFootProfile({ footShape, footVolume });
        if (normalized) setFootProfile(normalized);
      } catch (error) {
        console.error("Failed to save foot data:", error);
      } finally {
        setIsLoading(false);
      }
    } else if (currentStep === "first-shoe") {
      if (!selectedShoe) return;

      setIsLoading(true);
      try {
        let shoeAdded = false;
        if (convexUser) {
          try {
            const userShoeId = await addToStash({
              userId: convexUser._id,
              shoeId: selectedShoe._id as Id<"shoes">,
            });
            if (userShoeId) {
              await updateUserShoeStats({
                userShoeId,
                ...(shoeFormData.size ? { size: shoeFormData.size } : {}),
                ...(shoeFormData.condition
                  ? { condition: shoeFormData.condition }
                  : {}),
                ...(shoeFormData.notes ? { notes: shoeFormData.notes } : {}),
                comfortScore: shoeFormData.comfort,
                performanceRating: shoeFormData.performance,
              });
            }
            shoeAdded = true;
          } catch (error) {
            console.error("Failed to add shoe to stash:", error);
          }
        } else {
          console.error("Failed to add shoe to stash: user not loaded");
        }

        if (shoeAdded) {
          const onboardingResponse = await fetchApi<ApiSuccessResponse>(
            "/api/v1/onboarding",
            {
              method: "POST",
              body: JSON.stringify({
                footShape,
                favoriteShoeId: selectedShoe._id,
              }),
            },
          );

          if (!onboardingResponse.isOk()) {
            console.error(
              "Failed to complete onboarding:",
              onboardingResponse.error,
            );
          }
        } else {
          console.error("Failed to add shoe to stash");
        }
      } catch (error) {
        console.error("Failed to complete onboarding:", error);
      } finally {
        setIsLoading(false);
      }
    }

    // Move to next step
    const currentIndex = steps.findIndex((s) => s.key === currentStep);
    const nextStep = steps[currentIndex + 1];
    if (nextStep) {
      setCurrentStep(nextStep.key);
    }
  };

  const handlePrevious = () => {
    if (currentStep === "foot-data") setCurrentStep("welcome");
    else if (currentStep === "first-shoe") setCurrentStep(hasFootProfile ? "welcome" : "foot-data");
  };

  const handleSkipOnboarding = () => {
    router.push("/stash");
  };

  const handleFinish = () => {
    router.push("/stash");
  };

  if (sessionLoading) {
    return <FullPageLoading text="Loading" />;
  }

  const stepIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      <section className="px-6 md:px-12 lg:px-16 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Progress */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/30">
                Step {stepIndex + 1} of {steps.length}
              </p>
              <button
                onClick={handleSkipOnboarding}
                className="font-sora text-xs text-brand-putty/40 hover:text-brand-red transition-colors duration-500"
              >
                Skip for now
              </button>
            </div>
            <div className="w-full h-px bg-white/10 overflow-hidden">
              <motion.div
                className="h-full bg-brand-red/60"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === "welcome" && (
                <div className="text-center">
                  <h1 className="font-ball-pill text-5xl md:text-6xl mb-4">
                    WELCOME TO
                    <br />
                    <span className="text-brand-red">GRIPKICKS</span>
                  </h1>
                  <p className="font-sora text-neutral-400 text-lg mb-10">
                    Your personal climbing shoe companion
                  </p>

                  <div className="grid md:grid-cols-3 gap-4 text-left mb-10">
                    {[
                      {
                        title: "Know Your Feet",
                        desc: "Tell us your foot shape so we can narrow things down",
                      },
                      {
                        title: "Rate Your Shoes",
                        desc: "Track how each pair feels on comfort and performance",
                      },
                      {
                        title: "Find Your Fit",
                        desc: "Get shoe recs based on real data from your feet",
                      },
                    ].map((item) => (
                      <div
                        key={item.title}
                        className="bg-brand-surface border border-white/[0.06] p-6 group hover:border-brand-red/30 transition-colors duration-500"
                      >
                        <h3 className="font-ball-pill text-lg text-white mb-1">
                          {item.title}
                        </h3>
                        <p className="font-sora text-neutral-500 text-xs">
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    className="w-full bg-brand-red hover:bg-brand-red/80 text-black font-ball-pill text-xl py-4 transition-colors duration-500 flex items-center justify-center gap-2"
                  >
                    LET&apos;S GET STARTED
                  </motion.button>
                </div>
              )}

              {currentStep === "foot-data" && (
                <div className="bg-brand-surface border border-white/[0.06] p-8">
                  <h2 className="font-ball-pill text-3xl mb-2">FOOT SHAPE</h2>
                  <p className="font-sora text-neutral-500 text-sm mb-8">
                    This helps us recommend shoes that will fit you best
                  </p>

                  <div className="space-y-6">
                    <div>
                      <Label className="font-sora text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                        Select shape
                      </Label>
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        {[
                          {
                            value: "egyptian",
                            label: "Egyptian",
                            desc: "Big toe longest",
                          },
                          {
                            value: "roman",
                            label: "Roman",
                            desc: "First 3 toes even",
                          },
                          {
                            value: "greek",
                            label: "Greek",
                            desc: "Second toe longest",
                          },
                          {
                            value: "germanic",
                            label: "Germanic",
                            desc: "Big toe, others even",
                          },
                          {
                            value: "celtic",
                            label: "Celtic",
                            desc: "Big & 2nd toe even",
                          },
                        ].map((shape) => (
                          <motion.button
                            key={shape.value}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => setFootShape(shape.value)}
                            className={`p-3 rounded-2xl border text-left transition-all ${
                              footShape === shape.value
                                ? "border-brand-red bg-brand-red/10"
                                : "border-white/[0.06] hover:border-white/10 bg-black/50"
                            }`}
                          >
                            <div className="font-sora font-medium text-white text-sm">
                              {shape.label}
                            </div>
                            <div className="font-sora text-[10px] text-neutral-500 mt-1 leading-tight">
                              {shape.desc}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-sora text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                        Foot volume
                      </Label>
                      <div className="grid grid-cols-3 gap-3 mt-3">
                        {[
                          { value: "low", label: "Low", desc: "Narrow" },
                          { value: "medium", label: "Medium", desc: "Average" },
                          { value: "high", label: "High", desc: "Wide" },
                        ].map((volume) => (
                          <motion.button
                            key={volume.value}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => setFootVolume(volume.value)}
                            className={`p-3 rounded-2xl border text-center transition-all ${
                              footVolume === volume.value
                                ? "border-brand-red bg-brand-red/10"
                                : "border-white/[0.06] hover:border-white/10 bg-black/50"
                            }`}
                          >
                            <div className="font-sora font-medium text-white text-sm">
                              {volume.label}
                            </div>
                            <div className="font-sora text-[10px] text-neutral-500 mt-1 leading-tight">
                              {volume.desc}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <BackButton onClick={handlePrevious} />
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNext}
                        disabled={!footShape || !footVolume || isLoading}
                        className="bg-brand-red hover:bg-brand-red/80 disabled:opacity-50 text-black font-ball-pill text-lg px-8 py-3 transition-colors duration-500 flex items-center gap-2"
                      >
                        {isLoading ? "SAVING..." : "NEXT"}{" "}
                        <ChevronRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === "first-shoe" && (
                <div className="bg-brand-surface border border-white/[0.06] p-8">
                  <h2 className="font-ball-pill text-3xl mb-2">
                    ADD YOUR FIRST SHOE
                  </h2>
                  <p className="font-sora text-neutral-500 text-sm mb-8">
                    Search for a shoe and rate your experience with it
                  </p>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="font-sora text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                        Search shoes
                      </Label>
                      <div className="mt-2">
                        <ShoeSearch
                          onShoeSelect={setSelectedShoe}
                          selectedShoe={selectedShoe}
                        />
                      </div>
                    </div>

                    {selectedShoe && (
                      <div className="p-4 border border-brand-red/20 bg-brand-red/5">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 bg-neutral-800 rounded-xl overflow-hidden">
                            <ShoeImage
                              brand={selectedShoe.brand}
                              shoeName={selectedShoe.name}
                              className="w-full h-full object-contain p-2"
                              {...(selectedShoe.imageUrl
                                ? { imageUrl: selectedShoe.imageUrl }
                                : {})}
                              {...(selectedShoe.slug
                                ? { slug: selectedShoe.slug }
                                : {})}
                            />
                          </div>
                          <div>
                            <h3 className="font-sora font-semibold text-white">
                              {selectedShoe.name}
                            </h3>
                            <p className="font-sora text-[10px] uppercase tracking-[0.15em] text-neutral-500">
                              {selectedShoe.brand}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedShoe && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="font-sora text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                              Size
                            </Label>
                            <Select
                              value={shoeFormData.size}
                              onValueChange={(value) =>
                                setShoeFormData({
                                  ...shoeFormData,
                                  size: value,
                                })
                              }
                            >
                              <SelectTrigger className="bg-black border-white/[0.06] text-brand-chalk rounded-none h-12 focus:border-brand-red">
                                <SelectValue placeholder="Select size" />
                              </SelectTrigger>
                              <SelectContent className="bg-neutral-800 border-neutral-700">
                                {shoeSizes
                                  .filter(isShoeSizeOption)
                                  .map((size) => (
                                    <SelectItem
                                      key={size.value}
                                      value={size.value}
                                    >
                                      {size.label}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="font-sora text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                              Condition
                            </Label>
                            <Select
                              value={shoeFormData.condition}
                              onValueChange={(value: string) =>
                                setShoeFormData({
                                  ...shoeFormData,
                                  condition: value,
                                })
                              }
                            >
                              <SelectTrigger className="bg-black border-white/[0.06] text-brand-chalk rounded-none h-12 focus:border-brand-red">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-neutral-800 border-neutral-700">
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="like-new">
                                  Like New
                                </SelectItem>
                                <SelectItem value="good">Good</SelectItem>
                                <SelectItem value="worn">Worn</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="font-sora text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                              Comfort
                            </Label>
                            <div className="flex items-center gap-2 mt-2">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <RatingButton
                                  key={rating}
                                  rating={rating}
                                  currentRating={shoeFormData.comfort}
                                  onRatingChange={(rating) =>
                                    setShoeFormData({
                                      ...shoeFormData,
                                      comfort: rating,
                                    })
                                  }
                                />
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="font-sora text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                              Performance
                            </Label>
                            <div className="flex items-center gap-2 mt-2">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <RatingButton
                                  key={rating}
                                  rating={rating}
                                  currentRating={shoeFormData.performance}
                                  onRatingChange={(rating) =>
                                    setShoeFormData({
                                      ...shoeFormData,
                                      performance: rating,
                                    })
                                  }
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="font-sora text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                            Notes (optional)
                          </Label>
                          <Textarea
                            id="notes"
                            value={shoeFormData.notes}
                            onChange={(e) =>
                              setShoeFormData({
                                ...shoeFormData,
                                notes: e.target.value,
                              })
                            }
                            placeholder="Any additional notes about this shoe..."
                            rows={3}
                            className="bg-black border-white/[0.06] text-brand-chalk placeholder:text-brand-putty/30 focus:border-brand-red rounded-none"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between pt-4">
                      <BackButton onClick={handlePrevious} />
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNext}
                        disabled={
                          !selectedShoe || !shoeFormData.size || isLoading
                        }
                        className="bg-brand-red hover:bg-brand-red/80 disabled:opacity-50 text-black font-ball-pill text-lg px-8 py-3 transition-colors duration-500 flex items-center gap-2"
                      >
                        {isLoading ? "COMPLETING..." : "COMPLETE SETUP"}{" "}
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === "complete" && (
                <div className="text-center">
                  <h1 className="font-ball-pill text-5xl md:text-6xl mb-4">
                    YOU&apos;RE
                    <br />
                    <span className="text-brand-red">ALL SET!</span>
                  </h1>
                  <p className="font-sora text-neutral-400 text-lg mb-10">
                    Your profile is ready and you can start exploring
                  </p>

                  <div className="grid md:grid-cols-3 gap-4 mb-10">
                    {[
                      {
                        href: "/footlab",
                        label: "Foot Lab",
                      },
                      { href: "/stash", label: "My Shoes" },
                      { href: "/matcher", label: "Matcher" },
                    ].map((item) => (
                      <Link key={item.href} href={item.href}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="bg-brand-surface border border-white/[0.06] p-6 flex flex-col items-center gap-3 hover:border-brand-red/30 transition-colors duration-500 cursor-pointer"
                        >
                          <span className="font-ball-pill text-lg text-white">
                            {item.label}
                          </span>
                        </motion.div>
                      </Link>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleFinish}
                    className="w-full bg-brand-red hover:bg-brand-red/80 text-black font-ball-pill text-xl py-4 transition-colors duration-500 flex items-center justify-center gap-2"
                  >
                    GO TO SHOE SANCTUARY
                  </motion.button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}

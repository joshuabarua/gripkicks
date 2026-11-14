"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { fetchApi } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";
import { FullPageLoading } from "@/components/ui/loading";
import { stepMotion } from "@/lib/motion";
import type { Shoe } from "@/types/api";
import { WelcomeStep } from "@/components/onboarding/WelcomeStep";
import { FootDataStep } from "@/components/onboarding/FootDataStep";
import { QuizStep } from "@/components/onboarding/QuizStep";
import { FirstShoeStep, type ShoeFormData } from "@/components/onboarding/FirstShoeStep";
import { CompleteStep } from "@/components/onboarding/CompleteStep";

interface ApiSuccessResponse {
  success: boolean;
}

type OnboardingStep = "welcome" | "foot-data" | "quiz" | "first-shoe" | "complete";
type ProfileResponse = {
  footShape?: string | null;
  footVolume?: string | null;
  onboardingComplete?: boolean;
};

export default function OnboardingPage() {
  const router = useRouter();
  const { session, convexUser, isLoading: userLoading } = useCurrentUser();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedShoe, setSelectedShoe] = useState<Shoe | null>(null);
  const [shoeFormData, setShoeFormData] = useState<ShoeFormData>({
    size: "",
    condition: "new",
    comfort: 5,
    performance: 5,
    notes: "",
  });

  const addToStash = useMutation(api.stash.addToStash);
  const updateUserShoeStats = useMutation(api.stash.updateUserShoeStats);
  const [footShape, setFootShape] = useState("");
  const [footVolume, setFootVolume] = useState("");
  const hasFootProfile = !!footShape && !!footVolume;

  const steps = useMemo(
    () =>
      [
        { key: "welcome" },
        { key: "foot-data" },
        { key: "quiz" },
        { key: "first-shoe" },
        { key: "complete" },
      ] as const,
    [],
  );

  const progress = ((steps.findIndex((step) => step.key === currentStep) + 1) / steps.length) * 100;

  useEffect(() => {
    if (!userLoading && !session?.user) {
      router.push("/auth", { transitionTypes: ["page-nav"] });
    }
  }, [session?.user, userLoading, router]);

  useEffect(() => {
    if (!session?.user) return;

    let ignore = false;

    async function loadProfile() {
      const response = await fetchApi<ProfileResponse>("/api/v1/profile");
      if (ignore || response.isErr()) return;

      const { footShape: savedFootShape, footVolume: savedFootVolume, onboardingComplete } = response.value;
      if (savedFootShape) setFootShape(savedFootShape);
      if (savedFootVolume) setFootVolume(savedFootVolume);

      if (onboardingComplete) {
        router.push("/stash", { transitionTypes: ["page-nav"] });
        return;
      }

      if (savedFootShape && savedFootVolume) {
        setCurrentStep("quiz");
      }
    }

    loadProfile();

    return () => {
      ignore = true;
    };
  }, [router, session?.user]);

  const handleNext = async () => {
    if (currentStep === "welcome") {
      setCurrentStep(hasFootProfile ? "quiz" : "foot-data");
    }
    else if (currentStep === "foot-data") {
      setIsLoading(true);
      try {
        await fetchApi("/api/v1/profile", {
          method: "PUT",
          body: JSON.stringify({ footShape, footVolume }),
        });
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
    else if (currentStep === "quiz") setCurrentStep(hasFootProfile ? "welcome" : "foot-data");
    else if (currentStep === "first-shoe") setCurrentStep("quiz");
  };

  const handleSkipOnboarding = () => {
    router.push("/stash", { transitionTypes: ["page-nav"] });
  };

  const handleFinish = () => {
    router.push("/stash", { transitionTypes: ["page-nav"] });
  };

  if (userLoading) {
    return <FullPageLoading text="Loading" />;
  }

  const stepIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      <section className="px-6 md:px-12 lg:px-16 py-12">
        <div className="max-w-3xl mx-auto">

          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <p className="lab-label font-mono text-brand-putty/40">
                Step {stepIndex + 1} of {steps.length}
              </p>
              <button
                onClick={handleSkipOnboarding}
                className="font-mono text-xs text-brand-putty/40 hover:text-brand-putty transition-colors duration-500"
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


          <AnimatePresence mode="wait">
            <motion.div key={currentStep} {...stepMotion}>
              {currentStep === "welcome" && <WelcomeStep onNext={handleNext} />}

              {currentStep === "foot-data" && (
                <FootDataStep
                  footShape={footShape}
                  footVolume={footVolume}
                  isLoading={isLoading}
                  onFootShapeChange={setFootShape}
                  onFootVolumeChange={setFootVolume}
                  onNext={handleNext}
                  onBack={handlePrevious}
                />
              )}

              {currentStep === "quiz" && (
                <QuizStep
                  onPickShoe={(shoe) => {
                    setSelectedShoe(shoe);
                    setCurrentStep("first-shoe");
                  }}
                  onSearchInstead={() => setCurrentStep("first-shoe")}
                  onBack={handlePrevious}
                />
              )}

              {currentStep === "first-shoe" && (
                <FirstShoeStep
                  selectedShoe={selectedShoe}
                  shoeFormData={shoeFormData}
                  isLoading={isLoading}
                  onShoeSelect={setSelectedShoe}
                  onShoeFormDataChange={setShoeFormData}
                  onNext={handleNext}
                  onBack={handlePrevious}
                />
              )}

              {currentStep === "complete" && <CompleteStep onFinish={handleFinish} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}

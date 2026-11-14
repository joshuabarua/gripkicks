import type { Shoe } from "@/types/api";
import { BackButton } from "@/components/onboarding/OnboardingHelpers";
import { FirstShoeQuiz } from "@/components/matcher/FirstShoeQuiz";

interface QuizStepProps {
  onPickShoe: (shoe: Shoe) => void;
  onSearchInstead: () => void;
  onBack: () => void;
}

export function QuizStep({ onPickShoe, onSearchInstead, onBack }: QuizStepProps) {
  return (
    <div>
      <FirstShoeQuiz onPickShoe={onPickShoe} />
      <div className="mt-6 flex justify-between">
        <BackButton onClick={onBack} />
        <button
          type="button"
          onClick={onSearchInstead}
          className="font-mono text-xs text-brand-putty/60 transition-colors hover:text-brand-putty"
        >
          I know my shoe — search instead
        </button>
      </div>
    </div>
  );
}

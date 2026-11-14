import { motion } from "framer-motion";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="text-center">
      <h1 className="lab-title text-fluid-4xl mb-10">
        WELCOME
      </h1>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNext}
        className="lab-button w-full"
      >
        LET&apos;S GET STARTED
      </motion.button>
    </div>
  );
}

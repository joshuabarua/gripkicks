import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

interface RatingButtonProps {
  rating: number;
  currentRating: number;
  onRatingChange: (rating: number) => void;
}

export function RatingButton({ rating, currentRating, onRatingChange }: RatingButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => onRatingChange(rating)}
      className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center font-ball-pill text-sm transition-all ${
        currentRating >= rating
          ? "border-brand-red bg-brand-red/20 text-brand-red"
          : "border-white/10 text-brand-putty/30"
      }`}
    >
      {rating}
    </motion.button>
  );
}

interface BackButtonProps {
  onClick: () => void;
}

export function BackButton({ onClick }: BackButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="border border-white/[0.06] hover:border-brand-red/30 text-brand-putty/50 font-sora text-sm px-6 py-3 transition-all duration-500 flex items-center gap-2"
    >
      <ChevronLeft className="w-4 h-4" /> Back
    </motion.button>
  );
}

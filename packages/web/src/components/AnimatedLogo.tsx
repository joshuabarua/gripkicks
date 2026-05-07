import { motion, AnimatePresence } from "framer-motion";

interface AnimatedLogoImageProps {
  currentImageIndex: number;
  transitionImages: string[];
}

export function AnimatedLogoImage({ currentImageIndex, transitionImages }: AnimatedLogoImageProps) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.img
        key={currentImageIndex}
        src={transitionImages[currentImageIndex]}
        alt=""
        className="w-[180px] h-[180px] object-contain"
        initial={{ scale: 1.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.7, opacity: 0 }}
        transition={{ duration: 0.15 }}
      />
    </AnimatePresence>
  );
}

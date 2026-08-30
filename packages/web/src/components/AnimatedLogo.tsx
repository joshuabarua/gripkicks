import { motion, AnimatePresence } from "framer-motion";

interface AnimatedLogoImageProps {
  currentImageIndex: number;
  transitionImages: string[];
  reducedMotion?: boolean;
}

export function AnimatedLogoImage({
  currentImageIndex,
  transitionImages,
  reducedMotion = false,
}: AnimatedLogoImageProps) {
  const src = transitionImages[currentImageIndex];

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: "40vmin",
        height: "40vmin",
        maxWidth: "480px",
        maxHeight: "480px",
        minWidth: "240px",
        minHeight: "240px",
      }}
    >
      <AnimatePresence initial={false}>
        <motion.img
          key={src}
          src={src}
          alt=""
          className="absolute h-4/5 w-4/5 object-contain"
          initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: reducedMotion ? 1 : 1.03 }}
          transition={{
            duration: reducedMotion ? 0 : 0.18,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      </AnimatePresence>
    </div>
  );
}

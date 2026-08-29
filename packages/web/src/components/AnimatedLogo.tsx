import { motion, AnimatePresence } from "framer-motion";

interface AnimatedLogoImageProps {
  currentImageIndex: number;
  transitionImages: string[];
}

export function AnimatedLogoImage({ currentImageIndex, transitionImages }: AnimatedLogoImageProps) {
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
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </AnimatePresence>
    </div>
  );
}

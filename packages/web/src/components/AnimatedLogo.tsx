import { motion, AnimatePresence } from "framer-motion";

interface AnimatedLogoImageProps {
  currentImageIndex: number;
  transitionImages: string[];
}

export function AnimatedLogoImage({ currentImageIndex, transitionImages }: AnimatedLogoImageProps) {
  const src = transitionImages[currentImageIndex];

  return (
    <div className="relative" style={{ perspective: 800 }}>
      <div className="pointer-events-none absolute -inset-16 rounded-full bg-brand-red/10 blur-3xl" />

      <div className="relative h-[200px] w-[200px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent" />

        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentImageIndex}
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 1.3, opacity: 0, rotateY: -12 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            exit={{ scale: 0.7, opacity: 0, rotateY: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <img
              src={src}
              alt=""
              className="relative h-[150px] w-[150px] object-contain"
              style={{
                filter:
                  "drop-shadow(2.5px 0 0 rgba(244, 91, 91, 0.55)) drop-shadow(-2.5px 0 0 rgba(106, 155, 204, 0.55))",
              }}
            />
          </motion.div>
        </AnimatePresence>

        <motion.div
          className="pointer-events-none absolute top-0 h-[200%] w-1/3 -translate-y-1/4 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          style={{ rotate: 24 }}
          animate={{ x: ["-180%", "280%"] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="pointer-events-none absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-brand-blue/10" />
      </div>
    </div>
  );
}

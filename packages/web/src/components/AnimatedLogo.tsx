import { motion, AnimatePresence } from "framer-motion";

interface AnimatedLogoImageProps {
  currentImageIndex: number;
  transitionImages: string[];
}

const CHROMATIC =
  "drop-shadow(2px 0 0 rgba(244, 91, 91, 0.5)) drop-shadow(-2px 0 0 rgba(106, 155, 204, 0.5))";

export function AnimatedLogoImage({ currentImageIndex, transitionImages }: AnimatedLogoImageProps) {
  const src = transitionImages[currentImageIndex];

  return (
    <div className="relative" style={{ perspective: 1000 }}>
      <motion.div
        className="pointer-events-none absolute -inset-[20%] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 38% 32%, rgba(244,91,91,0.22), transparent 55%), radial-gradient(circle at 65% 70%, rgba(106,155,204,0.2), transparent 55%)",
        }}
        animate={{ opacity: [0.25, 0.45, 0.25], scale: [0.98, 1.02, 0.98] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="relative"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ y: [-6, 6, -6], rotateZ: [-1.5, 1.5, -1.5], rotateX: [3, -3, 3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="relative overflow-hidden flex items-center justify-center"
          style={{
            width: "40vmin",
            height: "40vmin",
            maxWidth: "480px",
            maxHeight: "480px",
            minWidth: "240px",
            minHeight: "240px",
          }}
        >
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentImageIndex}
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 1.1, opacity: 0, rotateY: -8, filter: "blur(2px)" }}
              animate={{ scale: 1, opacity: 1, rotateY: 0, filter: "blur(0px)" }}
              exit={{ scale: 0.86, opacity: 0, rotateY: 8, filter: "blur(2px)" }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              style={{
                maskImage: "radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 24%, rgba(0,0,0,0) 58%)",
                WebkitMaskImage: "radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 24%, rgba(0,0,0,0) 58%)",
              }}
            >
              <motion.img
                src={src}
                alt=""
                className="relative z-10 w-4/5 h-4/5 object-contain mix-blend-screen"
                animate={{
                  filter: [
                    `grayscale(65%) saturate(45%) contrast(1.1) ${CHROMATIC}`,
                    `grayscale(65%) saturate(45%) contrast(1.1) ${CHROMATIC.replace(/2px/g, "3.2px")}`,
                    `grayscale(65%) saturate(45%) contrast(1.1) ${CHROMATIC}`,
                  ],
                }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />

              <div
                className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.25] z-20"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

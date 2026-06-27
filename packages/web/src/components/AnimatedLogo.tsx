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
        className="pointer-events-none absolute -inset-24 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 38% 32%, rgba(244,91,91,0.22), transparent 55%), radial-gradient(circle at 65% 70%, rgba(106,155,204,0.2), transparent 55%)",
        }}
        animate={{ opacity: [0.55, 0.9, 0.55], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="relative"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ y: [-6, 6, -6], rotateZ: [-1.5, 1.5, -1.5], rotateX: [3, -3, 3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="relative h-[212px] w-[212px] overflow-hidden rounded-[2.4rem]"
          style={{
            background:
              "linear-gradient(150deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02) 42%, rgba(0,0,0,0.18))",
            boxShadow:
              "inset 0 1px 1px rgba(255,255,255,0.35), inset 0 -16px 40px rgba(0,0,0,0.45), inset 0 14px 30px rgba(255,255,255,0.06), 0 24px 60px rgba(0,0,0,0.55)",
            backdropFilter: "blur(22px) saturate(140%)",
            WebkitBackdropFilter: "blur(22px) saturate(140%)",
          }}
        >
          <motion.div
            className="pointer-events-none absolute -inset-px rounded-[2.4rem]"
            style={{
              padding: 1,
              background:
                "conic-gradient(from 0deg, rgba(244,91,91,0.55), rgba(106,155,204,0.55), rgba(120,140,93,0.5), rgba(244,91,91,0.55))",
              WebkitMask:
                "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              opacity: 0.5,
            }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          />

          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 80% at 28% 14%, rgba(255,255,255,0.4), rgba(255,255,255,0.06) 30%, transparent 55%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-x-6 top-2 h-12 rounded-full blur-md"
            style={{
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0.55), transparent)",
            }}
          />

          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentImageIndex}
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 1.25, opacity: 0, rotateY: -16, filter: "blur(6px)" }}
              animate={{ scale: 1, opacity: 1, rotateY: 0, filter: "blur(0px)" }}
              exit={{ scale: 0.72, opacity: 0, rotateY: 16, filter: "blur(6px)" }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.img
                src={src}
                alt=""
                className="relative z-10 h-[140px] w-[140px] object-contain"
                animate={{ filter: [CHROMATIC, CHROMATIC.replace(/2px/g, "3.2px"), CHROMATIC] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
              <img
                src={src}
                alt=""
                aria-hidden
                className="absolute top-[58%] h-[140px] w-[140px] -scale-y-100 object-contain opacity-25"
                style={{
                  WebkitMaskImage:
                    "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent 55%)",
                  maskImage:
                    "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent 55%)",
                  filter: "blur(1px)",
                }}
              />
            </motion.div>
          </AnimatePresence>

          <motion.div
            className="pointer-events-none absolute top-0 h-[220%] w-2/5 -translate-y-1/4 blur-[2px]"
            style={{
              rotate: 22,
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)",
            }}
            animate={{ x: ["-220%", "320%"] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="pointer-events-none absolute top-0 h-[220%] w-1/5 -translate-y-1/4"
            style={{
              rotate: 22,
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
            }}
            animate={{ x: ["-260%", "360%"] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.18 }}
          />

          <div
            className="pointer-events-none absolute inset-x-10 bottom-3 h-10 rounded-full blur-lg"
            style={{
              background:
                "radial-gradient(60% 100% at 50% 100%, rgba(244,91,91,0.3), transparent)",
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}

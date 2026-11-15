"use client";

import { Component, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import ShoeImage from "@/components/ShoeImage";
import type { FootShape, FootVolume } from "@/components/foot/FootGlyphs";

type ShowcaseShoe = NonNullable<ReturnType<typeof useShowcase>>[number];

// Fixed spots around the screen, as viewport percentages, so the layout is
// stable between renders. Odd slots are hidden on small screens.
const SLOTS = [
  { x: 4, y: 14, size: 96, drift: 22, delay: -4, tilt: -14 },
  { x: 82, y: 9, size: 84, drift: 26, delay: -11, tilt: 12 },
  { x: 14, y: 46, size: 72, drift: 24, delay: -7, tilt: 8 },
  { x: 90, y: 38, size: 100, drift: 28, delay: -2, tilt: -10 },
  { x: 6, y: 78, size: 88, drift: 25, delay: -15, tilt: 16 },
  { x: 72, y: 70, size: 76, drift: 23, delay: -9, tilt: -6 },
  { x: 44, y: 6, size: 64, drift: 27, delay: -13, tilt: 10 },
  { x: 58, y: 88, size: 92, drift: 24, delay: -5, tilt: -16 },
  { x: 30, y: 24, size: 60, drift: 29, delay: -18, tilt: 6 },
  { x: 66, y: 28, size: 68, drift: 22, delay: -1, tilt: -12 },
  { x: 24, y: 64, size: 80, drift: 26, delay: -20, tilt: 14 },
  { x: 86, y: 84, size: 70, drift: 25, delay: -8, tilt: -8 },
  { x: 38, y: 82, size: 66, drift: 28, delay: -12, tilt: 12 },
  { x: 52, y: 50, size: 58, drift: 30, delay: -16, tilt: -4 },
] as const;

function useShowcase(footShape: FootShape | null, footVolume: FootVolume | null) {
  return useQuery(api.shoes.fitShowcase, {
    ...(footShape ? { footShape } : {}),
    ...(footVolume ? { footVolume } : {}),
    limit: SLOTS.length,
  });
}

// Keep shoes that stay in the set on their spot; give newcomers free spots.
function assignSlots(shoes: ShowcaseShoe[], previous: Record<string, number>) {
  const next: Record<string, number> = {};
  const taken = new Set<number>();
  for (const shoe of shoes) {
    const slot = previous[shoe._id];
    if (slot !== undefined) {
      next[shoe._id] = slot;
      taken.add(slot);
    }
  }
  let free = 0;
  for (const shoe of shoes) {
    if (next[shoe._id] !== undefined) continue;
    while (taken.has(free)) free++;
    next[shoe._id] = free;
    taken.add(free);
  }
  return next;
}

type BackdropProps = {
  footShape?: FootShape | null;
  footVolume?: FootVolume | null;
  // "fixed" covers the whole viewport. "sticky" fills its positioned parent and
  // keeps the shoes in view only while that parent is on screen.
  layout?: "fixed" | "sticky";
};

function Backdrop({ footShape = null, footVolume = null, layout = "fixed" }: BackdropProps) {
  const result = useShowcase(footShape, footVolume);
  // Hold the last set while a new selection loads, so shoes swap rather than blink out.
  const [shoes, setShoes] = useState<ShowcaseShoe[]>([]);
  const [slots, setSlots] = useState<Record<string, number>>({});
  if (result !== undefined && result !== shoes) {
    setShoes(result);
    setSlots(assignSlots(result, slots));
  }

  const field = (
    <AnimatePresence>
        {shoes.map((shoe) => {
          const index = slots[shoe._id] ?? 0;
          const slot = SLOTS[index % SLOTS.length]!;
          return (
            <motion.div
              key={shoe._id}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 0.32, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.35 } }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: (index % 5) * 0.05 }}
              className={`absolute ${index % 2 === 1 ? "hidden sm:block" : ""}`}
              style={{ left: `${slot.x}%`, top: `${slot.y}%`, width: slot.size, height: slot.size * 0.7 }}
            >
              <div
                className="fit-shoe-float h-full w-full motion-reduce:animate-none"
                style={{ animationDuration: `${slot.drift}s`, animationDelay: `${slot.delay}s`, ["--tilt" as string]: `${slot.tilt}deg` }}
              >
                <ShoeImage
                  brand={shoe.brand}
                  shoeName={shoe.name}
                  imageUrl={shoe.imageUrl}
                  gender={shoe.gender}
                  context="thumbnail"
                  alt=""
                  className="h-full w-full object-contain"
                  transformation={[{ height: 140, width: 200, crop: "at_max", format: "png", quality: 70 }]}
                />
              </div>
            </motion.div>
          );
        })}
    </AnimatePresence>
  );

  if (layout === "sticky") {
    return (
      <div aria-hidden="true" data-testid="fit-shoe-backdrop" className="pointer-events-none absolute inset-0 z-0">
        <div className="sticky top-0 h-svh overflow-hidden">{field}</div>
      </div>
    );
  }
  return (
    <div aria-hidden="true" data-testid="fit-shoe-backdrop" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {field}
    </div>
  );
}

// Decorative only: if the query fails (for example before the Convex function
// is deployed), render nothing instead of breaking the page.
class SilentBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function FitShoeBackdrop(props: BackdropProps) {
  return (
    <SilentBoundary>
      <Backdrop {...props} />
    </SilentBoundary>
  );
}

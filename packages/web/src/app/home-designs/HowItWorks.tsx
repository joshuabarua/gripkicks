"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "@/components/ui/NavLink";
import { CompareArrows, ScoreTag, ToeProfile } from "@/components/foot/FootGlyphs";
import { riseDelay } from "@/lib/motion";
import { RATINGS_NEEDED, useToolStatus, type ToolStatus } from "./useToolStatus";

interface Step {
  title: string;
  copy: string;
  href: string;
  glyph: (lit: boolean) => ReactNode;
  done: boolean;
  label: string | null;
}

function buildSteps(status: ToolStatus | null): Step[] {
  const profile = status?.footProfile ?? null;
  const rated = status?.ratedCount ?? 0;
  return [
    {
      title: "Map your foot",
      copy: "Shape and volume decide which lasts fit you.",
      href: "/footlab",
      glyph: (lit) => <ToeProfile shape={profile?.shape ?? "egyptian"} active={lit} height={30} />,
      done: !!profile,
      label: status ? (profile ? `${profile.shape} · ${profile.volume}` : "Not set") : null,
    },
    {
      title: "Rate your shoes",
      copy: `${RATINGS_NEEDED} rated pairs are enough to learn what you like.`,
      href: "/stash",
      glyph: (lit) => <ScoreTag active={lit} height={30} />,
      done: rated >= RATINGS_NEEDED,
      label: status ? (rated >= RATINGS_NEEDED ? `${rated} shoes rated` : `${rated}/${RATINGS_NEEDED} shoes rated`) : null,
    },
    {
      title: "Compare fits",
      copy: "See which shoes fit climbers with feet like yours.",
      href: "/matcher",
      glyph: (lit) => <CompareArrows active={lit} height={30} />,
      done: false,
      label: status ? status.labels["/matcher?tab=mate"] : null,
    },
  ];
}

// Connector from one step's node to the next. Vertical in the stacked layout,
// horizontal once the steps sit in a row. Fills red when the step is done.
function Connector({ filled, delay }: { filled: boolean; delay: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <span
      aria-hidden="true"
      className="absolute left-[calc(3rem-1px)] top-[5rem] bottom-[-1rem] w-0.5 overflow-hidden rounded-full bg-white/10 md:left-[calc(50%+2.5rem)] md:right-[calc(-50%+2.5rem)] md:top-[calc(3rem-1px)] md:bottom-auto md:h-0.5 md:w-auto"
    >
      {filled && (
        <motion.span
          className="absolute inset-0 origin-top bg-brand-red scale-y-(--fill) md:origin-left md:scale-y-100 md:scale-x-(--fill)"
          initial={reduceMotion ? false : { "--fill": 0 }}
          whileInView={{ "--fill": 1 }}
          viewport={{ once: true }}
          style={{ "--fill": reduceMotion ? 1 : undefined } as never}
          transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
    </span>
  );
}

export function HowItWorksSection() {
  const status = useToolStatus();
  const steps = buildSteps(status);
  const nextIndex = steps.findIndex((step) => !step.done);

  return (
    <section id="home-steps" aria-labelledby="steps-title" className="scroll-mt-14 border-t border-white/6 bg-black px-fluid-md py-fluid-3xl md:px-fluid-xl">
      <div className="mx-auto max-w-(--fluid-container-xl)">
        <div className="mb-fluid-xl flex items-center gap-fluid-lg">
          <h2 id="steps-title" className="lab-title text-fluid-2xl">How it works</h2>
          <span aria-hidden="true" className="h-px flex-1 bg-white/10" />
        </div>
        <div className="lab-card lab-rise p-2">
          <ol className="grid md:grid-cols-3">
            {steps.map((step, index) => {
              const isNext = index === nextIndex;
              const lit = step.done || isNext;
              return (
                <li key={step.href} style={riseDelay(index)} className="lab-rise relative">
                  <Link
                    href={step.href}
                    aria-current={isNext ? "step" : undefined}
                    className={`group relative z-1 flex h-full gap-fluid-lg rounded-md border p-4 transition-colors duration-500 focus-visible:outline-brand-chalk md:flex-col md:items-center md:text-center ${
                      isNext ? "lab-card-active" : "border-transparent hover:bg-white/3"
                    }`}
                  >
                    <span
                      className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full border bg-brand-charcoal px-3 transition-colors duration-500 ${
                        step.done ? "border-brand-red bg-brand-red/15" : isNext ? "border-brand-red" : "border-white/15 group-hover:border-white/30"
                      }`}
                    >
                      <span className="w-full">{step.glyph(lit)}</span>
                    </span>
                    <div className="min-w-0 self-center">
                      <h3 className="wrap-break-word lab-title text-fluid-lg text-white">{step.title}</h3>
                      <p className="mt-2 font-mono text-sm leading-relaxed text-brand-putty">{step.copy}</p>
                      {step.label && (
                        <span className="lab-label mt-3 flex items-center gap-2 md:justify-center">
                          <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${step.done ? "bg-brand-red" : "border border-white/40"}`} />
                          <span className="text-brand-chalk">{step.label}</span>
                          {step.done && <span className="sr-only">(done)</span>}
                        </span>
                      )}
                    </div>
                  </Link>
                  {index < steps.length - 1 && <Connector filled={step.done} delay={0.2 + index * 0.25} />}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

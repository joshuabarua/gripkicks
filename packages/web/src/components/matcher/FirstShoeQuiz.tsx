"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import ShoeImage from "@/components/ShoeImage";
import { BrandLogo } from "@/components/stash/BrandLogo";
import { MatcherGridSkeleton } from "@/components/ui/skeleton";
import { riseDelay } from "@/lib/motion";
import { rankShoesForQuiz, type QuizAnswers, type ScoredShoe } from "@/utils/firstShoeQuiz";
import type { Shoe } from "@/types/api";

interface QuizOption<T> {
  value: T;
  label: string;
  hint?: string;
}

const QUESTIONS: Array<{
  key: keyof QuizAnswers;
  title: string;
  options: QuizOption<QuizAnswers[keyof QuizAnswers]>[];
}> = [
  {
    key: "discipline",
    title: "What climbing will you do most?",
    options: [
      { value: "gym", label: "Gym", hint: "Indoor walls and classes" },
      { value: "bouldering", label: "Bouldering", hint: "Short powerful problems" },
      { value: "sport", label: "Sport", hint: "Roped routes outside" },
      { value: "trad", label: "Trad", hint: "Long crack and gear routes" },
      { value: "any", label: "Not sure yet", hint: "Try a bit of everything" },
    ],
  },
  {
    key: "experience",
    title: "How long have you been climbing?",
    options: [
      { value: "new", label: "Just starting", hint: "Under 6 months" },
      { value: "first-year", label: "Under a year" },
      { value: "intermediate", label: "1–3 years" },
      { value: "advanced", label: "3+ years" },
    ],
  },
  {
    key: "priority",
    title: "Comfort or performance?",
    options: [
      { value: "comfort", label: "Comfort first", hint: "Flatter, easier on feet" },
      { value: "balanced", label: "Balanced" },
      { value: "performance", label: "Performance", hint: "Aggressive, precise" },
    ],
  },
  {
    key: "volume",
    title: "How wide is your foot?",
    options: [
      { value: "low", label: "Narrow" },
      { value: "medium", label: "Regular" },
      { value: "high", label: "Wide" },
      { value: "any", label: "Not sure" },
    ],
  },
];

export function FirstShoeQuiz({ onPickShoe }: { onPickShoe?: (shoe: Shoe) => void }) {
  const shoes = useQuery(api.shoes.listAll, { limit: 500 });
  const { convexUser } = useCurrentUser();
  const updateUser = useMutation(api.users.update);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const [done, setDone] = useState(false);
  const [profilePrefilled, setProfilePrefilled] = useState(false);

  if (!profilePrefilled && convexUser?.climbingExperience && answers.experience === undefined) {
    setProfilePrefilled(true);
    setAnswers((current) => ({ ...current, experience: convexUser.climbingExperience as QuizAnswers["experience"] }));
  }

  const results = useMemo(() => {
    if (!done || !shoes) return [];
    return rankShoesForQuiz(shoes as Parameters<typeof rankShoesForQuiz>[0], answers as QuizAnswers, 6);
  }, [done, shoes, answers]);

  if (done) {
    return <QuizResults results={results} loading={shoes === undefined} onRetake={() => { setAnswers({}); setStep(0); setDone(false); }} onPickShoe={onPickShoe} />;
  }

  const question = QUESTIONS[step]!;

  return (
    <section aria-label="First shoe quiz" className="lab-card lab-rise max-w-3xl p-fluid-lg" style={riseDelay(0)}>
      <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-fluid-md">
        <h2 className="lab-title text-fluid-lg">Find your first shoe</h2>
        <p className="font-mono text-xs text-brand-putty tabular-nums">{step + 1}/{QUESTIONS.length}</p>
      </div>

      <div className="mt-fluid-lg">
        <h3 className="font-amatic text-2xl tracking-wide text-brand-chalk">{question.title}</h3>
        <div role="radiogroup" aria-label={question.title} className="mt-fluid-md grid gap-2 sm:grid-cols-2">
          {question.options.map((option) => {
            const selected = answers[question.key] === option.value;
            return (
              <button
                key={String(option.value)}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  const next = { ...answers, [question.key]: option.value };
                  setAnswers(next);
                  if (step === QUESTIONS.length - 1) {
                    if (convexUser && next.experience && next.experience !== convexUser.climbingExperience) {
                      void updateUser({ id: convexUser._id, climbingExperience: next.experience });
                    }
                    setDone(true);
                  } else {
                    setStep(step + 1);
                  }
                }}
                className={selected
                  ? "lab-card-active flex min-h-11 flex-col items-start gap-1 rounded-lg border px-4 py-3 text-left text-white"
                  : "lab-button-ghost flex-col items-start gap-1 text-left"}
              >
                <span className="font-mono text-xs uppercase tracking-wider">{option.label}</span>
                {option.hint && <span className="font-mono text-[11px] normal-case tracking-normal text-brand-putty">{option.hint}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-fluid-lg flex justify-between">
        <button
          type="button"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="lab-button-ghost disabled:opacity-40"
        >
          Back
        </button>
        {answers[question.key] !== undefined && step < QUESTIONS.length - 1 && (
          <button type="button" onClick={() => setStep(step + 1)} className="lab-button-ghost">
            Next
          </button>
        )}
      </div>
    </section>
  );
}

function QuizResults({ results, loading, onRetake, onPickShoe }: { results: ScoredShoe[]; loading: boolean; onRetake: () => void; onPickShoe: ((shoe: Shoe) => void) | undefined }) {
  if (loading) return <MatcherGridSkeleton />;
  if (!results.length) {
    return (
      <section className="lab-card lab-rise p-fluid-xl" style={riseDelay(0)}>
        <h2 className="lab-title text-fluid-lg">No matches found</h2>
        <button type="button" onClick={onRetake} className="lab-button mt-fluid-lg">Retake quiz</button>
      </section>
    );
  }

  return (
    <div className="space-y-fluid-xl">
      <section className="lab-card lab-rise flex flex-col justify-between gap-4 p-fluid-lg sm:flex-row sm:items-center" style={riseDelay(0)}>
        <div>
          <h2 className="lab-title text-fluid-lg">Your first-shoe matches</h2>
          <p className="mt-2 font-mono text-base text-brand-putty">{results.length} shoes ranked from your answers.</p>
        </div>
        <button type="button" onClick={onRetake} className="lab-button-ghost shrink-0">Retake quiz</button>
      </section>

      <div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {results.map(({ shoe, score, reasons }, idx) => (
          <article key={shoe._id} aria-label={`${shoe.brand} ${shoe.name}`} style={riseDelay(1 + Math.min(idx, 8))} className="lab-card lab-card-lift lab-rise min-w-0">
            <div className="flex items-center justify-between gap-3 border-b border-white/6 px-fluid-lg py-2.5">
              <h3 className="truncate font-amatic text-2xl tracking-wide text-brand-chalk">{shoe.name}</h3>
              <div className="shrink-0 text-right font-mono">
                <p className="text-lg tabular-nums">{score}%</p>
                <p className="lab-label mt-0.5">Match</p>
              </div>
            </div>
            <div className="relative h-48 border-b border-white/6 bg-black/40 p-fluid-lg sm:h-56">
              <ShoeImage brand={shoe.brand} shoeName={shoe.name} imageUrl={shoe.imageUrl ?? undefined} slug={shoe.slug ?? undefined} className="h-full w-full" transformation={[{ height: 280, width: 400, crop: "at_max", format: "png" }]} />
              <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 font-mono text-sm font-semibold text-brand-chalk">{idx + 1}</span>
              <div className="absolute bottom-3 left-3 flex h-7 w-24 items-center justify-start px-1">
                <BrandLogo brand={shoe.brand} size="sm" tooltip />
              </div>
            </div>
            {reasons.length > 0 && (
              <ul aria-label="Why this shoe" className="flex flex-wrap gap-1.5 p-fluid-lg pb-0">
                {reasons.map((reason) => (
                  <li key={reason} className="rounded-full border border-white/15 bg-black/30 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-brand-putty">{reason}</li>
                ))}
              </ul>
            )}
            {onPickShoe && (
              <div className="p-fluid-lg pt-3">
                <button type="button" onClick={() => onPickShoe(shoe)} className="lab-button-ghost w-full justify-center">Add to my Sanctuary</button>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

import type { Shoe } from "@/types/api";

export type QuizDiscipline = "gym" | "bouldering" | "sport" | "trad" | "any";
export type QuizExperience = "new" | "first-year" | "intermediate" | "advanced";
export type QuizPriority = "comfort" | "balanced" | "performance";
export type QuizVolume = "low" | "medium" | "high" | "any";

export interface QuizAnswers {
  discipline: QuizDiscipline;
  experience: QuizExperience;
  priority: QuizPriority;
  volume: QuizVolume;
}

export const EXPERIENCE_OPTIONS: Array<{ value: QuizExperience; label: string }> = [
  { value: "new", label: "Just starting" },
  { value: "first-year", label: "Under a year" },
  { value: "intermediate", label: "1–3 years" },
  { value: "advanced", label: "3+ years" },
];

export interface ScoredShoe {
  shoe: Shoe;
  score: number;
  reasons: string[];
}

const AGGRESSIVENESS_ORDER = ["flat", "moderate", "aggressive"] as const;
const STIFFNESS_ORDER = ["soft", "medium", "stiff"] as const;

const EXPERIENCE_AGGRESSIVENESS: Record<QuizExperience, number> = {
  "new": 0,
  "first-year": 0,
  "intermediate": 1,
  "advanced": 2,
};

const EXPERIENCE_STIFFNESS: Record<QuizExperience, number> = {
  "new": 2,
  "first-year": 2,
  "intermediate": 1,
  "advanced": 0,
};

const PRIORITY_SHIFT: Record<QuizPriority, number> = {
  comfort: -1,
  balanced: 0,
  performance: 1,
};

const DISCIPLINE_ALTERNATIVES: Partial<Record<QuizDiscipline, string[]>> = {
  bouldering: ["competition", "gym"],
  sport: ["competition", "gym"],
  gym: ["bouldering", "sport"],
  trad: ["sport"],
};

function clampIndex(value: number, order: readonly string[]) {
  return Math.min(order.length - 1, Math.max(0, value));
}

function distanceScore(actual: string | undefined, target: number, order: readonly string[]) {
  const index = actual ? order.indexOf(actual as never) : -1;
  if (index === -1) return 50;
  const distance = Math.abs(index - target);
  if (distance === 0) return 100;
  if (distance === 1) return 60;
  return 20;
}

export function scoreShoeForQuiz(shoe: Shoe, answers: QuizAnswers): ScoredShoe {
  const reasons: string[] = [];

  let disciplineScore: number;
  if (answers.discipline === "any") {
    disciplineScore = 70;
  } else if (shoe.climbingDiscipline === answers.discipline) {
    disciplineScore = 100;
    reasons.push(`${shoe.climbingDiscipline} shoe`);
  } else if (shoe.climbingDiscipline === "gym") {
    disciplineScore = 65;
    reasons.push("all-rounder");
  } else if (DISCIPLINE_ALTERNATIVES[answers.discipline]?.includes(shoe.climbingDiscipline)) {
    disciplineScore = 60;
  } else {
    disciplineScore = 25;
  }

  const aggressivenessTarget = clampIndex(
    EXPERIENCE_AGGRESSIVENESS[answers.experience] + PRIORITY_SHIFT[answers.priority],
    AGGRESSIVENESS_ORDER,
  );
  const aggressivenessScore = distanceScore(shoe.aggressiveness, aggressivenessTarget, AGGRESSIVENESS_ORDER);
  if (aggressivenessScore === 100 && shoe.aggressiveness) {
    reasons.push(`${shoe.aggressiveness} profile`);
  }

  const stiffnessTarget = clampIndex(
    EXPERIENCE_STIFFNESS[answers.experience] - PRIORITY_SHIFT[answers.priority],
    STIFFNESS_ORDER,
  );
  const stiffnessScore = distanceScore(shoe.stiffness, stiffnessTarget, STIFFNESS_ORDER);
  if (stiffnessScore === 100 && shoe.stiffness) {
    reasons.push(`${shoe.stiffness} sole`);
  }

  let volumeScore: number;
  if (answers.volume === "any") {
    volumeScore = 70;
  } else if (shoe.volume === answers.volume) {
    volumeScore = 100;
    reasons.push(`${shoe.volume} volume`);
  } else if (shoe.volume === "medium" || answers.volume === "medium") {
    volumeScore = 60;
  } else {
    volumeScore = 25;
  }

  const score = Math.round(
    disciplineScore * 0.4 + aggressivenessScore * 0.3 + stiffnessScore * 0.15 + volumeScore * 0.15,
  );

  return { shoe, score, reasons };
}

export function rankShoesForQuiz(shoes: Shoe[], answers: QuizAnswers, limit = 6): ScoredShoe[] {
  const bestByName = new Map<string, ScoredShoe>();
  for (const shoe of shoes) {
    const scored = scoreShoeForQuiz(shoe, answers);
    const key = shoe.modelName ?? shoe.name;
    const existing = bestByName.get(key);
    if (!existing || scored.score > existing.score) {
      bestByName.set(key, scored);
    }
  }
  return [...bestByName.values()].sort((a, b) => b.score - a.score).slice(0, limit);
}

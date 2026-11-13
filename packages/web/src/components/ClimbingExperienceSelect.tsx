"use client";

import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { EXPERIENCE_OPTIONS } from "@/utils/firstShoeQuiz";

export function ClimbingExperienceSelect() {
  const { convexUser } = useCurrentUser();
  const updateUser = useMutation(api.users.update);

  return (
    <select
      aria-label="Climbing experience"
      value={convexUser?.climbingExperience ?? ""}
      disabled={!convexUser}
      onChange={(e) => {
        if (!convexUser || !e.target.value) return;
        void updateUser({ id: convexUser._id, climbingExperience: e.target.value });
      }}
      className="w-full appearance-none rounded-md border border-white/20 bg-white/2.5 px-3 py-2.5 font-mono text-sm text-brand-chalk transition-colors hover:bg-white/5 disabled:opacity-50"
    >
      <option value="">Not set</option>
      {EXPERIENCE_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
}

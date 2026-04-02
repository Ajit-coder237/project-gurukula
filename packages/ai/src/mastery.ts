import type { MasteryDelta } from "@tutoros/types";

export function applyMasteryDelta(current: number, delta: MasteryDelta): number {
  const next = current + delta.confidenceDelta;
  return Math.max(0, Math.min(1, Number(next.toFixed(3))));
}

export function spacedReviewDays(mastery: number): number {
  if (mastery < 0.35) return 1;
  if (mastery < 0.6) return 3;
  if (mastery < 0.8) return 7;
  return 14;
}

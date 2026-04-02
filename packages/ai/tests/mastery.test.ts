import { describe, expect, it } from "vitest";
import { applyMasteryDelta, spacedReviewDays } from "../src/mastery";

describe("mastery utils", () => {
  it("clamps mastery between 0 and 1", () => {
    expect(applyMasteryDelta(0.95, { topicId: "t1", confidenceDelta: 0.2, evidence: "great" })).toBe(1);
    expect(applyMasteryDelta(0.05, { topicId: "t1", confidenceDelta: -0.2, evidence: "struggle" })).toBe(0);
  });

  it("returns spaced intervals", () => {
    expect(spacedReviewDays(0.2)).toBe(1);
    expect(spacedReviewDays(0.5)).toBe(3);
    expect(spacedReviewDays(0.7)).toBe(7);
    expect(spacedReviewDays(0.95)).toBe(14);
  });
});

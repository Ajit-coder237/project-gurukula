import { describe, expect, it } from "vitest";
import { buildTutorSystemPrompt } from "@tutoros/ai";

describe("pedagogy prompt", () => {
  it("enforces grounded citations and steps", () => {
    const prompt = buildTutorSystemPrompt("socratic", "intuitive");
    expect(prompt).toContain("grounded");
    expect(prompt).toContain("Pedagogical policy");
    expect(prompt).toContain("Never fabricate citations");
  });
});

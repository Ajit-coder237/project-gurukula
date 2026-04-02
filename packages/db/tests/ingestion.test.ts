import { describe, expect, it } from "vitest";
import { chunkText } from "../src/ingestion";

describe("chunkText", () => {
  it("chunks content with overlap", () => {
    const text = Array.from({ length: 1600 }, (_, i) => `w${i}`).join(" ");
    const chunks = chunkText(text, 200, 50);
    expect(chunks.length).toBeGreaterThan(5);
    expect(chunks[0]).toContain("w0");
    expect(chunks[1]).toContain("w150");
  });
});

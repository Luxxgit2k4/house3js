import { describe, expect, it } from "vitest";
import { portfolioData, storyBeats } from "./portfolio-data.js";

describe("portfolio content", () => {
  it("contains the expected profile metadata", () => {
    expect(portfolioData.name).toBe("Lakshmanan Palani");
    expect(portfolioData.highlights.length).toBeGreaterThan(0);
    expect(Object.keys(portfolioData.links)).toEqual(expect.arrayContaining(["github", "linkedin"]));
  });

  it("keeps story beats sorted across the experience", () => {
    expect(storyBeats[0].at).toBe(0);
    expect(storyBeats.at(-1)?.at).toBeLessThanOrEqual(1);

    storyBeats.forEach((beat, index) => {
      if (index > 0) {
        expect(beat.at).toBeGreaterThan(storyBeats[index - 1].at);
      }

      expect(beat.title.length).toBeGreaterThan(0);
      expect(beat.facts.length).toBeGreaterThan(0);
    });
  });
});

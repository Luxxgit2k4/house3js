import { describe, expect, it } from "vitest";
import {
  buildFallbackProfileSceneData,
  extractReadmeLinks,
  formatDate,
  parseGitHubSceneData,
  stripMarkdown
} from "./profile-utils.js";
import { portfolioData } from "./portfolio-data.js";

describe("profile scene data helpers", () => {
  it("builds fallback data from the local portfolio source", () => {
    const sceneData = buildFallbackProfileSceneData();

    expect(sceneData.name).toBe(portfolioData.name);
    expect(sceneData.stats.repos).toBe(portfolioData.stats.publicRepos);
    expect(sceneData.links[1].label).toBe("Dev.to");
    expect(sceneData.topRepos).toHaveLength(portfolioData.highlights.length);
  });

  it("extracts links from HTML anchors in the README", () => {
    const readme = `
      <a href="https://github.com/Luxxgit2k4"><img alt="GitHub logo" /></a>
      <a href="https://wa.me/?message=Say+Hello"><img alt="WhatsApp logo" /></a>
    `;

    expect(extractReadmeLinks(readme)).toEqual([
      { label: "GitHub", url: "https://github.com/Luxxgit2k4" },
      { label: "Say Hello", url: "https://wa.me/?message=Say+Hello" }
    ]);
  });

  it("normalizes markdown and inline HTML into plain text", () => {
    expect(stripMarkdown("**Hello** [world](https://example.com) <br /> dev")).toBe("Hello world dev");
  });

  it("formats dates for scene labels", () => {
    expect(formatDate("2026-05-03T10:30:00Z")).toBe("May 3, 2026");
    expect(formatDate("")).toBe("Recently updated");
  });

  it("parses GitHub README and repo data into scene content", () => {
    const readme = `
      # Hi, I'm Lakshmanan Palani

      A creative web developer building playful interfaces.

      - Building immersive Three.js scenes
      - Learning DevSecOps

      <a href="https://github.com/Luxxgit2k4"><img alt="GitHub logo" /></a>
    `;
    const user = {
      name: "Lakshmanan Palani",
      bio: "GitHub bio fallback",
      public_repos: 48,
      followers: 12,
      following: 9,
      updated_at: "2026-05-03T10:30:00Z"
    };
    const repos = [
      {
        name: "playground",
        language: "JavaScript",
        fork: false,
        stargazers_count: 4,
        updated_at: "2026-05-02T00:00:00Z",
        description: "Interactive experiments"
      },
      {
        name: "security-notes",
        language: "Shell",
        fork: false,
        stargazers_count: 7,
        updated_at: "2026-05-01T00:00:00Z",
        description: "Pipeline notes"
      },
      {
        name: "forked-demo",
        language: "TypeScript",
        fork: true,
        stargazers_count: 99,
        updated_at: "2026-05-03T00:00:00Z",
        description: "Should be ignored"
      }
    ];

    const sceneData = parseGitHubSceneData(readme, user, repos);

    expect(sceneData.name).toBe("Lakshmanan Palani");
    expect(sceneData.headline).toBe("A creative web developer building playful interfaces.");
    expect(sceneData.aboutItems).toEqual(["Building immersive Three.js scenes", "Learning DevSecOps"]);
    expect(sceneData.stats.topLanguage).toBe("JavaScript");
    expect(sceneData.topRepos.map((repo) => repo.name)).toEqual(["security-notes", "playground"]);
    expect(sceneData.links[0]).toEqual({ label: "GitHub", url: "https://github.com/Luxxgit2k4" });
  });
});

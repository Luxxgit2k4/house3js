import { portfolioData } from "./portfolio-data.js";

export function buildFallbackProfileSceneData() {
  return {
    name: portfolioData.name,
    headline: portfolioData.bio,
    aboutItems: portfolioData.focus.slice(0, 4),
    links: Object.entries(portfolioData.links).map(([label, url]) => ({
      label: label === "devto" ? "Dev.to" : label[0].toUpperCase() + label.slice(1),
      url
    })),
    stats: {
      repos: portfolioData.stats.publicRepos,
      followers: portfolioData.stats.followers,
      following: portfolioData.stats.following,
      topLanguage: portfolioData.stack[0]?.label ?? "JavaScript",
      updatedAt: "Live on load"
    },
    topRepos: portfolioData.highlights.map((repo) => ({
      name: repo.name,
      language: repo.language,
      stars: 0,
      description: repo.description
    })),
    repoCards: [
      { label: "Public repos", value: `${portfolioData.stats.publicRepos}` },
      { label: "Followers", value: `${portfolioData.stats.followers}` },
      { label: "Following", value: `${portfolioData.stats.following}` },
      { label: "Top stack", value: portfolioData.stack[0]?.label ?? "JavaScript" }
    ]
  };
}

export function parseGitHubSceneData(readmeText, user, repos) {
  const lines = readmeText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const headingLine = lines.find((line) => /^#{1,6}\s/.test(line));
  const nameMatch = headingLine?.match(/I'?m\s+(.+)/i);
  const headline = lines.find(
    (line) =>
      !/^#{1,6}\s/.test(line) &&
      !line.startsWith("- ") &&
      !line.startsWith("<") &&
      !/^Connect with me/i.test(line) &&
      !/^###/.test(line)
  );

  const aboutItems = lines
    .filter((line) => line.startsWith("- "))
    .map((line) => stripMarkdown(line.slice(2)))
    .slice(0, 5);

  const links = extractReadmeLinks(readmeText).slice(0, 5);
  const topRepos = [...repos]
    .filter((repo) => !repo.fork)
    .sort((left, right) => {
      if (right.stargazers_count !== left.stargazers_count) {
        return right.stargazers_count - left.stargazers_count;
      }
      return new Date(right.updated_at) - new Date(left.updated_at);
    })
    .slice(0, 5)
    .map((repo) => ({
      name: repo.name,
      language: repo.language ?? "n/a",
      stars: repo.stargazers_count,
      description: repo.description ?? "No description yet"
    }));

  const languageSummary = Object.entries(
    repos.reduce((accumulator, repo) => {
      if (!repo.fork && repo.language) {
        accumulator[repo.language] = (accumulator[repo.language] ?? 0) + 1;
      }
      return accumulator;
    }, {})
  ).sort((left, right) => right[1] - left[1]);

  return {
    name: nameMatch?.[1]?.trim() ?? user.name ?? portfolioData.name,
    headline: stripMarkdown(headline ?? user.bio ?? portfolioData.bio),
    aboutItems,
    links,
    stats: {
      repos: user.public_repos,
      followers: user.followers,
      following: user.following,
      topLanguage: languageSummary[0]?.[0] ?? "JavaScript",
      updatedAt: formatDate(user.updated_at)
    },
    topRepos,
    repoCards: [
      { label: "Public repos", value: `${user.public_repos}` },
      { label: "Followers", value: `${user.followers}` },
      { label: "Following", value: `${user.following}` },
      { label: "Top language", value: languageSummary[0]?.[0] ?? "JavaScript" }
    ]
  };
}

export function extractReadmeLinks(readmeText) {
  const links = [];
  const matches = readmeText.matchAll(/<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g);

  for (const match of matches) {
    const [, url, innerHtml] = match;
    const messageMatch = url.match(/[?&]message=([^&"]+)/i) ?? innerHtml.match(/message=([^&"]+)/i);
    const altMatch = innerHtml.match(/alt="([^"]+)"/i);
    const rawLabel = messageMatch?.[1]
      ? decodeURIComponent(messageMatch[1].replace(/\+/g, " "))
      : altMatch?.[1] ?? "Link";

    links.push({
      label: rawLabel.replace(/\s*logo$/i, ""),
      url
    });
  }

  return links;
}

export function stripMarkdown(text) {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/[*_`>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatDate(value) {
  if (!value) {
    return "Recently updated";
  }

  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

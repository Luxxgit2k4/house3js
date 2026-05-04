import { clamp01, smoothRange } from "./story-math.js";

export const appShellMarkup = `
  <main class="story-root" aria-label="Lakshmanan Palani Three.js portfolio story">
    <canvas class="scene-canvas" aria-hidden="true"></canvas>
    <div class="atmosphere"></div>
    <div class="progress-track" aria-hidden="true">
      <span class="progress-fill"></span>
    </div>

    <div class="scroll-hint">
      <span class="scroll-hint-label">Scroll to walk the garden path</span>
      <span class="scroll-hint-line" aria-hidden="true"></span>
    </div>

    <button class="sound-toggle" type="button" aria-pressed="true">Sound on</button>

    <div class="intro-overlay">
      <div class="intro-panel">
        <p class="intro-eyebrow">Garden House Portfolio</p>
        <h1 class="intro-title">Enter Lakshmanan Palani&apos;s house</h1>
        <p class="intro-copy">
          A slower home tour through the garden, entrance, staircase, dancing room, and terrace.
        </p>
        <p class="intro-status">Loading scene assets...</p>
        <button class="enter-button" type="button" disabled>Loading 0%</button>
      </div>
    </div>
  </main>
  <div class="scroll-space" aria-hidden="true"></div>
`;

export function renderAppShell(root) {
  if (!root) {
    throw new Error("A root element is required to render the app shell.");
  }

  root.innerHTML = appShellMarkup;
  return getShellElements(root);
}

export function getShellElements(root = document) {
  return {
    canvas: root.querySelector(".scene-canvas"),
    progressFill: root.querySelector(".progress-fill"),
    scrollHint: root.querySelector(".scroll-hint"),
    soundToggle: root.querySelector(".sound-toggle"),
    introOverlay: root.querySelector(".intro-overlay"),
    introStatus: root.querySelector(".intro-status"),
    enterButton: root.querySelector(".enter-button")
  };
}

export function updateHud(progress, progressFill, scrollHint) {
  const normalizedProgress = clamp01(progress);

  progressFill.style.transform = `scaleX(${normalizedProgress.toFixed(4)})`;
  scrollHint.style.opacity = String(1 - smoothRange(normalizedProgress, 0.05, 0.22));
  scrollHint.style.transform = `translate(-50%, ${smoothRange(normalizedProgress, 0, 0.18) * 12}px)`;
}

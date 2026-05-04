import { describe, expect, it } from "vitest";
import { appShellMarkup, getShellElements, renderAppShell, updateHud } from "./app-shell.js";

describe("app shell", () => {
  it("renders the experience shell into the root element", () => {
    const root = document.createElement("div");
    const elements = renderAppShell(root);

    expect(root.innerHTML).toContain("Garden House Portfolio");
    expect(elements.canvas).not.toBeNull();
    expect(elements.soundToggle?.textContent).toContain("Sound on");
    expect(elements.enterButton?.disabled).toBe(true);
  });

  it("returns the expected element references from existing markup", () => {
    const root = document.createElement("div");
    root.innerHTML = appShellMarkup;

    const elements = getShellElements(root);

    expect(elements.progressFill?.className).toBe("progress-fill");
    expect(elements.scrollHint?.className).toBe("scroll-hint");
    expect(elements.introStatus?.textContent).toContain("Loading scene assets");
  });

  it("updates the hud progress and scroll hint state", () => {
    const root = document.createElement("div");
    root.innerHTML = appShellMarkup;
    const { progressFill, scrollHint } = getShellElements(root);

    updateHud(1.4, progressFill, scrollHint);

    expect(progressFill.style.transform).toBe("scaleX(1.0000)");
    expect(scrollHint.style.opacity).not.toBe("1");
    expect(scrollHint.style.transform).toContain("translate(-50%");
  });
});

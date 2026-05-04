import { describe, expect, it } from "vitest";
import { setupCounter } from "./counter.js";

describe("setupCounter", () => {
  it("renders the initial count and increments on click", () => {
    const button = document.createElement("button");

    setupCounter(button);
    expect(button.textContent).toBe("count is 0");

    button.click();
    button.click();

    expect(button.textContent).toBe("count is 2");
  });
});

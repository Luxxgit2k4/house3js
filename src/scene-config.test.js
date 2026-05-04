import { describe, expect, it } from "vitest";
import { cameraTrack } from "./scene-config.js";

describe("scene configuration", () => {
  it("keeps the camera track normalized and ordered", () => {
    expect(cameraTrack[0].at).toBe(0);
    expect(cameraTrack.at(-1)?.at).toBe(1);

    cameraTrack.forEach((point, index) => {
      if (index > 0) {
        expect(point.at).toBeGreaterThan(cameraTrack[index - 1].at);
      }

      expect(Number.isFinite(point.position.x)).toBe(true);
      expect(Number.isFinite(point.look.z)).toBe(true);
    });
  });
});

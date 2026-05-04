import * as THREE from "three";
import { describe, expect, it } from "vitest";
import {
  clamp01,
  pickGardenPosition,
  sampleCameraTrack,
  smoothPulse,
  smoothRange,
  smoothstep,
  wrapRange
} from "./story-math.js";

describe("story math helpers", () => {
  it("clamps values into the normalized range", () => {
    expect(clamp01(-2)).toBe(0);
    expect(clamp01(0.42)).toBe(0.42);
    expect(clamp01(7)).toBe(1);
  });

  it("computes smooth interpolation helpers", () => {
    expect(smoothstep(0)).toBe(0);
    expect(smoothstep(0.5)).toBeCloseTo(0.5);
    expect(smoothRange(0.5, 0, 1)).toBeCloseTo(0.5);
    expect(smoothPulse(0.5, 0.3, 0.7)).toBeGreaterThan(0.8);
  });

  it("wraps ranges for looping motion", () => {
    expect(wrapRange(67, -10, 10)).toBeCloseTo(7);
    expect(wrapRange(-13, -10, 10)).toBeCloseTo(7);
  });

  it("chooses a garden position outside the blocked scene zones", () => {
    const sequence = [0.5, 0.7, 0.02, 0.01];
    const randomFn = (min, max) => min + (max - min) * sequence.shift();

    const position = pickGardenPosition(randomFn);

    expect(position.x).toBeCloseTo(-32.64);
    expect(position.z).toBeCloseTo(-23.18);
  });

  it("samples along the camera track with smooth interpolation", () => {
    const track = [
      { at: 0, position: new THREE.Vector3(0, 0, 0), look: new THREE.Vector3(0, 0, 1) },
      { at: 1, position: new THREE.Vector3(10, 5, 0), look: new THREE.Vector3(0, 10, 1) }
    ];
    const outPosition = new THREE.Vector3();
    const outLook = new THREE.Vector3();

    sampleCameraTrack(track, 0.5, outPosition, outLook);

    expect(outPosition.x).toBeCloseTo(5);
    expect(outPosition.y).toBeCloseTo(2.5);
    expect(outLook.y).toBeCloseTo(5);
  });
});

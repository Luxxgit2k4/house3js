import * as THREE from "three";

export function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

export function clamp01(value) {
  return THREE.MathUtils.clamp(value, 0, 1);
}

export function smoothstep(value) {
  return value * value * (3 - 2 * value);
}

export function smoothRange(value, start, end) {
  return smoothstep(clamp01((value - start) / (end - start)));
}

export function smoothPulse(value, start, end, feather = 0.06) {
  return smoothRange(value, start - feather, start) * (1 - smoothRange(value, end, end + feather));
}

export function wrapRange(value, min, max) {
  const size = max - min;
  return ((((value - min) % size) + size) % size) + min;
}

export function pickGardenPosition(randomFn = randomRange) {
  let x = 0;
  let z = 0;
  let attempts = 0;

  do {
    x = randomFn(-34, 34);
    z = randomFn(-24, 58);
    attempts += 1;
  } while (
    attempts < 80 &&
    ((Math.abs(x) < 5.3 && z > 6 && z < 58) ||
      (Math.abs(x) < 11.6 && z > -9 && z < 12) ||
      (x > 8 && x < 20 && z < -10 && z > -26))
  );

  return { x, z };
}

export function sampleCameraTrack(track, progress, outPosition, outLook) {
  if (progress <= track[0].at) {
    outPosition.copy(track[0].position);
    outLook.copy(track[0].look);
    return;
  }

  for (let index = 1; index < track.length; index += 1) {
    const previous = track[index - 1];
    const next = track[index];
    if (progress <= next.at) {
      const t = smoothstep(clamp01((progress - previous.at) / (next.at - previous.at)));
      outPosition.lerpVectors(previous.position, next.position, t);
      outLook.lerpVectors(previous.look, next.look, t);
      return;
    }
  }

  outPosition.copy(track[track.length - 1].position);
  outLook.copy(track[track.length - 1].look);
}

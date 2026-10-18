// math/Vec3.js — minimal 3D vector library (plain [x,y,z] arrays / Float32Array).
// Every function returns a NEW array so call sites stay readable; fine for M1 scale.

export const create = (x = 0, y = 0, z = 0) => [x, y, z];
export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const length = (a) => Math.hypot(a[0], a[1], a[2]);
export const distance = (a, b) => length(sub(a, b));

// Right-handed cross product: x × y = z.
export const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

export function normalize(a) {
  const len = length(a);
  return len > 1e-12 ? [a[0] / len, a[1] / len, a[2] / len] : [0, 0, 0];
}

export const lerp = (a, b, t) => add(scale(a, 1 - t), scale(b, t));

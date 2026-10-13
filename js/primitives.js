// js/primitives.js — procedural indexed meshes.  All triangles are counter-clockwise
// when seen from outside (so back-face culling with gl.frontFace(CCW) works).
import { makeIndices } from './mesh.js';

function pack(pos, nor, idx, uv) {
  return {
    positions: Float32Array.from(pos),
    normals: Float32Array.from(nor),
    uvs: Float32Array.from(uv),
    indices: makeIndices(idx, pos.length / 3),
  };
}

// Cube with 24 vertices (4 per face, so each face has its own flat normal) and 36 indices.
export function cube(h = 1) {
  const faces = [ // [normal, u axis, v axis]  with u × v = normal
    [[0, 0, 1], [1, 0, 0], [0, 1, 0]],
    [[0, 0, -1], [-1, 0, 0], [0, 1, 0]],
    [[1, 0, 0], [0, 0, -1], [0, 1, 0]],
    [[-1, 0, 0], [0, 0, 1], [0, 1, 0]],
    [[0, 1, 0], [1, 0, 0], [0, 0, -1]],
    [[0, -1, 0], [1, 0, 0], [0, 0, 1]],
  ];
  const pos = [], nor = [], idx = [], uv = [];
  for (const [n, u, v] of faces) {
    const base = pos.length / 3;
    for (const [su, sv] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      for (let k = 0; k < 3; k++) pos.push(h * (n[k] + su * u[k] + sv * v[k]));
      nor.push(...n);
      uv.push((su + 1) / 2, (sv + 1) / 2);   // each face maps the full 0..1 square
    }
    idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  return pack(pos, nor, idx, uv);
}

export function sphere(r = 1, stacks = 24, slices = 36) {
  const pos = [], nor = [], idx = [], uv = [];
  for (let i = 0; i <= stacks; i++) {
    const phi = (i / stacks) * Math.PI;
    for (let j = 0; j <= slices; j++) {
      const th = (j / slices) * 2 * Math.PI;
      const n = [Math.sin(phi) * Math.cos(th), Math.cos(phi), Math.sin(phi) * Math.sin(th)];
      pos.push(n[0] * r, n[1] * r, n[2] * r);
      nor.push(...n);
      uv.push(j / slices, 1 - i / stacks);   // u = longitude, v = latitude (north pole at v=1)
    }
  }
  for (let i = 0; i < stacks; i++) for (let j = 0; j < slices; j++) {
    const a = i * (slices + 1) + j, b = a + slices + 1;
    idx.push(a, a + 1, b, b, a + 1, b + 1);
  }
  return pack(pos, nor, idx, uv);
}

export function torus(R = 1, r = 0.35, rings = 40, sides = 20) {
  const pos = [], nor = [], idx = [], uv = [];
  for (let i = 0; i <= rings; i++) {
    const u = (i / rings) * 2 * Math.PI;
    for (let j = 0; j <= sides; j++) {
      const v = (j / sides) * 2 * Math.PI;
      const n = [Math.cos(v) * Math.cos(u), Math.sin(v), Math.cos(v) * Math.sin(u)];
      pos.push((R + r * Math.cos(v)) * Math.cos(u), r * Math.sin(v), (R + r * Math.cos(v)) * Math.sin(u));
      nor.push(...n);
      uv.push(i / rings * 2, j / sides);   // u repeats twice around the ring
    }
  }
  for (let i = 0; i < rings; i++) for (let j = 0; j < sides; j++) {
    const a = i * (sides + 1) + j, b = a + sides + 1;
    idx.push(a, a + 1, b, b, a + 1, b + 1);
  }
  return pack(pos, nor, idx, uv);
}

// A flat floor (4 vertices, 6 indices) facing +Y.
export function plane(half = 10) {
  return pack(
    [-half, 0, half, half, 0, half, half, 0, -half, -half, 0, -half],
    [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
    [0, 1, 2, 0, 2, 3],
    [0, 0, 1, 0, 1, 1, 0, 1].map((x) => x * half / 2),   // UVs: texture repeats half/2 times across the floor
  );
}

// js/obj-loader.js — Wavefront .obj parser -> indexed mesh data.
//
// Handles: v, vt, vn, f (triangles, quads and n-gons via fan triangulation),
//          face formats  v | v/vt | v//vn | v/vt/vn,  negative (relative) indices.
// OBJ stores separate index lists for position / normal / uv, but the GPU wants ONE index
// per vertex.  So every distinct (v, vt, vn) triple in the file becomes one GPU vertex; a Map
// de-duplicates, which is what makes the result an indexed mesh instead of a triangle soup.
import { makeIndices } from './mesh.js';

export function parseOBJ(text, { normalize = false } = {}) {
  const P = [], N = [], UV = [];          // raw lists from the file
  const pos = [], nor = [], uvs = [], idx = [];   // output (GPU) arrays
  const cache = new Map();                 // "vi/ti/ni" -> GPU vertex index
  const needNormals = [];                  // GPU vertices that had no vn in the file

  const resolve = (i, len) => (i < 0 ? len + i : i - 1);   // OBJ is 1-based, may be negative

  function vertex(token) {
    const [vs, ts, ns] = token.split('/');
    const vi = resolve(parseInt(vs, 10), P.length);
    const ti = ts ? resolve(parseInt(ts, 10), UV.length) : -1;
    const ni = ns ? resolve(parseInt(ns, 10), N.length) : -1;
    const key = vi + '/' + ti + '/' + ni;
    let id = cache.get(key);
    if (id === undefined) {
      id = pos.length / 3;
      cache.set(key, id);
      pos.push(...P[vi]);
      uvs.push(...(ti >= 0 ? UV[ti] : [0, 0]));   // OBJ v=0 is the bottom edge (same as GL texture space)
      if (ni >= 0) nor.push(...N[ni]); else { nor.push(0, 0, 0); needNormals.push(id); }
    }
    return id;
  }

  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line || line[0] === '#') continue;
    const t = line.split(/\s+/);
    if (t[0] === 'v') P.push([+t[1], +t[2], +t[3]]);
    else if (t[0] === 'vt') UV.push([+t[1], +t[2]]);
    else if (t[0] === 'vn') N.push([+t[1], +t[2], +t[3]]);
    else if (t[0] === 'f') {
      const ids = t.slice(1).map(vertex);
      for (let k = 1; k + 1 < ids.length; k++) idx.push(ids[0], ids[k], ids[k + 1]); // fan
    }
  }
  if (!idx.length) throw new Error('OBJ contains no faces');

  // No vn in file -> area-weighted smooth normals from the faces.
  if (needNormals.length) {
    for (let i = 0; i < idx.length; i += 3) {
      const [a, b, c] = [idx[i], idx[i + 1], idx[i + 2]].map((v) => pos.slice(v * 3, v * 3 + 3));
      const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
      const fn = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
      for (let k = 0; k < 3; k++) for (let j = 0; j < 3; j++) nor[idx[i + k] * 3 + j] += fn[j];
    }
    for (const v of needNormals) {
      const l = Math.hypot(nor[v * 3], nor[v * 3 + 1], nor[v * 3 + 2]) || 1;
      for (let j = 0; j < 3; j++) nor[v * 3 + j] /= l;
    }
  }

  // Centre on the bounding-box midpoint and scale to fit a unit sphere, so any model
  // shows up at a sensible size no matter what units it was authored in.
  if (normalize) {
    const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < pos.length; i += 3) for (let j = 0; j < 3; j++) {
      lo[j] = Math.min(lo[j], pos[i + j]); hi[j] = Math.max(hi[j], pos[i + j]);
    }
    const c = lo.map((l, j) => (l + hi[j]) / 2);
    let r = 0;
    for (let i = 0; i < pos.length; i += 3)
      r = Math.max(r, Math.hypot(pos[i] - c[0], pos[i + 1] - c[1], pos[i + 2] - c[2]));
    for (let i = 0; i < pos.length; i += 3) for (let j = 0; j < 3; j++) pos[i + j] = (pos[i + j] - c[j]) / (r || 1);
  }

  return {
    positions: Float32Array.from(pos),
    normals: Float32Array.from(nor),
    uvs: Float32Array.from(uvs),
    indices: makeIndices(idx, pos.length / 3),
  };
}

export async function loadOBJ(url, opts) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load ${url} (${res.status})`);
  return parseOBJ(await res.text(), opts);
}

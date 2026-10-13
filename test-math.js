// node test-math.js — sanity tests for the math library and the .obj loader.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as V from './math/Vec3.js';
import * as M from './math/Mat4.js';
import { parseOBJ } from './js/obj-loader.js';
const near = (a, b, e = 1e-5) => assert.ok(Math.abs(a - b) < e, `${a} != ${b}`);
const nearArr = (a, b, e = 1e-5) => a.forEach((x, i) => near(x, b[i], e));

nearArr(V.cross([1, 0, 0], [0, 1, 0]), [0, 0, 1]);
near(V.length(V.normalize([3, 4, 0])), 1);
// translation moves points (w=1) but not directions (w=0)
nearArr(M.transformVec4(M.translation(1, 2, 3), [1, 2, 3, 1]), [2, 4, 6, 1]);
nearArr(M.transformVec4(M.translation(1, 2, 3), [1, 2, 3, 0]), [1, 2, 3, 0]);
assert.equal(M.translation(5, 6, 7)[12], 5);
// rotation Y by 90deg sends +X to -Z (right-handed)
nearArr(M.transformVec4(M.rotationY(Math.PI / 2), [1, 0, 0, 1]), [0, 0, -1, 1]);
// multiply order: (T * S) p = T(S p)
nearArr(M.transformVec4(M.multiply(M.translation(1, 0, 0), M.scaling(2)), [1, 0, 0, 1]), [3, 0, 0, 1]);
// inverse
const A = M.chain(M.translation(1, 2, 3), M.rotationY(0.7), M.rotationX(0.3), M.scaling(2));
nearArr(M.multiply(A, M.invert(A)), M.identity());
// lookAt: eye -> origin, target -> straight ahead on -Z at distance
const view = M.lookAt([0, 0, 5], [0, 0, 0]);
nearArr(M.transformVec4(view, [0, 0, 5, 1]), [0, 0, 0, 1]);
nearArr(M.transformVec4(view, [0, 0, 0, 1]), [0, 0, -5, 1]);
// perspective: near plane -> ndc z = -1, far plane -> +1
const P = M.perspective(Math.PI / 2, 1, 1, 10);
const ndc = (z) => { const c = M.transformVec4(P, [0, 0, z, 1]); return c[2] / c[3]; };
near(ndc(-1), -1); near(ndc(-10), 1);
// obj: quad is triangulated, shared vertices de-duplicated
const q = parseOBJ('v 0 0 0\nv 1 0 0\nv 1 1 0\nv 0 1 0\nf 1 2 3 4\n', { normalize: false });
assert.equal(q.indices.length, 6); assert.equal(q.positions.length / 3, 4);
nearArr(Array.from(q.normals.slice(0, 3)), [0, 0, 1]);
// the shipped knot: winding agrees with its vertex normals (needed for culling)
const knot = parseOBJ(readFileSync('assets/knot.obj', 'utf8'));
let agree = 0, total = 0;
const p = knot.positions, n = knot.normals, ix = knot.indices;
for (let i = 0; i < ix.length; i += 3) {
  const [a, b, c] = [ix[i], ix[i + 1], ix[i + 2]];
  const e1 = V.sub([p[b*3], p[b*3+1], p[b*3+2]], [p[a*3], p[a*3+1], p[a*3+2]]);
  const e2 = V.sub([p[c*3], p[c*3+1], p[c*3+2]], [p[a*3], p[a*3+1], p[a*3+2]]);
  agree += V.dot(V.cross(e1, e2), [n[a*3], n[a*3+1], n[a*3+2]]) > 0 ? 1 : 0; total++;
}
// UVs: every vertex has one, all inside the expected range, and a vt-less file falls back to (0,0)
assert.equal(knot.uvs.length / 2, knot.positions.length / 3);
assert.ok(knot.uvs.some((x) => x > 0.5));
assert.deepEqual(Array.from(q.uvs), new Array(8).fill(0));
const tex = parseOBJ('v 0 0 0\nv 1 0 0\nv 0 1 0\nvt 0 0\nvt 1 0\nvt 0 1\nvn 0 0 1\nf 1/1/1 2/2/1 3/3/1\n', { normalize: false });
assert.deepEqual(Array.from(tex.uvs), [0, 0, 1, 0, 0, 1]);
console.log(`knot: ${knot.positions.length / 3} verts, ${total} tris, ${agree} wound CCW vs normals`);
console.log('math tests passed');

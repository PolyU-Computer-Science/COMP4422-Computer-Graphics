// node test-prims.mjs — every primitive has uvs matching its vertex count and winds
// counter-clockwise seen from outside (face normal agrees with its vertex normals).
import * as V from './math/Vec3.js';
import * as P from './js/primitives.js';
for (const [n, d] of Object.entries({ cube: P.cube(), sphere: P.sphere(), torus: P.torus(), plane: P.plane() })) {
  if (d.uvs.length / 2 !== d.positions.length / 3) throw new Error(n + ': uv count mismatch');
  const at = (arr, i) => [arr[i * 3], arr[i * 3 + 1], arr[i * 3 + 2]];
  for (let i = 0; i < d.indices.length; i += 3) {
    const [a, b, c] = [d.indices[i], d.indices[i + 1], d.indices[i + 2]];
    const fn = V.cross(V.sub(at(d.positions, b), at(d.positions, a)), V.sub(at(d.positions, c), at(d.positions, a)));
    if (V.length(fn) < 1e-9) continue;   // zero-area triangles at the sphere's poles
    const vn = V.add(V.add(at(d.normals, a), at(d.normals, b)), at(d.normals, c));
    if (V.dot(fn, vn) <= 0) throw new Error(`${n}: triangle ${i / 3} winds clockwise`);
  }
}
console.log('primitives ok');

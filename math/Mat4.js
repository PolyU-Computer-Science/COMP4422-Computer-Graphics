// math/Mat4.js — 4x4 matrices as COLUMN-MAJOR Float32Array(16), same as WebGL / Lecture 3.
//
// Index layout (element at row r, column c lives at index c*4 + r):
//     | m0  m4  m8   m12 |      translation = m12, m13, m14 (last column)
//     | m1  m5  m9   m13 |
//     | m2  m6  m10  m14 |
//     | m3  m7  m11  m15 |
// Because of this, we can upload a matrix with gl.uniformMatrix4fv(loc, false, m)
// WITHOUT transposing.  Matrices act on column vectors:  p' = M * p.
import * as Vec3 from './Vec3.js';

export const identity = () =>
  new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

// out = a * b  (apply b first, then a).  out[c][r] = sum_k a[k][r] * b[c][k]
export function multiply(a, b) {
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) sum += a[k * 4 + r] * b[c * 4 + k];
      out[c * 4 + r] = sum;
    }
  }
  return out;
}

// Convenience: multiply any number of matrices left-to-right, e.g. chain(P, V, M).
export const chain = (...ms) => ms.reduce((acc, m) => multiply(acc, m));

export function translation(x, y, z) {
  const m = identity();
  m[12] = x; m[13] = y; m[14] = z;
  return m;
}

export function scaling(x, y = x, z = x) {
  const m = identity();
  m[0] = x; m[5] = y; m[10] = z;
  return m;
}

export function rotationX(rad) {
  const c = Math.cos(rad), s = Math.sin(rad), m = identity();
  m[5] = c; m[9] = -s;
  m[6] = s; m[10] = c;
  return m;
}

export function rotationY(rad) {
  const c = Math.cos(rad), s = Math.sin(rad), m = identity();
  m[0] = c; m[8] = s;
  m[2] = -s; m[10] = c;
  return m;
}

export function rotationZ(rad) {
  const c = Math.cos(rad), s = Math.sin(rad), m = identity();
  m[0] = c; m[4] = -s;
  m[1] = s; m[5] = c;
  return m;
}

// View matrix.  Camera sits at `eye`, looks at `target`, camera looks down its own -Z.
// Rows of the rotation part are the camera's basis vectors (x right, y up, z backwards);
// the translation part is  -R * eye  so that the eye ends up at the origin.
export function lookAt(eye, target, up = [0, 1, 0]) {
  const z = Vec3.normalize(Vec3.sub(eye, target)); // backwards (camera looks along -z)
  const x = Vec3.normalize(Vec3.cross(up, z));     // right
  const y = Vec3.cross(z, x);                      // true up
  return new Float32Array([
    x[0], y[0], z[0], 0,
    x[1], y[1], z[1], 0,
    x[2], y[2], z[2], 0,
    -Vec3.dot(x, eye), -Vec3.dot(y, eye), -Vec3.dot(z, eye), 1,
  ]);
}

// OpenGL-style perspective: maps the view frustum to the clip cube, z_ndc in [-1, 1].
//   x_clip = f/aspect * x,  y_clip = f * y,  w_clip = -z   (the "-1" at index 11)
export function perspective(fovyRad, aspect, near, far) {
  const f = 1 / Math.tan(fovyRad / 2), nf = 1 / (near - far);
  const m = new Float32Array(16);
  m[0] = f / aspect;
  m[5] = f;
  m[10] = (far + near) * nf;
  m[11] = -1;
  m[14] = 2 * far * near * nf;
  return m;
}

export function transpose(a) {
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) out[r * 4 + c] = a[c * 4 + r];
  return out;
}

// General 4x4 inverse by Gauss-Jordan elimination with partial pivoting.
// Returns null if singular.  (Needed for the normal matrix = inverse-transpose in M3.)
export function invert(a) {
  const m = Array.from({ length: 4 }, (_, r) => [
    a[r], a[4 + r], a[8 + r], a[12 + r],           // row r of a
    r === 0 ? 1 : 0, r === 1 ? 1 : 0, r === 2 ? 1 : 0, r === 3 ? 1 : 0,
  ]);
  for (let col = 0; col < 4; col++) {
    let piv = col;
    for (let r = col + 1; r < 4; r++) if (Math.abs(m[r][col]) > Math.abs(m[piv][col])) piv = r;
    if (Math.abs(m[piv][col]) < 1e-12) return null;
    [m[col], m[piv]] = [m[piv], m[col]];
    const d = m[col][col];
    for (let k = 0; k < 8; k++) m[col][k] /= d;
    for (let r = 0; r < 4; r++) {
      if (r === col) continue;
      const f = m[r][col];
      for (let k = 0; k < 8; k++) m[r][k] -= f * m[col][k];
    }
  }
  const out = new Float32Array(16);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) out[c * 4 + r] = m[r][4 + c];
  return out;
}

// Normal matrix for a model matrix: upper-left 3x3 of the inverse-transpose, as a column-major
// Float32Array(9) for gl.uniformMatrix3fv.  Keeps normals perpendicular to the surface even
// under non-uniform scaling.  Falls back to the plain 3x3 if the model matrix is singular.
export function normalMatrix(model) {
  const inv = invert(model);
  const n = inv ? transpose(inv) : model;
  return new Float32Array([n[0], n[1], n[2], n[4], n[5], n[6], n[8], n[9], n[10]]);
}

// Transform a point (w=1) or direction (w=0) by M.  Returns [x, y, z, w].
export function transformVec4(m, v) {
  const out = [0, 0, 0, 0];
  for (let r = 0; r < 4; r++)
    out[r] = m[r] * v[0] + m[4 + r] * v[1] + m[8 + r] * v[2] + m[12 + r] * v[3];
  return out;
}

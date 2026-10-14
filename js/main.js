// js/main.js — COMP4422 M1: geometry + camera.
//   * own Vec3 / Mat4 library (math/)           * indexed meshes + a loaded .obj (js/mesh.js, js/obj-loader.js)
//   * gl.drawElements                           * model-view-projection with a perspective camera
//   * depth test ON                             * controllable orbit camera (js/camera.js)
import * as Mat4 from '../math/Mat4.js';
import { linkProgram } from './gl-utils.js';
import { Mesh } from './mesh.js';
import { cube, sphere, torus, plane } from './primitives.js';
import { loadOBJ, parseOBJ } from './obj-loader.js';
import { OrbitCamera } from './camera.js';

const canvas = document.getElementById('c');
const hud = document.getElementById('hud');
const gl = canvas.getContext('webgl2', { antialias: true });
if (!gl) { showError('WebGL2 is not available in this browser.'); throw new Error('no webgl2'); }
function showError(msg) { const e = document.getElementById('err'); e.style.display = 'grid'; e.textContent = msg; }

// ---------- shaders (deliberately minimal: M2 owns the real shaders) ----------
const VS = `#version 300 es
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aTexCoord;   // UVs: unused by lighting, used by M2's texture mapping
uniform mat4 uMVP;           // P * V * M, built on the CPU with our own Mat4
uniform mat4 uModel;         // object -> world
uniform mat3 uNormalMatrix;  // inverse-transpose of uModel (correct under non-uniform scale)
out vec3 vNormal;            // world-space normal
out vec3 vWorldPos;          // world-space position (for M3's lighting)
out vec2 vUV;
void main() {
  vUV = aTexCoord;
  vNormal = uNormalMatrix * aNormal;
  vWorldPos = (uModel * vec4(aPos, 1.0)).xyz;
  gl_Position = uMVP * vec4(aPos, 1.0);
}`;
const FS = `#version 300 es
precision highp float;
in vec3 vNormal;
in vec2 vUV;
uniform vec3 uTint;
uniform bool uShowUV;   // debug view: checkerboard from UVs, to verify every mesh has sane UVs
out vec4 outColor;
void main() {
  vec3 n = normalize(vNormal);
  vec3 col = mix(uTint, n * 0.5 + 0.5, 0.55);   // "normal colours" so shape is visible without lighting
  if (uShowUV) {
    vec2 c = floor(vUV * 8.0);
    col = mix(vec3(0.15), vec3(0.95), mod(c.x + c.y, 2.0));
  }
  outColor = vec4(col, 1.0);
}`;
let program;
try { program = linkProgram(gl, VS, FS); } catch (e) { showError(e.message); throw e; }
const loc = {
  mvp: gl.getUniformLocation(program, 'uMVP'),
  model: gl.getUniformLocation(program, 'uModel'),
  normalMatrix: gl.getUniformLocation(program, 'uNormalMatrix'),
  // Not used by the placeholder shader (location is null, so the uniform calls are no-ops);
  // set every frame so M2/M3 shaders only have to declare them.
  view: gl.getUniformLocation(program, 'uView'),
  proj: gl.getUniformLocation(program, 'uProj'),
  eyePos: gl.getUniformLocation(program, 'uEyePos'),
  tint: gl.getUniformLocation(program, 'uTint'),
  showUV: gl.getUniformLocation(program, 'uShowUV'),
};

// ---------- meshes & scene ----------
const meshes = {
  floor: new Mesh(gl, plane(12), 'floor'),
  cube: new Mesh(gl, cube(1), 'cube'),
  sphere: new Mesh(gl, sphere(1), 'sphere'),
  torus: new Mesh(gl, torus(1, 0.3), 'torus'),
};
let objMesh = null;     // the loaded .obj
let objName = 'loading…';

async function setOBJ(dataPromise, name) {
  try {
    const data = await dataPromise;
    objMesh = new Mesh(gl, data, name);
    objName = `${name} (${objMesh.vertexCount} verts, ${objMesh.indexCount / 3} tris)`;
  } catch (e) { objName = 'OBJ error: ' + e.message; console.error(e); }
}
setOBJ(loadOBJ('assets/knot.obj'), 'knot.obj');

// load another .obj via the file picker or drag-and-drop
const loadFile = (f) => f && f.text().then((t) => setOBJ(Promise.resolve().then(() => parseOBJ(t)), f.name));
document.getElementById('file').addEventListener('change', (e) => loadFile(e.target.files[0]));
addEventListener('dragover', (e) => e.preventDefault());
addEventListener('drop', (e) => { e.preventDefault(); loadFile(e.dataTransfer.files[0]); });

// Each object = mesh + a function building its model matrix at time t (seconds).
const T = Mat4.translation, S = Mat4.scaling, RX = Mat4.rotationX, RY = Mat4.rotationY, mul = Mat4.chain;
const FLOOR_Y = -2;   // below the lowest point any object reaches (rotating cube corner ≈ -1.73)

// Placeholder "swimmer" for the follow camera: circles the scene at radius 6, bobbing up and down.
// Forward is its local +Z; heading h means forward = (sin h, 0, cos h).  M3 replaces it with the player.
function swimmer(t) {
  const w = 0.35 * t;
  return { pos: [6 * Math.sin(w), 0.8 + 0.3 * Math.sin(2 * w), 6 * Math.cos(w)], heading: w + Math.PI / 2 };
}

const scene = [
  { mesh: () => meshes.floor, tint: [0.25, 0.4, 0.55], model: () => T(0, FLOOR_Y, 0) },
  { mesh: () => meshes.cube,  tint: [0.9, 0.5, 0.3],  model: (t) => mul(T(-3, 0, 0), RY(t * 0.6), RX(t * 0.3)) },
  { mesh: () => meshes.sphere, tint: [0.4, 0.8, 0.6], model: (t) => mul(T(3, 0, 0), S(1.1)) },
  // torus and sphere interpenetrate: only a correct depth test draws this properly
  { mesh: () => meshes.torus, tint: [0.9, 0.8, 0.3],  model: (t) => mul(T(3, 0, 0), RX(Math.PI / 2 + 0.5 * Math.sin(t)), S(1.3)) },
  { mesh: () => objMesh,      tint: [0.7, 0.5, 0.9],  model: (t) => mul(T(0, 0.3, 0), RY(t * 0.4), S(1.7)) },
  // stretched sphere = the swimmer, long axis along its forward (+Z)
  { mesh: () => meshes.sphere, tint: [0.95, 0.6, 0.2], model: (t) => { const s = swimmer(t); return mul(T(...s.pos), RY(s.heading), S(0.35, 0.3, 0.8)); } },
];

// ---------- camera & input ----------
const camera = new OrbitCamera();
const keys = new Set();
const state = { depth: true, cull: false, uv: false };

let drag = null;
canvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  camera.orbit(-(e.clientX - drag.x) * 0.008, (e.clientY - drag.y) * 0.008);
  drag = { x: e.clientX, y: e.clientY };
});
canvas.addEventListener('wheel', (e) => { e.preventDefault(); camera.zoom(Math.exp(e.deltaY * 0.001)); }, { passive: false });
addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  keys.add(k);
  if (k === 'z') state.depth = !state.depth;          // z-buffer on/off (same idea as Lab 4's 'd')
  else if (k === 'c') state.cull = !state.cull;
  else if (k === 'u') state.uv = !state.uv;               // UV checker debug view
  else if (k === 'r') camera.reset();
  else if (k === 'f') {                                    // third-person follow on/off
    camera.mode = camera.mode === 'follow' ? 'orbit' : 'follow';
    if (camera.mode === 'follow') { camera.yawOffset = 0; camera.distance = 5; camera.pitch = 0.3; }
  }
  else if (k === '[') camera.fovy = Math.max(0.3, camera.fovy - 0.05);
  else if (k === ']') camera.fovy = Math.min(2.2, camera.fovy + 0.05);
});
addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
addEventListener('blur', () => keys.clear());

function updateCamera(dt, t) {
  const v = 4 * dt, k = (n) => (keys.has(n) ? 1 : 0);
  if (camera.mode === 'follow') { const s = swimmer(t); camera.follow(s.pos, s.heading, dt); }
  else camera.pan((k('d') - k('a')) * v, (k('w') - k('s')) * v, (k('e') - k('q')) * v);
  camera.orbit((k('arrowleft') - k('arrowright')) * 1.5 * dt, (k('arrowup') - k('arrowdown')) * 1.5 * dt);
  camera.keepAbove(FLOOR_Y + 0.2);                         // never look at the floor from underneath
}

// ---------- render loop ----------
function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.floor(canvas.clientWidth * dpr), h = Math.floor(canvas.clientHeight * dpr);
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
}

let last = performance.now();
const fmt = (a) => a.map((x) => x.toFixed(2)).join(', ');
function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.1), t = now / 1000;
  last = now;
  updateCamera(dt, t);
  resize();
  gl.viewport(0, 0, canvas.width, canvas.height);

  gl.clearColor(0.043, 0.063, 0.125, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);   // depth buffer must be cleared every frame
  state.depth ? gl.enable(gl.DEPTH_TEST) : gl.disable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LESS);
  state.cull ? gl.enable(gl.CULL_FACE) : gl.disable(gl.CULL_FACE);
  gl.frontFace(gl.CCW);

  const P = camera.projectionMatrix(canvas.width / canvas.height);
  const V = camera.viewMatrix();
  const PV = Mat4.multiply(P, V);

  gl.useProgram(program);
  gl.uniform1i(loc.showUV, state.uv ? 1 : 0);
  gl.uniformMatrix4fv(loc.view, false, V);
  gl.uniformMatrix4fv(loc.proj, false, P);
  gl.uniform3fv(loc.eyePos, camera.eye);                   // world-space camera position
  for (const obj of scene) {
    const mesh = obj.mesh();
    if (!mesh) continue;                                   // .obj still loading
    const M = obj.model(t);
    gl.uniformMatrix4fv(loc.mvp, false, Mat4.multiply(PV, M));   // MVP = P * V * M
    gl.uniformMatrix4fv(loc.model, false, M);
    gl.uniformMatrix3fv(loc.normalMatrix, false, Mat4.normalMatrix(M));
    gl.uniform3fv(loc.tint, obj.tint);
    mesh.draw(gl);                                         // gl.drawElements inside
  }

  hud.textContent =
    `COMP4422 M1 · geometry & camera\n` +
    `camera  ${camera.mode}\n` +
    `eye     ${fmt(camera.eye)}\ntarget  ${fmt(camera.target)}\n` +
    `fov ${(camera.fovy * 180 / Math.PI).toFixed(0)}°  near ${camera.near}  far ${camera.far}\n` +
    `depth test: ${state.depth ? 'ON' : 'OFF'}   culling: ${state.cull ? 'ON' : 'OFF'}   uv view: ${state.uv ? 'ON' : 'OFF'}\n` +
    `loaded obj: ${objName}`;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// handy for the console / tests
window.__m1 = { gl, camera, state, scene, meshes, get objMesh() { return objMesh; } };

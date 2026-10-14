// node test-camera.mjs — follow mode settles behind its subject; keepAbove keeps the eye above a height.
import assert from 'node:assert/strict';
import * as V from './math/Vec3.js';
import { OrbitCamera } from './js/camera.js';

const cam = new OrbitCamera();
cam.mode = 'follow';
const pos = [2, 1, -3], h = 0.8, forward = [Math.sin(h), 0, Math.cos(h)];
for (let i = 0; i < 600; i++) cam.follow(pos, h, 1 / 60);   // 10 s of frames
assert.ok(V.length(V.sub(cam.target, pos)) < 1e-3, 'target reaches the subject');
const back = V.sub(cam.eye, pos);
assert.ok(V.dot(V.normalize([back[0], 0, back[2]]), forward) < -0.999, 'eye sits behind the subject');

// heading wraps past ±PI without spinning the long way round
const wrap = new OrbitCamera();
wrap.mode = 'follow'; wrap.yaw = Math.PI - 0.1;
wrap.follow([0, 0, 0], 0.1, 1 / 60);   // want = 0.1 + PI, i.e. 0.2 ahead
assert.ok(wrap.yaw > Math.PI - 0.1 && wrap.yaw < Math.PI + 0.1, 'turns the short way');

const low = new OrbitCamera();
low.pitch = -1.4;                       // looking up from far below the target
low.keepAbove(-1.8);
assert.ok(low.eye[1] >= -1.8 - 1e-9, 'eye kept above the floor');
console.log('camera tests passed');

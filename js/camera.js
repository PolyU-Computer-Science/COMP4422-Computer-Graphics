// js/camera.js — orbit camera: eye = target + spherical(yaw, pitch, distance).
// Two modes: 'orbit' (user moves the target) and 'follow' (third-person: the target tracks
// a subject and the camera swings round behind it).
import * as Vec3 from '../math/Vec3.js';
import * as Mat4 from '../math/Mat4.js';

export class OrbitCamera {
  constructor() { this.mode = 'orbit'; this.reset(); }

  reset() {
    this.target = [0, 0.3, 0];
    this.yaw = 0.6;                 // rotation around the world Y axis
    this.pitch = 0.35;              // elevation above the horizon
    this.distance = 10;
    this.fovy = (50 * Math.PI) / 180;
    this.near = 0.1;
    this.far = 100;
    this.yawOffset = 0;             // follow mode: user's drag offset from "directly behind"
  }

  get eye() {
    const cp = Math.cos(this.pitch);
    return Vec3.add(this.target, [
      this.distance * cp * Math.sin(this.yaw),
      this.distance * Math.sin(this.pitch),
      this.distance * cp * Math.cos(this.yaw),
    ]);
  }

  orbit(dYaw, dPitch) {
    if (this.mode === 'follow') this.yawOffset += dYaw; else this.yaw += dYaw;
    const lim = Math.PI / 2 - 0.01;                      // stop short of the poles (lookAt would flip)
    this.pitch = Math.max(-lim, Math.min(lim, this.pitch + dPitch));
  }

  zoom(factor) { this.distance = Math.max(1.5, Math.min(40, this.distance * factor)); }

  // Move the target on the ground plane relative to where the camera is facing.
  pan(right, forward, up = 0) {
    const fwd = Vec3.normalize([-Math.sin(this.yaw), 0, -Math.cos(this.yaw)]);
    const rgt = Vec3.cross(fwd, [0, 1, 0]);
    this.target = Vec3.add(this.target, Vec3.add(Vec3.add(Vec3.scale(rgt, right), Vec3.scale(fwd, forward)), [0, up, 0]));
  }

  // Third-person follow.  `pos` is the subject's world position and `heading` the yaw of its
  // forward direction, i.e. forward = (sin h, 0, cos h).  The target eases onto the subject and
  // the camera eases round to sit behind it (plus the user's yawOffset).
  follow(pos, heading, dt) {
    const k = 1 - Math.exp(-6 * dt);                   // smoothing independent of frame rate
    this.target = Vec3.lerp(this.target, pos, k);
    const want = heading + Math.PI + this.yawOffset;   // eye offset = -forward  =>  yaw = h + PI
    this.yaw += Math.atan2(Math.sin(want - this.yaw), Math.cos(want - this.yaw)) * k; // shortest way round
  }

  // Keep the target and the eye at or above height y (e.g. just above the floor).
  keepAbove(y) {
    if (this.target[1] < y) this.target = [this.target[0], y, this.target[2]];
    this.pitch = Math.max(this.pitch, Math.asin((y - this.target[1]) / this.distance));
  }

  viewMatrix() { return Mat4.lookAt(this.eye, this.target, [0, 1, 0]); }
  projectionMatrix(aspect) { return Mat4.perspective(this.fovy, aspect, this.near, this.far); }
}

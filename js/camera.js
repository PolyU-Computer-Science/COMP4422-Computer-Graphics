// js/camera.js — orbit camera: eye = target + spherical(yaw, pitch, distance).
import * as Vec3 from '../math/Vec3.js';
import * as Mat4 from '../math/Mat4.js';

export class OrbitCamera {
  constructor() { this.reset(); }

  reset() {
    this.target = [0, 0.3, 0];
    this.yaw = 0.6;                 // rotation around the world Y axis
    this.pitch = 0.35;              // elevation above the horizon
    this.distance = 10;
    this.fovy = (50 * Math.PI) / 180;
    this.near = 0.1;
    this.far = 100;
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
    this.yaw += dYaw;
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

  viewMatrix() { return Mat4.lookAt(this.eye, this.target, [0, 1, 0]); }
  projectionMatrix(aspect) { return Mat4.perspective(this.fovy, aspect, this.near, this.far); }
}

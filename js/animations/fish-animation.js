// js/animation/fish-animation.js — Member B: tail/fin local animation values and matrices.
import * as Mat4 from '../../math/Mat4.js';

const T = Mat4.translation;
const RX = Mat4.rotationX;
const RY = Mat4.rotationY;
const RZ = Mat4.rotationZ;
const mul = Mat4.chain;

// Species motion profiles and part attachment points (in local Fish Root space).
// Forward is +Z, Up is +Y, Left (port) is +X, Right (starboard) is -X.
export const FISH_PROFILES = {
    tuna: {
        freq: 7.0,          // Base oscillation frequency (rad/s)
        tailAmp: 0.45,      // Tail yaw amplitude (radians)
        bodyAmp: 0.08,      // Subtle body counter-yaw (radians)
        finAmp: 0.35,       // Pectoral fin flap amplitude (radians)
        finSweep: 0.20,     // Resting backward sweep angle of side fins
        attachments: {
            body:     [0, 0, 0],
            tail:     [0, 0, -0.55],
            leftFin:  [0.32, -0.08, 0.10],
            rightFin: [-0.32, -0.08, 0.10],
        },
    },
    shark: {
        freq: 2.8,
        tailAmp: 0.65,
        bodyAmp: 0.14,
        finAmp: 0.12,
        finSweep: 0.15,
        attachments: {
            body:     [0, 0, 0],
            tail:     [0, 0, -1.20],
            leftFin:  [0.60, -0.20, 0.30],
            rightFin: [-0.60, -0.20, 0.30],
        },
    },
};

/**
 * Computes raw animation angles at time `t` (useful if Member C's scene graph stores Euler angles).
 */
export function getFishAnimationAngles(profile = 'tuna', t = 0, speedMultiplier = 1.0, phase = 0.0) {
    const p = (typeof profile === 'string' ? FISH_PROFILES[profile] : profile) || FISH_PROFILES.tuna;
    const w = t * p.freq * speedMultiplier + phase;

    return {
        bodyYaw:  p.bodyAmp * Math.sin(w),
        tailYaw:  p.tailAmp * Math.sin(w - 0.6), // Phase lag behind body sway
        leftRoll:  p.finAmp * Math.sin(w),
        rightRoll: -p.finAmp * Math.sin(w),      // Mirrored flap on opposite side
        finSweep: p.finSweep,
    };
}

/**
 * Computes local 4x4 transformation matrices for each child part relative to the Fish Root.
 * Multiply each returned matrix by the Fish Root's world matrix: M_world = multiply(M_root, M_part).
 *
 * @param {string|object} profile - Species key in FISH_PROFILES (e.g. 'tuna') or custom profile object
 * @param {number} t - Elapsed time in seconds (from requestAnimationFrame)
 * @param {number} speedMultiplier - Scales wag speed (e.g., 1.0 idle/cruise, 1.8 sprinting)
 * @param {number} phase - Per-fish phase offset (radians) so multiple fish don't swim in lockstep
 * @returns {{ body: Float32Array, tail: Float32Array, leftFin: Float32Array, rightFin: Float32Array }}
 */
export function getFishPartMatrices(profile = 'tuna', t = 0, speedMultiplier = 1.0, phase = 0.0) {
    const p = (typeof profile === 'string' ? FISH_PROFILES[profile] : profile) || FISH_PROFILES.tuna;
    const angles = getFishAnimationAngles(p, t, speedMultiplier, phase);
    const att = p.attachments;

    return {
        body: mul(
            T(...att.body),
            RY(angles.bodyYaw)
        ),
        tail: mul(
            T(...att.tail),
            RY(angles.tailYaw)
        ),
        leftFin: mul(
            T(...att.leftFin),
            RZ(angles.leftRoll),
            RY(angles.finSweep)
        ),
        rightFin: mul(
            T(...att.rightFin),
            RZ(angles.rightRoll),
            RY(-angles.finSweep)
        ),
    };
}
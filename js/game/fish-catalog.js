// js/game/fish-catalog.js — Member B: central index of fish models, textures, and animation profiles.
import * as Mat4 from '../../math/Mat4.js';
import { Mesh } from '../mesh.js';
import { loadOBJ } from '../obj-loader.js';
import { loadTexture } from '../rendering/textures.js';
import { FISH_PROFILES, getFishPartMatrices } from '../animations/fish-animation.js';

const T = Mat4.translation, RY = Mat4.rotationY, S = Mat4.scaling, mul = Mat4.chain;

export const FISH_SPECIES = {
    tuna: {
        name: 'Fat Tuna',
        textureUrl: 'assets/textures/fat_tuna.png',
        // Currently using your fat_fish.obj; when you split into parts, uncomment tail/leftFin/rightFin!
        partUrls: {
            body: 'assets/models/fat_fish.obj',
            // tail:     'assets/models/fish/tuna_tail.obj',
            // leftFin:  'assets/models/fish/tuna_fin_l.obj',
            // rightFin: 'assets/models/fish/tuna_fin_r.obj',
        },
        // Set normalizeParts: true if fat_fish.obj is still in raw Blockbench pixel units;
        // change to false once exported at final scale with separate hinged parts.
        normalizeParts: true,
        animProfile: FISH_PROFILES.tuna,
        defaultScale: 1.0,
    },
};

export async function loadFishCatalog(gl) {
    const catalog = {};

    for (const [key, spec] of Object.entries(FISH_SPECIES)) {
        const texture = loadTexture(gl, spec.textureUrl);
        const meshes = {};

        await Promise.all(
            Object.entries(spec.partUrls).map(async ([partName, url]) => {
                const data = await loadOBJ(url, { normalize: spec.normalizeParts ?? false });
                meshes[partName] = new Mesh(gl, data, `${key}_${partName}`);
            })
        );

        catalog[key] = { ...spec, texture, meshes };
    }

    return catalog;
}

// Helper to generate scene drawables for any fish in the catalog
export function createFishDrawables(catalog, speciesKey, getFishState) {
    const asset = catalog[speciesKey];
    if (!asset) return [];

    return Object.entries(asset.meshes).map(([partName, mesh]) => ({
        mesh: () => mesh,
        tint: [1, 1, 1],
        tex: asset.texture,
        model: (t) => {
            const s = getFishState(t); // { pos: [x,y,z], heading, scale, speed, phase }
            const rootM = mul(T(...s.pos), RY(s.heading), S(s.scale ?? asset.defaultScale));
            const parts = getFishPartMatrices(asset.animProfile, t, s.speed ?? 1.0, s.phase ?? 0.0);
            return Mat4.multiply(rootM, parts[partName] || Mat4.identity());
        },
    }));
}
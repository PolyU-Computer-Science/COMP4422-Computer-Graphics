# COMP4422 — Underwater Fish Exploration

### Eat & Grow · Low-poly 3D · Raw WebGL2

A group project for **COMP4422 Computer Graphics** at **The Hong Kong Polytechnic University**, Semester 1, 2026–27.

We will build a low-poly 3D underwater game in which the player controls a fish, explores the environment through a third-person follow camera, and eats other fish to grow. The project will combine custom geometry processing, transformations, shaders, texture mapping, animation, lighting, hierarchical modelling, and interactive gameplay using **JavaScript and raw WebGL2**.

## Game Plan

| Element | Planned design |
|---|---|
| Player character | A fish |
| Camera | Third-person follow camera |
| Main objective | Eat other fish to grow |
| Art style | Low-poly 3D |
| Environment | An underwater scene with fish, corals, rocks, and other agreed scenery |
| Controls | WASD + mouse; E or another action key if needed |
| Core loop | Swim → explore → find food → eat → grow |
| Additional graphics | A self-selected CG feature, such as a bubble particle system; final selection to be agreed |

### Gameplay Decisions

The core concept above is agreed. These implementation details will be settled together rather than assumed:

- [ ] Agree on which fish can be eaten, including any relative-size restriction.
- [ ] Decide whether eating happens on contact or requires an action key.
- [ ] Agree on how much the player grows after eating and any growth limit.
- [ ] Finalize movement, vertical swimming, mouse behaviour, and action-key bindings.
- [ ] Agree on the initial environment layout and the required fish/scenery assets.

## Team Responsibilities and Timeline

| Owner | Milestone / deliverable | Team target | Brief deadline |
|---|---|---|---|
| Member A | M1 — Geometry & Camera | **19 Oct 2026** | 19 Oct 2026 |
| Member B | M2 — 3D Models, Shaders & Animation | **26 Oct 2026** | 26 Oct 2026 |
| Member C | M3 — Lighting, Scene Graph & Gameplay | **6 Nov 2026** | 9 Nov 2026 |
| Member D | M4 — Additional CG Features | **9 Nov 2026** | 9 Nov 2026 |
| Whole team | Feature freeze and bug fixing | **19 Nov 2026** | Internal target |
| Whole team | Final report, slides, and demo ready | **21 Nov 2026** | Internal target |
| Team submitter | Final submission | **25 Nov 2026, 23:59** | 25 Nov 2026, 23:59 |

M3's 6 November date is our internal target. Plan implementation and recording ahead of milestone submission dates. Integrate work throughout development rather than waiting until the final preparation period.

## Milestone Task Checklists

Each owner should update their checkboxes after implementing and verifying the corresponding work.

### M1 — Geometry & Camera

**Owner: Member A · Target: 19 Oct**

- [ ] Implement the team's own `Vec3` and `Mat4` library for vector operations and transformations.
- [ ] Implement OBJ loading and load at least one `.obj` model.
- [ ] Build indexed meshes and render them with `gl.drawElements`.
- [ ] Apply model–view–projection transformations with a perspective camera.
- [ ] Enable depth testing and clear the depth buffer each frame.
- [ ] Implement a controllable third-person camera and its mouse controls.
- [ ] Coordinate the player-follow target and input handling with Member C.
- [ ] Verify the geometry/camera requirements and record a narrated milestone video of up to three minutes, showing the running result and key code.

**Handoff:** Provide the math, mesh, OBJ-loader, and camera interfaces for the other members. Agree with Member C on how the camera follows the player; player movement and eating logic belong to M3.

### M2 — 3D Models, Shaders & Animation

**Owner: Member B · Target: 26 Oct**

- [ ] Create low-poly fish models for the player and other fish.
- [ ] Prepare the agreed low-poly scenery, including corals and rocks.
- [ ] Prepare separate fish body, tail, and fin geometry with agreed origins, scale, and attachment points.
- [ ] Create UV coordinates and apply an image texture to at least one mesh.
- [ ] Implement GLSL ES 3.00 vertex and fragment shaders using the shared vertex and uniform conventions.
- [ ] Use `requestAnimationFrame` to drive the animation loop.
- [ ] Implement swimming animations and coordinate tail/fin transforms with Member C's scene graph.
- [ ] Share OBJ files, textures, and export conventions with the team early enough for integration.
- [ ] Verify shaders, texture mapping, and animation, then record a narrated milestone video of up to three minutes.

**Handoff:** Member B leads modelling, UVs, texturing, and animation. Other members can help prepare scenery to keep the workload manageable. Agree on shader inputs with Member A and on lighting/scene-graph integration with Member C.

### M3 — Lighting, Scene Graph & Gameplay

**Owner: Member C · Target: 6 Nov · Brief deadline: 9 Nov**

- [ ] Implement Blinn–Phong lighting in the fragment shader, including ambient, diffuse, and specular components.
- [ ] Build a scene graph with at least three instances and at least one parent–child chain.
- [ ] Organize the fish body, tail, and fins into a hierarchy that supports independent local animation and shared movement/scaling.
- [ ] Implement player movement using the agreed controls and connect it to Member A's follow camera.
- [ ] Implement collision detection for player–fish interactions.
- [ ] Implement eating according to the agreed gameplay rules.
- [ ] Implement fish growth, keeping visual scale and collision size consistent.
- [ ] Integrate the models, textures, swimming animations, and lighting into the playable scene.
- [ ] Verify the lighting, hierarchy, and user interaction, then record a narrated milestone video of up to three minutes for the 9 November submission.

**Planned hierarchy:**

```text
Fish Root — position, orientation, and growth scale
├── Body
├── Tail — local swimming animation
├── Left Fin — local swimming animation
└── Right Fin — local swimming animation
```

**Handoff:** Member C owns scene-graph composition, lighting, and the core eating/growth loop. Members A and B coordinate camera and animation integration; Member D can assist with agreed gameplay tasks without replacing their own M4 graphics contribution.

### M4 — Additional CG Features

**Owner: Member D · Target: 9 Nov**

- [ ] Select an additional computer graphics technique and confirm its suitability with the teaching team.
- [ ] Implement the selected technique personally, for example a bubble particle system or another agreed underwater visual effect.
- [ ] Integrate the effect with the scene, camera, and rendering loop.
- [ ] Verify the effect's visual result and explain its key graphics code.
- [ ] Prepare a narrated demonstration of up to three minutes and confirm the M4 video submission arrangement with the teaching team.

**Candidate: bubble particle system.** If selected, define particle positions, movement, lifetime, and appearance, then render the bubbles as an underwater effect. This is a candidate, not an additional requirement to implement every effect discussed.

## Integration and Final Preparation

### Throughout Development

- [ ] Agree on shared coordinate conventions, model scale, attachment points, and control bindings.
- [ ] Share a simple fish OBJ early so geometry/camera work does not depend on finished artwork.
- [ ] Integrate changes regularly and keep shader, mesh, and camera interfaces compatible.
- [ ] Reuse a shared animation loop for player updates, swimming animations, and visual effects.
- [ ] Collect screenshots, code references, asset sources, and individual contribution notes for the report.

### 19 Nov — Feature Freeze and Bug Fixing

- [ ] Integrate the planned M1–M4 features into one runnable game.
- [ ] Freeze new features and focus on defects, usability, and performance.
- [ ] Test camera following, movement, eating, growth, animation, lighting, and the selected extra effect together.
- [ ] Check that fish growth preserves body/tail/fin alignment and keeps the player visible to the camera.
- [ ] Run the repository tests and check the browser console for errors.
- [ ] Check asset loading and the launch instructions from a fresh checkout.

### 21 Nov — Report, Slides, and Demo Ready

- [ ] Complete the report: game overview, graphics techniques, implementation explanations, testing, and limitations.
- [ ] Include a division-of-labour table covering each member's milestone, techniques, features, and other tasks.
- [ ] Complete the final presentation slides in `.pptx` format.
- [ ] Prepare and rehearse the team demo; confirm the presentation date and duration with the teaching team.
- [ ] Complete the source-code package and verify the README's run instructions.
- [ ] Check all external-code, asset, reference, and AI-assistance declarations.

### 25 Nov, 23:59 — Final Submission

- [ ] Submit the report, slides, and complete runnable source code with the README to Canvas through the designated team member.
- [ ] Verify that the intended files were uploaded successfully.

## Planned Project Structure

Use a modular layout that follows the milestone responsibilities without creating four separate applications. Keep the shared M1 paths (`math/`, `js/camera.js`, `js/mesh.js`, `js/obj-loader.js`, `js/primitives.js`, and `js/gl-utils.js`) stable, and extend the project around them.

The tree below is a **target layout**, not a list of completed files. New filenames are proposed implementation locations; create them as needed. Keep the project lightweight, and combine small modules when splitting them would add unnecessary complexity. Particle-specific files apply only if the team selects that M4 technique.

```text
COMP4422-Computer-Graphics/
├── README.md
├── index.html                       # Browser entry point
├── package.json                     # ES module configuration
├── math/                            # Member A: shared mathematics
│   ├── Vec3.js
│   └── Mat4.js
├── js/
│   ├── main.js                      # Startup, wiring, and one animation loop
│   ├── camera.js                    # Member A: camera and player-follow behaviour
│   ├── input.js                     # A + C: shared keyboard/mouse input
│   ├── mesh.js                      # Member A: VAO/VBO/EBO and indexed drawing
│   ├── obj-loader.js                # Member A: OBJ parsing and loading
│   ├── primitives.js                # Member A: procedural meshes
│   ├── gl-utils.js                  # Shared shader compilation/linking utilities
│   ├── rendering/
│   │   ├── renderer.js              # Shared draw orchestration and uniforms
│   │   ├── textures.js              # Member B: image loading and texture upload
│   │   └── lighting.js              # Member C: light/material data and uniforms
│   ├── animation/
│   │   └── fish-animation.js        # Member B: tail/fin local animation values
│   ├── scene/
│   │   ├── scene-node.js            # Member C: hierarchy and local/world transforms
│   │   └── underwater-scene.js      # Member C: assemble fish and scenery
│   ├── game/
│   │   ├── fish.js                  # Member C: fish state and visual-node references
│   │   ├── player.js                # Member C: movement from shared input
│   │   ├── fish-population.js       # Member C: other fish creation and basic movement
│   │   ├── collision.js             # Member C: collision queries
│   │   └── eating-growth.js         # Member C: eating rules and growth updates
│   └── effects/
│       └── bubble-particles.js      # Member D: candidate M4 effect
├── shaders/                         # GLSL ES 3.00 sources
│   ├── scene.vert                   # Member B: vertex transforms and varyings
│   ├── scene.frag                   # B: texturing; C: Blinn–Phong lighting
│   ├── particles.vert               # Member D: candidate particle shader
│   └── particles.frag               # Member D: candidate particle shader
├── assets/
│   ├── knot.obj                     # Geometry demo asset; retain its loading path
│   ├── models/                     # Member B: exported runtime meshes
│   │   ├── fish/                    # Body, tail, and fins; agreed attachment data
│   │   └── environment/             # Corals, rocks, and other agreed scenery
│   ├── textures/                    # Images used by the game
│   │   ├── fish/
│   │   └── environment/
│   └── source/                      # Editable modelling files, separate from runtime assets
├── tools/
│   └── gen_knot.py                  # Geometry demo asset generator
├── test-math.js                     # Keep the documented root-level test command
├── test-prims.mjs                   # Keep the documented root-level test command
├── tests/                          # Proposed additional logic tests
│   ├── scene-graph.test.mjs         # Parent-child transforms and growth scaling
│   └── gameplay.test.mjs            # Collision, eating, and growth rules
└── docs/                            # Working documents and submission materials
    ├── design.md                    # Agreed controls, rules, and asset conventions
    ├── report/
    ├── slides/
    └── screenshots/
```

### Module Ownership and Boundaries

| Area | Lead | Planned responsibility |
|---|---|---|
| Math, mesh loading, and camera | Member A | Maintain shared math/mesh APIs and camera behaviour. The camera receives the player's position; it does not implement eating or growth. |
| Assets, texturing, and animation | Member B | Prepare meshes/UVs/textures, implement scene shaders and swimming animation values, and document fish-part attachment points. |
| Scene, lighting, and gameplay | Member C | Build the scene graph, apply animation values to its nodes, implement lighting and player/fish rules, and keep visual and collision sizes consistent. |
| Additional graphics effect | Member D | Implement the selected CG effect in `js/effects/` with any dedicated shaders, using the shared camera and frame timing. |
| Startup and rendering integration | Shared; agree changes with affected owners | Keep `js/main.js` focused on startup and frame scheduling. Put draw setup in `rendering/renderer.js`; use the shared mesh and shader utilities rather than rewriting them. |

**Shared editing points:** `js/main.js`, `js/input.js`, `js/rendering/renderer.js`, and `shaders/scene.frag` need coordinated changes. In particular, Member B's texture sampling and Member C's lighting should form one compatible scene shader rather than separate replacements that overwrite each other.

### Planned Frame Flow

`js/main.js` owns one `requestAnimationFrame` loop. Other modules expose update/draw operations and must not start their own competing loops.

```text
Read shared input and frame delta
  → Update player and other fish positions
  → Resolve collisions, eating, and growth
  → Calculate and apply local tail/fin animation
  → Update scene-graph world transforms
  → Update the follow camera from the player's world position
  → Update the selected graphics effect
  → Render the scene and then any transparent effects
```

Keep GPU mesh data separate from per-fish state so several fish can share geometry while retaining independent transforms and sizes. The scene graph owns world-transform composition; animations modify local transforms, and gameplay modifies the fish root's position, orientation, and growth scale. If the selected effect changes blending or depth-write settings, restore those settings before the next scene draw.

### Structure Setup Checklist

- [ ] Confirm the proposed module boundaries and shared input/camera contract.
- [ ] Keep the M1 import paths, demo asset path, and root-level test commands working during integration.
- [ ] Introduce the scene, game, animation, and rendering modules as their features are implemented; do not move everything at once.
- [ ] Move scene shader sources into `shaders/` when adding M2/M3 rendering, and load/compile them during startup before the first draw.
- [ ] Store runtime OBJ/texture files separately from editable modelling sources and record part origins/attachment data.
- [ ] Add the selected M4 effect under `js/effects/` and connect it to the shared loop and camera.
- [ ] Add scene-graph/gameplay tests and keep report, slides, and screenshots under `docs/`.

## Run Locally

Run from the repository root using a local HTTP server so ES modules and OBJ fetching work correctly.

```bash
# Windows / environments where Python is available as python
python -m http.server 8000

# macOS / Linux
python3 -m http.server 8000
```

Open `http://localhost:8000` in a browser with WebGL2 support. Run only one of the server commands above.

Alternatively, with Node.js and npm available:

```bash
npx serve
```

Open the URL printed by the command.

### Tests

Run with **Node.js 18+**:

```bash
node test-math.js
node test-prims.mjs
```

`test-math.js` covers Vec3, Mat4, and the OBJ parser. `test-prims.mjs` checks primitive UV counts and triangle winding.

### Development Controls

These are geometry/camera development shortcuts, separate from the planned fish-game bindings.

| Input | Action |
|---|---|
| Mouse drag | Orbit the camera |
| Mouse wheel | Zoom |
| WASD | Move the camera target horizontally |
| Q / E | Move the camera target down / up |
| Arrow keys | Orbit the camera |
| `[` / `]` | Adjust field of view |
| R | Reset the camera |
| Z | Toggle depth testing |
| C | Toggle back-face culling |
| U | Toggle the UV checker view |
| File picker / drag and drop | Load an OBJ file |

Coordinate these development shortcuts with the final gameplay controls before integration.

## Shared Technical Conventions

Use **JavaScript and raw WebGL2**. The team will implement its own matrix transformations; Three.js, Babylon.js, or similar graphics frameworks are not used for the graded work.

### Vertex Layout

Meshes use interleaved vertex data with a **32-byte stride**:

| Location | Attribute | Type | Byte offset |
|---|---|---|---|
| 0 | `aPos` | `vec3` | 0 |
| 1 | `aNormal` | `vec3` | 12 |
| 2 | `aTexCoord` | `vec2` | 24 |

Meshes without UV coordinates receive `(0, 0)`. Triangles wind counter-clockwise when viewed from outside.

### Matrices and Shaders

Matrices use column-major `Float32Array(16)` storage, with translation at indices 12–14. `Mat4.multiply(a, b)` means `a * b`, so `b` is applied first. Upload matrices without transposing:

```js
gl.uniformMatrix4fv(location, false, matrix);
```

Keep the shared uniform contract consistent across M2, M3, and M4:

| Uniform | Type | Meaning |
|---|---|---|
| `uMVP` | `mat4` | `P * V * M` |
| `uModel` | `mat4` | Object-to-world transformation |
| `uView` | `mat4` | Camera view transformation |
| `uProj` | `mat4` | Perspective projection |
| `uNormalMatrix` | `mat3` | Inverse-transpose normal matrix from `uModel`, using `Mat4.normalMatrix` |
| `uEyePos` | `vec3` | Camera position in world space |

Use `vNormal` and `vWorldPos` in world space, plus `vUV`, when passing data between vertex and fragment shaders. A shader only needs to declare the uniforms it uses.

### OBJ and Texture Handoff

`parseOBJ` and `loadOBJ` recenter each model and scale it to fit a unit sphere by default. Pass `{ normalize: false }` when preserving authored coordinates is necessary.

For separately exported fish parts, agree on units, origins, joint positions, and local transforms. Do not independently normalize parts when their authored relative dimensions or positions must be preserved.

UVs use `v = 0` at the bottom edge. Follow the image-upload convention used by the project:

```js
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
```

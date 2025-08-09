# Product Requirements Document (PRD)

**Product**: Walkable 3D Clinic — Klinik Kesihatan Titiwangsa (Approximate Layout)

**Owner**: andre (PM)\
**Engineering**: R3F/Three.js team\
**Design**: Product design + 3D\
**Doc status**: Draft v1.0 (2025‑08‑09)\
**Reviewers/Approvers**: TBD (Clinic Ops Lead, MoH Liaison, Eng Lead)

---

## 1) Amazon‑Style Working Backwards: Press Release (Internal)

**FOR IMMEDIATE RELEASE – Kuala Lumpur, 2025**\
Today we’re announcing **Walkable 3D Clinic**, a browser‑based first‑person experience that lets staff, planners, and visitors **walk through a realistic layout of Klinik Kesihatan Titiwangsa** before they arrive. With simple WASD controls, a mini‑map, and clear signage, users can explore registration, waiting areas, triage, consultation rooms, treatment areas, cafeteria, toilets, and more.

**Why it matters:** Frontline teams waste time orienting themselves in unfamiliar facilities. New hires need guided walkthroughs. Planners need quick iterations on space flow. **Walkable 3D Clinic reduces physical walkthroughs, shortens time‑to‑orientation, and improves training outcomes** while remaining lightweight and privacy‑safe (no real patient data).

**Available today (MVP):**

- Keyboard/Mouse navigation (WASD + Shift run, click‑to‑lock view, M for mini‑map)
- Accurate‑enough floor plan and labeled rooms for KK Titiwangsa
- Collision‑aware walls/furniture; static environment (no NPCs)
- Works in modern desktop browsers; no install required

**Next:** support Malay/English label toggle; guided tour mode; route preview (e.g., “Registration → Triage → Consult 2”); performance dashboard for planners (heatmaps) and VR preview.

---

## 2) FAQ (Internal)

**Q: Who is this for?**

- **Primary**: Clinic staff onboarding; facility managers; MoH planners.
- **Secondary**: Patients/visitors needing orientation; training providers.

**Q: What problem are we solving?**

- Reduce **time‑to‑orientation** for new staff.
- Provide **asynchronous, on‑demand walkthroughs** for training.
- Enable **layout discussions remotely** (ops + planners) without site visits.

**Q: Why now?**\
WebGL (R3F + Rapier) enables high‑fidelity environments that run in the browser. Health systems are pushing for scalable digital training.

**Q: What’s in MVP?**

- First‑person navigation with collisions.
- Approximate KK Titiwangsa interior: registration, waiting areas, triage, 4 consult rooms, treatment, pharmacy, lab, immunization, MCH, cafeteria, toilets, surau, corridors.
- Mini‑map overlay; basic signage; stable performance on mid‑range laptops.

**Q: What’s explicitly *****out of scope***** for MVP?**

- Photoreal assets; dynamic NPCs; quest logic; VR; mobile optimization; multi‑floor support; precise measurements for construction; PHI/analytics tied to real patients.

**Q: Success metrics?**\
See **Section 7** (North Star & KRs) and **Section 13** (Instrumentation).

**Q: Privacy & compliance?**\
No PHI. Environment is synthetic/approximate. Only anonymous usage telemetry (opt‑out for public demos). See **Section 12**.

---

## 3) Product Vision & Tenets

**Vision:** A lightweight, explorable clinic twin that improves training, planning, and wayfinding with minimal friction.

**Tenets (Decision guardrails):**

1. **Customer clarity > visual fidelity**: Prioritize layout accuracy, signage, and navigation confidence over photorealism.
2. **Web‑first**: Runs smoothly on default enterprise browsers without installs.
3. **Fail‑soft**: Broken data must never crash the scene; degrade gracefully (labels fallback, default dims).
4. **Localizable**: Malay by default; easy English toggle.
5. **Measurable**: Ship with instrumentation that proves value (orientation time, completion rate).

---

## 4) Personas & Top Jobs-To-Be-Done

- **New Nurse (Aisyah)**: “I need to quickly know where triage, consult rooms, and pharmacy are before my first shift.”
- **Ops Manager (Faiz)**: “I want to validate patient flow and discuss bottlenecks with the team remotely.”
- **Planner (Ravi)**: “I need to iterate layouts and test the experience without frequent site visits.”

---

## 5) User Stories (MVP)

1. As a **new staff**, I can **walk** through the clinic and identify each functional area via signage.
2. As a **trainer**, I can provide a **guided path** (MVP+: bookmarkable waypoints) staff can follow.
3. As an **ops manager**, I can toggle a **mini‑map** and see my location.
4. As a **viewer**, I can navigate with **WASD + mouse** without configuration.
5. As a **PM/Engineer**, data errors in the layout **do not crash**; they fallback visibly.

---

## 6) Scope (MVP → MVP+)

### MVP (P0, current build)

- Single‑floor KK Titiwangsa approximate layout
- Static furniture; labeled rooms
- Collisions + mini‑map
- HUD with basic instructions
- Defensive rendering: sanitized layout, label fallback, unit tests

### MVP+ (P1)

- Language toggle (BM/EN), configurable signage copy
- Route preview (A→B arrows), simple breadcrumb compass
- Settings: invert mouse, sensitivity, motion‑reduction (reduced head bob)
- Screenshot export for report decks
- Hosting + CDN pipeline (S3/CloudFront or equivalent)

### P2 (Exploration)

- VR preview (WebXR)
- Heatmap playback (from synthetic routes)
- Alternate clinics via JSON layout import
- Accessibility: alternative navigation (click‑to‑teleport), high‑contrast mode

---

## 7) North Star, Success Metrics & Targets

**North Star**: *Time‑to‑Orientation (TTO)* — minutes for a new staff member to correctly locate 8 core areas on first attempt.

**Key Results (first 90 days)**

- KR1: TTO reduced **≥40%** vs control (slides/photos).
- KR2: **≥80%** completion of a guided orientation path under 10 minutes.
- KR3: **p95 FPS ≥ 45** on 2019‑era laptop (Intel iGPU) at 1280×720; **p50 FPS ≥ 60**.
- KR4: **Crash rate = 0** from layout data issues (caught by sanitizers/tests).

**Health metrics**: median session length, pathway completions, mini‑map usage, first‑time tool‑tips dismissed, rage‑quit indicator (unlock within 10s).

---

## 8) Functional Requirements

**FR‑1 Navigation**: Pointer‑lock, WASD, Shift run, M toggles mini‑map.\
**FR‑2 World**: Registration, waiting A, triage, 4 consult rooms, treatment, pharmacy, lab, immunization, MCH, cafeteria, toilets, surau, corridors.\
**FR‑3 Labels**: Room labels visible at doorway height; localized copy (BM; EN optional P1).\
**FR‑4 Collisions**: Walls/furniture physically block the player; outer boundary prevents exits.\
**FR‑5 Mini‑Map**: Top‑down rectangles for rooms/corridors; player dot; toggle hotkey.\
**FR‑6 Resilience**: Layout sanitizer guarantees required keys; label fallback avoids `<Html>` crashes.\
**FR‑7 HUD**: Basic controls helper; unit test summary for internal builds.

**Nice‑to‑have (not required for launch)**: Route preview; waypoint list; screenshot export.

---

## 9) Non‑Functional Requirements (NFR)

- **Performance**:
  - p95 **frame time ≤ 22ms** (≈45 FPS) on baseline device; p50 **≤ 16ms**.
  - Initial load **≤ 4s** on 10 Mbps; JS payload (gz) **≤ 1.8 MB**; draw calls **≤ 300**; triangles **≤ 200k**.
- **Compatibility**: Chrome/Edge latest; Safari 16+; Windows/macOS. (Mobile out of scope MVP.)
- **Accessibility**: Keyboard‑only operation; high‑contrast HUD; motion‑reduction toggle (P1); remappable keys (P2).
- **Stability**: No unhandled exceptions; all layout parsing guarded; unit tests pass in CI.
- **Localization**: Malay default; English toggle (P1); no hard‑coded copy in geometry.
- **Security/Privacy**: No PHI; anonymous telemetry only; comply with local data guidelines.

---

## 10) Content & Data Model

**Coordinate system**: meters; `x,z` on floor plane, `y` up; room meshes centered on their `x,z`.\
**Rooms**: `{ key, name, x, z, w, h, doors[], furniture[] }`\
**Doors**: `{ side: "N|S|E|W", offset: number, width: number }`\
**Furniture**: `{ type: enum, x, z, w?, h?, y?, label? }` with allowed types: `bench,counter,kiosk,desk,chair,cabinet,shelf,screen,bed,table,partition,carpet,benchLab,sign`.

**JSON Schema (informal)**

```ts
interface Layout {  
  name?: string;  
  floorSize?: { w: number; h: number };  
  wallHeight?: number;  
  wallThickness?: number;  
  rooms: Room[];  
  corridors: { x: number; z: number; w: number; h: number }[];  
}
interface Room {  
  key?: string; name: string; x: number; z: number; w: number; h: number;  
  doors?: Door[]; furniture?: Furniture[];  
}
```

**Data contracts**

- Sanitizer must **never** yield NaN/undefined.
- Unknown furniture `type` becomes `__unknown__` and renders as a red cube.
- Html labels must pass a finite `[x,y,z]`; else fallback mesh.

---

## 11) UX & Controls

- **Pointer Lock** on click; escape to release.
- **WASD** move; **Shift** run; **M** mini‑map toggle.
- HUD shows controls + optional test status (internal builds).
- P1: Settings drawer (mouse sensitivity, invert look, motion reduction).
- P1: Language toggle (BM/EN).
- P2: Click‑to‑teleport accessibility mode.

---

## 12) Privacy, Security, Compliance

- No patient data; no personal data captured in the scene.
- Telemetry: anonymized, aggregated events; IP anonymization at edge (if hosted).
- Content: signage/text copy vetted by clinic ops.
- Legal: include disclaimer “Approximate layout for orientation/training; not for emergency navigation.”

---

## 13) Instrumentation & Analytics (MVP)

Events (batched):

- `app_load`, `scene_ready`, `pointer_lock_acquired/released`
- `move_tick` (sampled), `mini_map_toggle`, `room_entered` (`room.key`)
- `hud_dismissed`, `settings_opened` (P1), `route_started/completed` (P1)

KPIs derived: session length, % route completion, TTO measurement proxy (time to first presence in N core rooms), mini‑map utilization.

---

## 14) Acceptance Criteria & Test Plan

**A. Functional (Given/When/Then)**

1. **Navigation**: Given app loads, when user clicks canvas and presses WASD, then camera moves; Shift increases speed.
2. **Mini‑map**: Given canvas focus, when user presses `M`, then mini‑map visibility toggles.
3. **Collisions**: Given player runs into wall, then movement is blocked and no clipping occurs.
4. **Labels**: Given any room, when looking at its center, then a readable label is rendered; if bad coords, a fallback plaque appears instead.
5. **Resilience**: Given malformed layout (missing furniture coords), then scene still loads and unit tests flag the issue; no runtime crash.

**B. Unit Tests (must pass)**

- 17 tests currently included covering validation, sanitization, and vector safety.
- **Add P1 tests**: language toggle renders both locales; route preview path validity; settings persist in local storage.

**C. Performance Tests**

- Automated Lighthouse/WebGL perf check; FPS sampling at p50/p95; payload size budget enforcement in CI.

**D. Accessibility Checks**

- Keyboard‑only scenario; high‑contrast HUD readability; motion reduction setting (P1).

---

## 15) Architecture (High‑Level)

- **Frontend**: React + React‑Three‑Fiber, drei, Rapier physics.
- **Scene safety**: All reads use sanitized layout; error boundary protects `<Html>`.
- **Hosting**: Static hosting (S3/CloudFront) with cache busting; CSP allowing WebGL.
- **Telemetry**: Lightweight event queue → HTTPS collector (or mock for internal).

**Performance Budgets**: 1.8 MB gzipped JS, ≤300 draw calls, ≤200k tris, ≤2 textures (if any), no external fonts in scene.

---

## 16) Release Plan & Timeline (T‑shirt sizes)

- **P0/MVP (4–5 wks)**: Current features + perf hardening + CDN deploy.
- **P1 (3–4 wks)**: BM/EN toggle, settings panel, route preview, screenshot export.
- **P2 (research)**: WebXR prototype, heatmaps, multi‑clinic importer.

---

## 17) RICE Prioritization (for MVP+ features)

| Feature                        | Reach (90d) | Impact | Confidence | Effort | RICE    |
| ------------------------------ | ----------- | ------ | ---------- | ------ | ------- |
| BM/EN toggle                   | 500 users   | M      | 0.8        | 2      | **200** |
| Route preview                  | 400         | H      | 0.6        | 4      | **60**  |
| Settings (motion, sensitivity) | 500         | M      | 0.7        | 2      | **175** |
| Screenshot export              | 200         | L      | 0.7        | 1      | **140** |
| WebXR preview                  | 120         | H      | 0.4        | 6      | **8**   |

(Impact scale: H=3, M=2, L=1; RICE = Reach×Impact×Confidence / Effort)

---

## 18) Risks & Mitigations

- **Perf drift** → enforce budgets in CI; scene optimizer pass.
- **Motion sickness** → motion‑reduction mode; tutorial cues; lower default speed.
- **Stakeholder disagreement on fidelity** → tenet #1; explicit *non‑goal* for photorealism MVP.
- **Browser variability** → test matrix; graceful degradation (shadows off).

---

## 19) Dependencies

- Approval for signage copy (BM/EN) from clinic ops
- Hosting + domain setup
- QA devices (low‑end laptop)
- Analytics endpoint (or stub)

---

## 20) Open Questions

1. Do we want **public** access or **staff‑only** (behind SSO)?
2. Level of **fidelity vs. performance** we’re comfortable with (caps above OK?).
3. Is **route preview** part of P1 or P2?
4. Any **legal/disclaimer** text required by MoH for training tools?

---

## 21) References & Frameworks

- Working Backwards / PRFAQ (Amazon); Lean Startup (Ries, 2011); Double Diamond (Design Council, 2005); Objectives & Key Results and continuous discovery (Gothelf & Seiden, 2017); Motivation‑hygiene (Herzberg, 1959) for team incentives; PM trade‑offs (HBR, 2020); transformation benchmarks (McKinsey, 2021).

---

## 22) One‑Page Summary (for execs)

- **Problem**: Orientation and planning are slow and costly.
- **Solution**: Web‑based walkable clinic with clear signage and collisions.
- **Customer benefit**: Faster onboarding; remote planning; zero install.
- **Metrics**: TTO ↓40%, p95 FPS ≥45, crash‑free loads.
- **Scope**: KK Titiwangsa, single floor, static; BM/EN toggle and routes next.
- **Risks**: Performance; motion sickness; fidelity debates — mitigations in place.


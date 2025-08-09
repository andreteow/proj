# Walkable 3D Clinic – Klinik Kesihatan Titiwangsa

A browser‑based 3D walkthrough of Klinik Kesihatan Titiwangsa for staff/patient orientation and navigation confidence.

Built with Next.js + TypeScript, React Three Fiber, drei, Rapier physics, and Zustand.

## Features
- First‑person movement with strict collisions (Rapier physics)
- Keyboard‑only yaw (left/right arrows), no mouse look
- Explicit interactions via E key for checkpoints:
  1) Registration
  2) Consultation (any consult room)
  3) Pharmacy
- Running timer from first to last checkpoint
- "New Game" button to reset progress and teleport to spawn
- GTA‑style circular mini‑map that rotates with player heading
- Soft pastel gradient theme for scene and UI
- Clear HUD with controls, objectives, timer, and hints

## Getting Started

### Requirements
- Node.js 18+
- npm or pnpm

### Install & Run
```bash
# from project root
npm install
npm run dev
# open http://localhost:3000
```

If you prefer pnpm:
```bash
pnpm install
pnpm dev
```

## Controls
- WASD: Move
- Shift: Run
- Left/Right Arrow: Look (yaw only)
- E: Interact at highlighted counters/rooms
- M: Toggle mini‑map
- HUD "New Game" button: Reset progress and timer, teleport to spawn

Notes:
- There is no up/down look (pitch). Navigation is simplified to yaw only per requirements.
- Arrow key page scrolling is prevented.

## Objectives & Timer
- Flow: Registration → Consultation → Pharmacy
- The timer starts when you complete the first checkpoint and stops at the last.
- The HUD shows a live timer and marks each completed step.

## Mini‑map
- Circular, GTA‑style map clipped to a circle.
- The map rotates with your heading so a fixed arrow always points up.
- The player stays centered; environment moves/rotates underneath.

## Project Structure
```
app/
  layout.tsx, page.tsx, globals.css
components/
  ClinicScene.tsx, Player.tsx, HUD.tsx, MiniMap.tsx,
  playerStore.ts, progressStore.ts
lib/
  types.ts, layout.ts
data/
  kk-titiwangsa.ts
```

- `ClinicScene.tsx`: World bounds, rooms, walls with colliders, furniture, and lighting.
- `Player.tsx`: Movement, yaw control, Rapier rigid body, interactions, CCD, and reset.
- `HUD.tsx`: Controls, objectives, timer, hints, New Game.
- `MiniMap.tsx`: Circular rotating minimap.
- `playerStore.ts` / `progressStore.ts`: Global state via Zustand.

## Styling & Theme
- Soft pastel gradient background (global CSS) with gentle lighting in the scene.
- Mini‑map uses subtle borders and glow for legibility.

## Data & Safety
- Static, sanitized layout data in `data/` and `lib/`.
- No external APIs or secrets required.

## Known Limitations
- Layout is approximate for MVP; accuracy can be improved with better floor plans.
- Performance can vary by device; consider lowering shadows or FOV if needed.

## Contributing
- Follow the existing structure and keep files under ~400 lines when possible.
- Prefer simple, maintainable solutions and reuse shared hooks/utils.

## License
MIT

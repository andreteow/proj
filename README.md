# Walkable 3D Clinic – Klinik Kesihatan Titiwangsa

A browser‑based 3D walkthrough of Klinik Kesihatan Titiwangsa for staff/patient orientation and navigation confidence.

Built with Next.js + TypeScript, React Three Fiber, drei, Rapier physics, and Zustand.

## Hackathon TL;DR
- What: Walkable 3D clinic + real‑time voice concierge (Vapi) that can find providers, book appointments, give directions, set reminders, and log notes.
- Why: Reduce confusion at intake, increase show‑ups, and lighten staff load by making navigation and booking effortless.
- How: 3D app in the browser; voice agent (Vapi) calls secure webhooks (n8n/Make) that read/write Google Sheets (seeded from the CSVs in this repo).
- Demo flow: Walk to Registration → ask the voice agent to find a doctor → book → receive SMS confirmation → get step‑by‑step directions.
- Status: Frontend MVP complete; webhook workflows and CSV datasets provided; plug in your Vapi agent + Google Sheets to go live quickly.

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

## Vapi Real‑time Voice Agent Integration
Pair the 3D clinic with a Vapi voice agent acting as a live concierge. Agent capabilities:
- find_provider: list nearby/suitable providers from Sheets
- book_appointment: create a booking and send SMS confirmation
- get_directions: return step‑by‑step text and optionally SMS it
- set_reminder: schedule post‑visit reminders via SMS/WA
- log_note: log call summaries

Workflows provided in this repo:
- `workflow.json` (n8n): production‑style webhooks, reminders, SMS fan‑out
- `vapi_workflowv2.json` (Make/Router): lightweight alternative for the same intents
- `vapi_workflow.json`: voice conversation plan reference

All webhooks expect header `X-Shared-Secret: <SHARED_SECRET>`.

Endpoints (see workflows for payloads):
- POST /find_provider → returns an array of providers
- POST /book_appointment → returns { status, booking_ref } and sends SMS
- POST /get_directions → returns { steps: [...] } and can SMS full text
- POST /set_reminder → returns { ok, next_due_at }
- POST /log_note → returns { ok }

## Getting Started

### Requirements
- Node.js 18+
- npm or pnpm
- Google account (Google Sheets)
- n8n (Cloud/self‑host) or Make/Router for webhooks
- Vapi account (real‑time voice agent)

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

## Quickstart (10–15 minutes)
1) Google Sheets
- Create a new Google Sheet and import the CSVs in this repo as separate sheets named exactly:
  - Clinics_Doctors
  - Patients
  - Appointments
  - Reminders
  - Call_Logs
- Copy the Spreadsheet ID for later.

2) n8n (recommended)
- Import `workflow.json`.
- Set env vars: `SHARED_SECRET`, `TODO_SPREADSHEET_ID`, and optionally `SMS_WEBHOOK`/`SEND_CHANNEL`.
- Activate the workflow; note the public webhook base URL. Paths: `/find_provider`, `/book_appointment`, `/get_directions`, `/set_reminder`, `/log_note`.

3) Vapi
- Create an agent (use `vapi_workflow.json` as a plan reference).
- Add tools that POST to each webhook with header `X-Shared-Secret: <SHARED_SECRET>` and JSON bodies per the workflows.
- Use the agent’s web widget or phone number for live demo.

4) Run the 3D app
- Start the dev server (above). Open the 3D clinic and, in a separate tab/device, talk to the Vapi agent to complete the demo.

Alternative: Make/Router
- Import `vapi_workflowv2.json`, configure Google Sheets + Spreadsheet ID, and point Vapi tools to its webhook URL(s).

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
- Workflows: `workflow.json`, `vapi_workflowv2.json`, `vapi_workflow.json` for automation + conversation.
- Data: CSVs (`Clinics_Doctors.csv`, `Patients.csv`, `Appointments.csv`, `Reminders.csv`, `Call_Logs.csv`) to seed your Sheet.

## Styling & Theme
- Soft pastel gradient background (global CSS) with gentle lighting in the scene.
- Mini‑map uses subtle borders and glow for legibility.

## Data & Safety
- Static, sanitized layout data in `data/` and `lib/` (no PHI committed).
- Webhooks secured via `X-Shared-Secret`.
- Sample data lives in CSVs; import into your own Google Sheet to go live.

## Known Limitations
- Layout is approximate for MVP; accuracy can be improved with better floor plans.
- Performance can vary by device; consider lowering shadows or FOV if needed.
- The frontend does not embed the voice widget; run the Vapi agent in parallel (web widget/phone) for the demo.

### Demo Script (suggested)
1) Open the 3D clinic, walk to Registration (press E to interact).
2) Say to Vapi: “Find a Malay‑speaking GP near Titiwangsa.”
3) Pick a provider; say: “Book tomorrow 9:30am for Asha, +60…”.
4) Receive SMS with confirmation and map link; ask: “Give me directions.”
5) Agent reads steps; continue walking to Consultation then Pharmacy.

## Contributing
- Follow the existing structure and keep files under ~400 lines when possible.
- Prefer simple, maintainable solutions and reuse shared hooks/utils.

## License
MIT

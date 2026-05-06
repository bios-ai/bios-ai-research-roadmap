# Prompt for Claude Code in Cursor

You are building an interactive product roadmap planning tool for BIOS Health, a cancer intelligence platform company. The project is a Vite + React app that currently renders a static roadmap visualization. Your job is to evolve it into an editable planning tool with persistent storage.

## Start Here

Read `PROJECT_CONTEXT.md` thoroughly before making any changes. It contains the full business context, architectural decisions, data structures, brand colors, and product strategy that inform every design decision in this tool. This is not a generic roadmap tool — it is purpose-built for a specific company with specific data structures and workflows.

## Current State

The project is a single-file React app (`src/App.jsx`) that renders:
- A swim-lane Gantt chart with 5 lanes: Shared Platform, Survivorship, Screening (Ambry), Enterprise (AMC), and AI Development Streams
- The Gantt is split into two panels: 2026 (monthly, Mar–Dec) and 2027 (quarterly, Q1–Q4)
- Block-based items in the first 4 lanes (milestones with metadata: label, detail, status, dates, tags)
- Continuous ribbon items in the AI lane with waypoint markers (integration, shadow mode, regulatory milestones)
- Three tabs: Product Roadmap, Strategy Bridge, and Regulatory Timeline
- All data is hardcoded in the component file as JavaScript objects

The app builds and runs (`npm run dev`). It was verified working as of April 28, 2026.

## Phase 1: Refactor (do this first)

1. **Extract data** — Move all milestone data, AI stream data, and regulatory items into a separate `src/data/` directory. Use TypeScript interfaces as defined in PROJECT_CONTEXT.md. Create separate files: `milestones.ts`, `aiStreams.ts`, `regulatory.ts`, `colors.ts`.

2. **Break apart components** — Split App.jsx into:
   - `components/TimelineHeader.tsx` — month/quarter column headers
   - `components/StreamLane.tsx` — collapsible block-based swim lane
   - `components/AIRibbonLane.tsx` — the continuous AI development ribbon with waypoints
   - `components/RoadmapPanel.tsx` — a single panel (2026 or 2027) combining header + lanes
   - `components/StrategyBridge.tsx` — the strategy moat mapping tab
   - `components/RegulatoryTimeline.tsx` — the regulatory timeline tab
   - `App.tsx` — tab navigation and layout shell

3. **Add TypeScript** — Convert to .tsx files. Use the interfaces from PROJECT_CONTEXT.md for Milestone, AIStream, Waypoint, etc.

4. **Verify it still renders identically** after refactoring.

## Phase 2: Editor UI

1. **Add an edit mode toggle** — button in the header that switches between "View" and "Edit" modes. View mode is read-only (current behavior). Edit mode enables interactions below.

2. **Click-to-edit blocks** — In edit mode, clicking a milestone block opens a side panel or modal with a form:
   - Label (text input)
   - Detail/description (textarea)
   - Status (dropdown: In Progress, Upcoming, Not Started, Future)
   - Start column / End column (dropdowns mapped to months/quarters)
   - Product stream (dropdown: Platform, Survivorship, Screening, Enterprise)
   - Tags: AI toggle, Milestone toggle, Regulatory classification (text input, optional)
   - Dependencies (multi-select of other milestone labels)
   - Save / Cancel / Delete buttons

3. **Add new block** — In edit mode, an "Add Item" button per lane opens the same form with empty fields. New item appears in the lane after save.

4. **Click-to-edit AI waypoints** — Similar pattern for AI stream waypoints: click opens form with label, type (Logic live / Shadow / Integration / Regulatory), column position, above/below toggle.

5. **Add new AI stream** — Button to add a new continuous AI development ribbon with label, color, start/end columns, and initial waypoints.

6. **Drag to reposition** — Optional but nice: drag block edges to resize (change span), drag block body to move (change col). Waypoint dots draggable along ribbon.

## Phase 3: Persistent Storage

1. **Set up Supabase** — Create a Supabase project (free tier). Create tables:
   - `milestones` (id, stream, label, detail, status, col, span, ai, milestone, regulatory, deps, created_at, updated_at)
   - `ai_streams` (id, label, detail, color, start_col, end_col, panel, created_at, updated_at)
   - `waypoints` (id, stream_id, col, type, label, above, created_at, updated_at)

2. **Supabase client** — Install `@supabase/supabase-js`. Create a client in `src/lib/supabase.ts`. Use environment variables for URL and anon key.

3. **Data loading** — On app mount, fetch all data from Supabase. Show loading state. Fall back to local data if fetch fails.

4. **Save on edit** — Every create/update/delete writes to Supabase. Use optimistic UI updates (update local state immediately, sync to Supabase in background, revert on failure).

5. **Seed script** — Create a `scripts/seed.ts` that populates Supabase with the current hardcoded data for initial setup.

## Design Constraints

- **Brand colors are defined in PROJECT_CONTEXT.md** — use them exactly. The palette is: Black, White, Gold (#F7C07D) as primary accent, Cream (#FEE5C5), Sienna (#A76941), Rust (#903516), Patina (#6A9A8B), Deep Sea (#4B7178), and a gray ramp. Amber (#FFA14F) used sparingly.
- **White background** throughout. No dark mode for now.
- **No Tailwind** — the current app uses inline styles. You can introduce CSS modules or styled-components if you prefer, but match the existing visual language.
- **Fonts** — system-ui / -apple-system / sans-serif stack. Keep it clean and professional.
- **The tool should feel like a planning tool, not a dashboard.** Edit mode should be fast and low-friction. Think Notion or Linear, not a BI tool.

## What NOT to do

- Don't redesign the roadmap visualization. The current layout (swim lanes, AI ribbons with waypoints, two-panel split) is intentional and has been iterated on extensively. Improve the code quality, not the visual design.
- Don't add authentication yet. That will be handled at the infrastructure layer (Cloudflare Access) separately from the app code.
- Don't over-engineer the backend. Supabase with simple tables is the right level of complexity. No GraphQL, no complex relational models, no real-time subscriptions (yet).
- Don't add features beyond what's described here without asking. The scope is intentionally constrained.

## File Structure (target)

```
bios-roadmap/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── components/
│   │   ├── TimelineHeader.tsx
│   │   ├── StreamLane.tsx
│   │   ├── AIRibbonLane.tsx
│   │   ├── RoadmapPanel.tsx
│   │   ├── StrategyBridge.tsx
│   │   ├── RegulatoryTimeline.tsx
│   │   ├── EditModal.tsx
│   │   └── AIWaypointEditor.tsx
│   ├── data/
│   │   ├── milestones.ts
│   │   ├── aiStreams.ts
│   │   ├── regulatory.ts
│   │   └── colors.ts
│   ├── lib/
│   │   └── supabase.ts
│   └── types/
│       └── index.ts
├── scripts/
│   └── seed.ts
├── PROJECT_CONTEXT.md
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .env.example
```

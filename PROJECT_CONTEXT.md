# BIOS Health — Strategic Product Roadmap Tool

## Project Context

This is an interactive roadmap visualization and planning tool for BIOS Health's product and technology strategy. It was developed through an extensive product strategy conversation and represents the current state of thinking across product, AI, regulatory, and executive leadership.

---

## Company Overview

BIOS Health is building the intelligence and care delivery layer for longitudinal cancer management, focusing on two underserved populations: hereditary cancer gene carriers (screening) and cancer survivors (survivorship). The platform combines clinical intelligence, a closed-loop care model, and a data pipeline that improves over time.

Three product streams run in parallel on a shared platform:
- **Survivorship** — NP-led virtual care, guideline-driven SCPs, launched May 2026
- **Screening** — personalized risk assessment + optimized screening protocols via Ambry partnership, targeting September 2026
- **Enterprise** — platform-as-a-service for health systems (API-first, headless), targeting Q4 2026

---

## Key Architectural Decisions

### The Intelligence Pipeline (Universal, all products)

Four-stage pipeline that transforms raw patient data into clinical action:

1. **Data Ingestion** — Unstructured clinical docs, genomic reports, labs, imaging, PROs, wearable data → NLP/LLM extraction → structured FHIR resources stored in Medplum
2. **Clinical Fact Computation** — LLM-assisted extraction logic generates FHIRPath queries executed against patient FHIR resources in Medplum → derived clinical facts (treatment exposures, biomarker status, risk variables, genomic findings, comorbidity flags)
3. **Clinical Logic & Advisory Intelligence** — Facts evaluated by deterministic clinical logic (at launch) and/or AI advisory models (as they mature) → typed clinical decisions. Interface contract: facts in, typed clinical outputs out.
4. **Clinical Outputs & Action** — Care plans, screening protocols, surveillance schedules, order recommendations, referrals, notifications → closed-loop captures downstream results and feeds back to Stage 1

### Progressive Intelligence Architecture (Three-Mode Pattern)

For every clinical domain, intelligence operates in one of three modes:

- **Mode 1: Logic-Only (Launch State)** — Deterministic clinical logic, fully traceable, CDS-exempt under 21st Century Cures Act. All survivorship domains at launch.
- **Mode 2: Shadow (Validation State)** — AI model runs in parallel, outputs logged but not surfaced to patients. Systematically compared to production outputs. Generates regulatory evidence as byproduct. May optionally display AI recommendations alongside deterministic outputs for provider review.
- **Mode 3: Model-Primary (Post-Swap State)** — AI model promoted to primary after shadow validation meets defined criteria. Previous system remains as fallback. Interface contract unchanged.

**Promotion decisions** are made through cross-functional consensus: product, clinical, AI, and executive leadership.

**This pattern is potentially patentable** — the three-mode progression with built-in shadow validation and PCCP-aligned governance.

### Care Plan Workflow (Canvas Constraints)

Canvas EHR limitations shape the architecture:
- Canvas CarePlan is **read-only** (GET methods only) — no programmatic write
- Canvas can emit orders as FHIR resources but cannot receive inbound orders programmatically
- **Medplum is the care plan system of record**, not Canvas

**Pilot workflow:** Clinical Logic Engine generates SCP → pushed to Canvas as a DocumentReference (clinical note) → NP reviews, places orders manually in Canvas → Canvas emits orders back to Medplum → reconciliation process compares recommendations vs actual orders → updates canonical care plan in Medplum → patient app renders from reconciled state.

**General Release workflow:** Custom authoring view (Canvas plugin or alongside Canvas) → provider edits plan, accepts/overrides per clinical domain → publish triggers downstream automation (orders, scheduling, referrals, patient app update).

Inquiry sent to Canvas about FHIR write support roadmap for CarePlan, ServiceRequest, Procedure.

### Screening Product — Three-Tier Plan Progression

- **Pilot:** Two plans side by side — (1) guidelines-based protocol, (2) BIOS best practices (Clinical Logic Engine, not AI)
- **General Release:** Third plan added — (3) AI-optimized (digital twin simulation + risk panel), surfaced in Canvas via custom plugin
- Guidelines always presented first. Provider always decides. Trust ramp: baseline → enhancement → optimization.

### Survivorship Product — Guideline Execution Engine

- Deterministic clinical logic encoding NCCN/ASCO guidelines
- Not primarily model-driven at launch
- Closed-loop: SCP generation → surveillance scheduling → adherence tracking → result ingestion → risk recalculation → SCP update → specialist coordination → PRO collection → escalation
- Care teams: NP-led virtual practice, role-specific views for PCP/specialists/patients

### Enterprise — Headless Platform

- API-first: same intelligence exposed via API layer
- Health system's EHR replaces Canvas, their providers replace BIOS NPs
- Clinical Logic Editor: institutions author own protocols
- Analytics & Performance Platform ("care lab"): adherence, completion, risk distribution, outcomes
- **Dependency-gated**: API surfaces built as byproduct of survivorship and screening MVPs, not separate workstream

---

## AI Development Streams

Five continuous development streams with integration waypoints:

### Cancer Risk Model
- Screening-specific: personalized risk panel (population + genomic models) + digital twin simulation + policy evaluation
- Aggregate model MVP: August 2026
- Ambry go-live: September 2026
- Proprietary shadow: ~November 2026
- v2 multi-factor: Q2 2027
- De Novo candidate: Q3 2027
- Designed to embed third-party risk models with BIOS owning composite risk curves

### Recurrence Risk Model
- Survivorship core intelligence
- Published models live (CTS5, PREDICT): July 2026
- Proprietary model enters shadow: ~November 2026
- Proprietary v1 promoted: Q2 2027
- Same third-party model embedding capability

### Toxicity & Comorbidity Prediction
- Deterministic logic in Clinical Logic Engine for 2026 (treatment exposure → surveillance action)
- Predictive models begin Q1 2027 (on BIOS + purchased EHR outcomes data)
- Predictive MVP: Q3 2027
- Shadow vs logic: Q4 2027

### Screening Optimizer
- Digital twin policy evaluation layer
- Deterministic guideline baseline: August 2026
- Model MVP + shadow: September 2026
- Model promoted: ~November 2026
- v2 (adherence + trajectory): Q1 2027

### Benefits Intelligence (RTBI)
- Real-time cost/coverage/PA prediction during ordering
- 2027 build (complex capability)
- Requirements: December 2026
- Claims MVP: Q2 2027
- Learning shadow: Q4 2027

### Licensed Model
- Nucleotide Transformer V3 (licensed from InstaDeep) — used in AI module architecture for genomic intelligence

---

## Roadmap Timeline

### 2026 Monthly Execution

**Shared Platform:**
| Item | Timeline | Status |
|------|----------|--------|
| Medplum + Metriport + Infra | Mar–Jun | In Progress |
| Data Ingestion Pipeline | Apr–Jun | In Progress |
| Canvas EHR Setup & Integration | Apr–Jun | In Progress |
| Clinical Logic Engine | Apr–Jun | In Progress |
| Care Plan Reconciliation (Pilot) | May–Jul | Not Started |
| Pilot MVP Patient App | May–Jul | Not Started |
| Commercial MVP Patient App | Jul–Sep | Not Started |
| Analytics & Data Warehouse | May–Aug | Not Started |
| Orchestration Layer | Sep–Oct | Not Started |
| Clinical Agents Framework | Oct–Dec | Not Started |
| HealthKit / Health Connect | Oct–Nov | Not Started |
| Care Plan Authoring View | Nov–Dec | Not Started |

**Survivorship:**
| Item | Timeline | Status |
|------|----------|--------|
| Phase 0: Patient Onboarding | Mid-May | Upcoming |
| Phase 1: Clinical Workflow | June | Not Started |
| Phase 2: Patient App Launch | Mid-July | Not Started |
| ePRO Collection & Surveys | Aug–Sep | Not Started |

Phase 0 details: 20 patients/week, 5 cancer types, opt-in record retrieval via Metriport/Carequality.
Phase 1 requirements: Canvas, Clinical Logic Engine (beta), Canvas↔Medplum integration.
Phase 2: Auth, onboarding (4-6 screens), home screen, video visit, scheduling, care plan rendering, notifications.

**Screening (Ambry):**
| Item | Timeline | Status |
|------|----------|--------|
| Ambry Integration Build | Jun–Jul | Not Started |
| Patient App: Risk Screens | Jul–Sep | Not Started |
| Screening Plan Generation | Aug | Not Started |
| Ambry Go-Live | September | Not Started |
| Provider Risk Dashboard | Sep–Oct | Not Started |
| Canvas Screening Plugin | Oct–Nov | Not Started |

**Enterprise (AMC):**
| Item | Timeline | Status |
|------|----------|--------|
| AMC Partnership Agreement | Jul–Oct | Not Started |
| AMC Pilot Configuration | Oct–Dec | Not Started |

### 2027 Quarterly Horizon
| Item | Timeline | Stream |
|------|----------|--------|
| Vendor-Specific Wearables | Q1–Q2 | Platform |
| Platform Maturation | Q1–Q4 | Platform |
| MRD Integration | Q3–Q4 | Survivorship |
| FDA Pre-Sub & De Novo | Q3–Q4 | Screening |
| Partner Portal & APIs | Q1–Q2 | Enterprise |
| Multi-Tenant Scale | Q3–Q4 | Enterprise |

Note: Feature sequencing beyond Q3 2026 is directional and will be refined based on customer/partner demand signals, KOL discussions, and learnings from pilots.

---

## Regulatory Strategy

- **2026 (survivorship):** Logic-only. All CDS-exempt. Generating evidence.
- **2026 (screening):** Guidelines-first with optimization layer. CDS exemption posture — FDA pre-sub should confirm.
- **Late 2026–2027:** Shadow mode for proprietary models. Evidence accumulates.
- **2027:** FDA pre-submission meeting. De Novo dossier prep with shadow evidence + PCCP.
- **2027–2028:** First model promotions via PCCP framework.

Key regulatory question: Does the screening optimizer (incorporating patient preferences/cost beyond guidelines) maintain CDS exemption when presented alongside guideline-based protocols with physician choice?

---

## Platform Architecture (Six Layers)

1. **Advisory Intelligence Modules** — AI team's models, operate in whichever mode is current per domain
2. **Clinical Facts** — LLM-assisted FHIRPath extraction logic against Medplum FHIR resources
3. **Clinical Logic Engine** — Logic-based care plan/protocol/order generation. Primary in logic-only mode, fallback in model-primary.
4. **Clinical Agents** — Agentic workflows: surveillance, scheduling, prior auth
5. **Orchestration** — Event bus, scheduler, cross-platform workflow coordination
6. **Clinical Data Repository & Backend** — Medplum (FHIR, AWS), document store, analytics warehouse, auth, storage

Application surfaces: Patient App, Internal App, Partner Portal, Provider EHR (Canvas) — all consume via API gateway.

---

## Build vs Use

### We Build
- Deterministic clinical logic layer
- Proprietary clinical and genomic intelligence models
- Licensed foundational models (Nucleotide Transformer V3)
- Risk model orchestration layer (embeds third-party + proprietary, BIOS owns composite)
- Care plan generation and management
- Workflow and task orchestration engine
- Closed-loop integration layer
- Longitudinal data model and event tracking

### We Use / Integrate
- Frontier LLMs (Claude, GPT) for reasoning/summarization/NLG
- Specialized medical models (MedGemma and others)
- FHIR-based data platform (Medplum)
- EHR (Canvas) for provider encounters
- Health data exchange (Metriport/Carequality)
- Commodity infrastructure (AWS)

---

## Brand Colors

| Name | Hex | Usage |
|------|-----|-------|
| Black | #000000 | Core, headings, table headers |
| White | #FFFFFF | Backgrounds |
| Cream | #FEE5C5 | Callout backgrounds, "in progress" items |
| Light Gold | #FFD4A0 | "Upcoming" items |
| Gold | #F7C07D | Primary accent, heading underlines, header rules |
| Amber | #FFA14F | Use sparingly |
| Sienna | #A76941 | Sub-sub-headings, screening stream color |
| Rust | #903516 | Enterprise stream, regulatory tags |
| Near White | #F6F6F6 | "Not started" items |
| Light Gray | #EDEDED | "Future" items |
| Mid Gray | #D9D9D9 | Borders |
| Gray | #9C9C9C | Body text, footer |
| Patina | #6A9A8B | AI stream color, AI tags |
| Deep Sea | #4B7178 | Sub-headings, survivorship stream color |

---

## Data Structures

The roadmap is driven by three main data structures:

### MILESTONES (block-based items per stream)
```typescript
interface Milestone {
  col: number;        // Column index (0-based, maps to month or quarter)
  span: number;       // How many columns wide
  label: string;      // Display name
  detail: string;     // Description text
  status: "in-progress" | "upcoming" | "not-started" | "future";
  milestone?: boolean; // Shows milestone diamond marker
  ai?: boolean;       // Shows AI tag
  regulatory?: string; // Shows regulatory classification tag
  deps: string[];     // Dependency labels (informational, not enforced)
}
```

Organized by stream key: `platform`, `survivorship`, `screening`, `enterprise`

### AI_STREAMS (continuous ribbon items)
```typescript
interface AIStream {
  label: string;      // Stream name
  detail: string;     // Short description
  color: string;      // Hex color for the ribbon
  startCol: number;   // First column
  endCol: number;     // Last column
  waypoints: Waypoint[];
}

interface Waypoint {
  col: number;        // Column position
  type: "rul" | "shd" | "int" | "reg"; // Rules live, Shadow, Integration, Regulatory
  label: string;      // Display label
  above: boolean;     // Label position (above or below ribbon, for staggering)
}
```

### Rendering
- 2026 panel: 10 columns (Mar=0 through Dec=9), monthly
- 2027 panel: 4 columns (Q1=0 through Q4=3), quarterly
- Each panel has its own data arrays for milestones and AI streams
- Stream lanes are collapsible in the interactive version

---

## Future Development Roadmap (for this tool)

### Level 2: Persistent Storage
- Add edit mode toggle
- Click block to edit metadata (label, dates, status, detail, tags)
- Click empty space to add new block
- Save to Supabase (free tier) for persistence across sessions

### Level 3: Full Planning Tool
- Modal forms for structured metadata entry
- Drag-and-drop repositioning
- Dependency lines between blocks
- Filter/search capabilities
- Export to CSV/JSON
- Undo/redo

### Level 4: Notion Integration
- Read/write to Notion databases as backend
- Notion capability database becomes source of truth
- Bidirectional sync
- Automated artifact generation (weekly status, Gantt updates)

---

## Open Questions (as of April 28, 2026)

1. AI team timeline validation — distance between model releases may be shorter than shown
2. Canvas FHIR write capabilities — inquiry sent, response pending
3. Screening optimizer regulatory posture — CDS exemption with non-clinical factors, needs FDA pre-sub input
4. Ambry commercial timeline — September go-live needs partnership confirmation
5. Enterprise scope — AMC integration requirements need definition
6. Regulatory document — awaiting analysis from Mike and Chris
7. LLM extraction performance metrics — precision, recall, hallucination rate thresholds to be defined
8. FHIR sufficiency — some clinical computations may need ancillary structures beyond FHIR resources
9. AI model at September screening launch — depends on CDS exclusion framework confirmation
10. Enterprise acceleration — institutions requesting engagement now; pace gated on MVP delivery and hiring

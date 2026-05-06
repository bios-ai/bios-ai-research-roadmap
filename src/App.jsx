import { useState, useRef } from "react";
import { BRAND, LANE_COLOR, AI_MODEL_COLOR, STATUS, WAYPOINT, tint } from "./data/colors.js";

// ─── DATA ───
const MONTHS_2026 = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const QUARTERS_2027 = ["Q1 2027", "Q2 2027", "Q3 2027", "Q4 2027"];
const ALL_COLS = [...MONTHS_2026, ...QUARTERS_2027];
const HERE_COL = 2; // May 2026

// Cols: 0=Mar, 1=Apr, 2=May, 3=Jun, 4=Jul, 5=Aug, 6=Sep, 7=Oct, 8=Nov, 9=Dec, 10=Q1'27, 11=Q2'27, 12=Q3'27, 13=Q4'27

const lane = (hex) => ({ bg: hex, light: tint(hex) });

const STREAM_COLORS = {
  data:    lane(LANE_COLOR.data),
  infra:   lane(LANE_COLOR.infra),
  team:    lane(LANE_COLOR.team),
  product: lane(LANE_COLOR.product),
};

const MILESTONES = {
  data: [
    { col: 0, span: 14, label: "Tempus EHR — 100k patients pre/post Dx", detail: "In hand. Powers risk scoring v2, recurrence v1, transition v2.", status: "in-progress", deps: [] },
    { col: 2, span: 1, label: "NashBio trial begins", detail: "Trial period kicks off mid-May. Validate scope, schema, access.", status: "upcoming", milestone: true, deps: [] },
    { col: 3, span: 2, label: "Trial validation + GCP ingestion design", detail: "Legal / InfoSec sign-off. Design pipeline for staged ingestion to GCP.", status: "not-started", deps: ["NashBio trial begins"] },
    { col: 5, span: 1, label: "NashBio live on GCP", detail: "4M EHR + 200k WGS-paired live in our cloud environment.", status: "not-started", milestone: true, deps: ["Trial validation + GCP ingestion design"] },
    { col: 6, span: 4, label: "NashBio EDA + cohort definition", detail: "Exploratory analysis + cohort construction over 4M EHR. WGS subset for genomic risk drivers.", status: "not-started", deps: ["NashBio live on GCP"] },
    { col: 10, span: 4, label: "2027 modality acquisitions", detail: "Imaging, histology, proteomics, immunology, cfDNA / MRD, wearables, biological-age signals.", status: "future", deps: [] },
  ],
  infra: [
    { col: 0, span: 14, label: "Compliant infrastructure — TRE / SOC2 / HIPAA", detail: "Trusted Research Environments, SOC2 + HIPAA compliance, controls. Baseline that gates everything.", status: "in-progress", deps: [] },
    { col: 2, span: 3, label: "EHR clinical NLP v1", detail: "Unstructured → structured extraction over Tempus notes. Urgent v1 to exploit Tempus data; shared with Product (clinical logic engine).", status: "upcoming", milestone: true, deps: [] },
    { col: 5, span: 9, label: "EHR clinical NLP — continuous improvement", detail: "Long-term endeavor with dedicated team. New note types, specialties, signals come into scope.", status: "not-started", deps: ["EHR clinical NLP v1"] },
    { col: 3, span: 3, label: "GCP environment for NashBio", detail: "Storage tiers, compute quotas, IAM. Ready before NashBio go-live.", status: "not-started", deps: [] },
    { col: 8, span: 4, label: "Cohort curation tooling (gold-standard)", detail: "Medical-team-validated subsets for fine-tuning, evaluation, regulatory submission.", status: "not-started", deps: [] },
    { col: 10, span: 4, label: "Privacy tech (federated, homomorphic)", detail: "Federated learning + homomorphic encryption — enablers for partner data and sensitive deployments.", status: "future", deps: [] },
  ],
  team: [
    { col: 0, span: 14, label: "Core team — Thomas, Amber, Sam", detail: "Head of AI + AI Scientist + AI Engineer. Today's foundation.", status: "in-progress", deps: [] },
    { col: 3, span: 1, label: "Courtney Shearer joins (AI Scientist)", detail: "June 15. Onboards onto recurrence track.", status: "upcoming", milestone: true, deps: [] },
    { col: 4, span: 1, label: "+2 hires (AI Scientist + Engineer)", detail: "End of July. Brings team to 6.", status: "upcoming", milestone: true, deps: [] },
    { col: 5, span: 9, label: "Team at 6 — full bench through 2027", detail: "Hold; revisit Q4 2026 hiring with 2027 plan.", status: "not-started", deps: [] },
  ],
  product: [
    { col: 2, span: 1, label: "Patient onboarding live", detail: "NPI + Carequality + Metriport + Canvas + billing. Late May / early Jun.", status: "upcoming", milestone: true, deps: [] },
    { col: 3, span: 1, label: "First patient seen", detail: "Clinical workflows + Canvas ↔ Medplum + care plan. Risk scores production-ready by here.", status: "not-started", milestone: true, deps: ["EHR clinical NLP v1"] },
    { col: 3, span: 1, label: "Tempus data decision", detail: "Investment / extension decision. AI provides first Tempus-trained model results.", status: "not-started", milestone: true, deps: [] },
    { col: 4, span: 4, label: "Patient app rollout (UNNAMED)", detail: "RN UI library, design, skeleton, pilot scope, public release.", status: "not-started", deps: [] },
    { col: 8, span: 6, label: "Survivorship + Screening expansion", detail: "Cancer-type expansion, multi-cohort enrolment, AI features deepen.", status: "future", deps: [] },
  ],
};

// AI Models — continuous ribbons with version waypoints
// Each version is a waypoint; the "approach" detail reads inline.
const AI_STREAMS = [
  {
    label: "Risk Scoring (Screening)",
    detail: "Long-term + short-term risk for undiagnosed individuals.",
    color: AI_MODEL_COLOR.riskScreening,
    startCol: 0,
    endCol: 13,
    waypoints: [
      { col: 0, type: "rules", label: "v1 — 20 lit models / 14 cancers" },
      { col: 2, type: "integration", label: "v2 — Cox + DeepSurv on Tempus" },
      { col: 6, type: "integration", label: "v3 — Longitudinal transformer (Tempus + NashBio 4M)" },
      { col: 11, type: "integration", label: "v4 — WGS-driven genomic risk drivers (NTv3)" },
      { col: 13, type: "integration", label: "+ multi-modal extensions" },
    ],
  },
  {
    label: "Risk Scoring (Recurrence)",
    detail: "Tumor-informed survivorship; first version in flight.",
    color: AI_MODEL_COLOR.riskRecurrence,
    startCol: 2,
    endCol: 13,
    waypoints: [
      { col: 2, type: "rules", label: "v1 — Cox + DeepSurv tumor-informed (Tempus post-Dx)" },
      { col: 7, type: "integration", label: "v2 — Longitudinal transformer (NashBio scale)" },
      { col: 12, type: "integration", label: "v3 — + cfDNA / MRD + multi-modal" },
    ],
  },
  {
    label: "Digital Twin",
    detail: "Recommendation engine over guidelines and policies.",
    color: AI_MODEL_COLOR.digitalTwin,
    startCol: 0,
    endCol: 13,
    waypoints: [
      { col: 0, type: "rules", label: "v1 — PBVI solver (today)" },
      { col: 5, type: "integration", label: "v2 — Deep RL on our trained risk + transition" },
      { col: 11, type: "integration", label: "v3 — Unified longitudinal-transformer backbone" },
    ],
  },
  {
    label: "Transition / Evolution",
    detail: "World model: stage transitions, drug response, comorbidities, mortality.",
    color: AI_MODEL_COLOR.transition,
    startCol: 0,
    endCol: 13,
    waypoints: [
      { col: 0, type: "rules", label: "v1 — Lit subgroup stats (AI-agent swarm)" },
      { col: 6, type: "integration", label: "v2 — Learnt models on Tempus longitudinal data" },
      { col: 11, type: "integration", label: "v3 — Unified transformer (jointly with risk scoring)" },
    ],
  },
];

// ─── EVOLUTION TABLES (Tab: Model Evolution) ───
const MODEL_EVOLUTION = [
  {
    name: "Risk Scoring",
    color: AI_MODEL_COLOR.riskScreening,
    domain: "Screening (long-term + short-term) and Survivorship (recurrence)",
    rows: [
      { ver: "v1 (today)", approach: "20 risk models from literature, aggregated across 14 cancer types", data: "Literature priors via AI-agent swarm", when: "Now" },
      { ver: "v2", approach: "Cox + DeepSurv on our data; first recurrence models (tumor-informed)", data: "Tempus 100k EHR (pre- and post-Dx)", when: "2026" },
      { ver: "v3", approach: "Longitudinal transformer (Catch-FM / Apollo / Delphi-2M class)", data: "Tempus + NashBio 4M EHR", when: "2026 / 2027" },
      { ver: "v4", approach: "+ long-term genomic risk drivers (NTv3-derived); + multi-modal", data: "+ NashBio 200k WGS-paired; + imaging, proteomics, cfDNA, …", when: "2027+" },
    ],
  },
  {
    name: "Digital Twin",
    color: AI_MODEL_COLOR.digitalTwin,
    domain: "Recommendation engine over guidelines and policies (preferences + constraints + interpretability)",
    rows: [
      { ver: "v1 (today)", approach: "PBVI solver", data: "Aggregated literature risk scores; lit-derived transition stats", when: "Now" },
      { ver: "v2", approach: "Deep RL", data: "Our trained risk and transition models", when: "2026 / 2027" },
      { ver: "v3", approach: "Deep RL with unified longitudinal-transformer backbone", data: "Foundation-model risk + transition outputs", when: "2027+" },
    ],
  },
  {
    name: "Transition / Evolution",
    color: AI_MODEL_COLOR.transition,
    domain: "World model: cancer-stage transitions, drug response, comorbidities, mortality",
    rows: [
      { ver: "v1 (today)", approach: "Subgroup statistics from literature (sex, ethnicity)", data: "AI-agent swarm over published literature", when: "Now" },
      { ver: "v2", approach: "Learnt transition models", data: "Tempus longitudinal data", when: "2026 / 2027" },
      { ver: "v3", approach: "Unified longitudinal transformer (jointly with risk scoring)", data: "Tempus + NashBio + multi-modal", when: "2027+" },
    ],
  },
];

// ─── COMPONENTS ───

function StreamLane({ items, label, color, expanded, onToggle }) {
  return (
    <div style={{ marginBottom: 2 }}>
      <div
        onClick={onToggle}
        style={{
          display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
          background: color.bg, color: BRAND.white, cursor: "pointer",
          borderRadius: expanded ? "6px 6px 0 0" : 6, userSelect: "none",
          position: "sticky", left: 0, zIndex: 5,
        }}
      >
        <span style={{ fontSize: 11, transform: expanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s" }}>▶</span>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>{label}</span>
        <span style={{ fontSize: 11, opacity: 0.7, marginLeft: "auto" }}>{items.length} items</span>
      </div>
      {expanded && (
        <div style={{ background: color.light, borderRadius: "0 0 6px 6px", padding: "6px 0", position: "relative", minHeight: 60 }}>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${ALL_COLS.length}, 120px)`, position: "relative" }}>
            {ALL_COLS.map((_, i) => (
              <div key={i} style={{ borderRight: i === 9 ? `2px solid ${tint(color.bg, "40")}` : `1px solid ${tint(color.bg, "15")}`, height: "100%", position: "absolute", left: i * 120 + 120, top: 0, bottom: 0 }} />
            ))}
            <div style={{ gridColumn: `1 / -1`, padding: "4px 8px" }}>
              {items.map((item, idx) => {
                const st = STATUS[item.status];
                return (
                  <div key={idx} style={{
                    marginLeft: item.col * 120,
                    width: item.span * 120 - 8,
                    background: st.bg,
                    border: `1.5px solid ${st.border}`,
                    borderRadius: 5,
                    padding: "6px 10px",
                    marginBottom: 4,
                    position: "relative",
                    borderLeft: item.milestone ? `4px solid ${color.bg}` : `1.5px solid ${st.border}`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: st.dot, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: BRAND.black }}>{item.label}</span>
                      {item.milestone && <span style={{ fontSize: 9, background: color.bg, color: BRAND.white, padding: "1px 5px", borderRadius: 3, fontWeight: 600 }}>MILESTONE</span>}
                    </div>
                    <div style={{ fontSize: 10, color: BRAND.gray, marginTop: 3, lineHeight: 1.4 }}>{item.detail}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AIStreamLane({ expanded, onToggle }) {
  const aiColor = { bg: LANE_COLOR.ai, light: tint(LANE_COLOR.ai) };
  return (
    <div style={{ marginBottom: 2 }}>
      <div onClick={onToggle} style={{
        display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
        background: aiColor.bg, color: BRAND.white, cursor: "pointer",
        borderRadius: expanded ? "6px 6px 0 0" : 6, userSelect: "none",
      }}>
        <span style={{ fontSize: 11, transform: expanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s" }}>▶</span>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>AI MODELS — continuous evolution</span>
        <span style={{ fontSize: 10, background: tint(BRAND.white, "33"), color: BRAND.white, padding: "1px 6px", borderRadius: 3, fontWeight: 600, marginLeft: 8 }}>v1 → vN</span>
        <span style={{ fontSize: 11, opacity: 0.7, marginLeft: "auto" }}>{AI_STREAMS.length} models</span>
      </div>
      {expanded && (
        <div style={{ background: aiColor.light, borderRadius: "0 0 6px 6px", padding: "8px 0", position: "relative" }}>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${ALL_COLS.length}, 120px)`, position: "relative" }}>
            {ALL_COLS.map((_, i) => (
              <div key={i} style={{ borderRight: i === 9 ? `2px solid ${tint(aiColor.bg, "40")}` : `1px solid ${tint(aiColor.bg, "15")}`, height: "100%", position: "absolute", left: i * 120 + 120, top: 0, bottom: 0 }} />
            ))}
            <div style={{ gridColumn: "1 / -1", padding: "4px 8px" }}>
              {AI_STREAMS.map((stream, si) => (
                <div key={si} style={{ marginBottom: 14, position: "relative" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, marginLeft: stream.startCol * 120 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: stream.color }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: stream.color }}>{stream.label}</span>
                    <span style={{ fontSize: 9, color: BRAND.gray }}>{stream.detail}</span>
                  </div>
                  {/* Waypoint labels ABOVE ribbon (even-indexed) */}
                  <div style={{ position: "relative", height: 16, marginBottom: 2 }}>
                    {stream.waypoints.map((wp, wi) => {
                      if (wi % 2 !== 0) return null;
                      const wpStyle = WAYPOINT[wp.type];
                      const leftPx = stream.startCol * 120 + (wp.col - stream.startCol) * 120;
                      return (
                        <div key={wi} style={{
                          position: "absolute", left: leftPx, bottom: 0,
                          fontSize: 8.5, color: wpStyle.border, fontWeight: 600, whiteSpace: "nowrap",
                        }}>
                          {wp.label}
                        </div>
                      );
                    })}
                  </div>
                  {/* Ribbon */}
                  <div style={{
                    marginLeft: stream.startCol * 120,
                    width: (stream.endCol - stream.startCol + 1) * 120 - 8,
                    height: 8,
                    background: `linear-gradient(90deg, ${tint(stream.color, "30")}, ${tint(stream.color, "80")})`,
                    borderRadius: 4,
                    position: "relative",
                  }}>
                    {stream.waypoints.map((wp, wi) => {
                      const wpStyle = WAYPOINT[wp.type];
                      const leftPx = (wp.col - stream.startCol) * 120;
                      return (
                        <div key={wi} style={{ position: "absolute", left: leftPx, top: -3, transform: "translateX(-6px)" }}>
                          <div style={{
                            width: 14, height: 14, borderRadius: wp.type === "regulatory" ? 2 : "50%",
                            background: wpStyle.bg, border: `2.5px solid ${wpStyle.border}`,
                            transform: wp.type === "regulatory" ? "rotate(45deg)" : "none",
                          }} />
                        </div>
                      );
                    })}
                  </div>
                  {/* Waypoint labels BELOW ribbon (odd-indexed) */}
                  <div style={{ position: "relative", height: 16, marginTop: 2 }}>
                    {stream.waypoints.map((wp, wi) => {
                      if (wi % 2 !== 1) return null;
                      const wpStyle = WAYPOINT[wp.type];
                      const leftPx = stream.startCol * 120 + (wp.col - stream.startCol) * 120;
                      return (
                        <div key={wi} style={{
                          position: "absolute", left: leftPx, top: 0,
                          fontSize: 8.5, color: wpStyle.border, fontWeight: 600, whiteSpace: "nowrap",
                        }}>
                          {wp.label}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 14, padding: "4px 12px", borderTop: `1px solid ${BRAND.midGray}`, marginTop: 4 }}>
            {Object.entries(WAYPOINT).filter(([k]) => k !== "regulatory").map(([key, s]) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.bg, border: `2px solid ${s.border}` }} />
                <span style={{ fontSize: 9, color: BRAND.gray }}>{s.label}</span>
              </div>
            ))}
            <span style={{ fontSize: 9, color: BRAND.gray, marginLeft: 8 }}>Each version: more refined algorithms, more modalities, larger datasets.</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN ───
export default function AIResearchRoadmap() {
  const [activeTab, setActiveTab] = useState("roadmap");
  const [expanded, setExpanded] = useState({
    data: true, infra: true, team: true, product: true, aistreams: true,
  });
  const scrollRef = useRef(null);

  const toggleStream = (key) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  const tabs = [
    { key: "roadmap", label: "Roadmap" },
    { key: "strategy", label: "Strategy" },
    { key: "models", label: "Model Evolution" },
  ];

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: BRAND.white, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: BRAND.black, padding: "20px 24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, color: BRAND.gold, textTransform: "uppercase" }}>BIOS Life · AI Department</div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: BRAND.white, margin: "4px 0" }}>AI Research Roadmap — 2026 / 2027</h1>
            <div style={{ fontSize: 12, color: BRAND.midGray }}>3 reusable models · multi-modal data strategy · 2026–2027 · v1 draft May 2026</div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {[
              { label: "Data", color: STREAM_COLORS.data.bg },
              { label: "Infra", color: STREAM_COLORS.infra.bg },
              { label: "Team", color: STREAM_COLORS.team.bg },
              { label: "Product", color: STREAM_COLORS.product.bg },
            ].map((s) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color }} />
                <span style={{ fontSize: 11, color: BRAND.lightGray }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, marginTop: 16 }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                padding: "10px 20px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: activeTab === t.key ? BRAND.white : "transparent",
                color: activeTab === t.key ? BRAND.black : BRAND.midGray,
                border: "none", borderRadius: "6px 6px 0 0",
                transition: "all 0.15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "0 24px 24px" }}>
        {/* ── TAB: ROADMAP ── */}
        {activeTab === "roadmap" && (
          <div style={{ paddingTop: 16 }}>
            <div style={{ overflowX: "auto", paddingBottom: 16 }} ref={scrollRef}>
              <div style={{ minWidth: ALL_COLS.length * 120 }}>
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${ALL_COLS.length}, 120px)`, marginBottom: 8 }}>
                  {ALL_COLS.map((col, i) => (
                    <div key={i} style={{
                      fontSize: 11, fontWeight: 600, textAlign: "center", padding: "6px 0",
                      color: i < 10 ? BRAND.black : BRAND.gray,
                      borderBottom: `2px solid ${i < 10 ? BRAND.black : BRAND.midGray}`,
                      background: i === HERE_COL ? BRAND.cream : "transparent",
                    }}>
                      {col}
                      {i === HERE_COL && <div style={{ fontSize: 9, color: BRAND.gold, fontWeight: 700 }}>WE ARE HERE</div>}
                    </div>
                  ))}
                </div>

                <StreamLane items={MILESTONES.data} label="DATA" color={STREAM_COLORS.data} expanded={expanded.data} onToggle={() => toggleStream("data")} />
                <StreamLane items={MILESTONES.infra} label="PIPELINES & INFRASTRUCTURE" color={STREAM_COLORS.infra} expanded={expanded.infra} onToggle={() => toggleStream("infra")} />
                <StreamLane items={MILESTONES.team} label="TEAM & HIRES" color={STREAM_COLORS.team} expanded={expanded.team} onToggle={() => toggleStream("team")} />
                <StreamLane items={MILESTONES.product} label="PRODUCT TOUCHPOINTS" color={STREAM_COLORS.product} expanded={expanded.product} onToggle={() => toggleStream("product")} />
                <AIStreamLane expanded={expanded.aistreams} onToggle={() => toggleStream("aistreams")} />
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", padding: "12px 16px", background: BRAND.white, borderRadius: 6, border: `1px solid ${BRAND.midGray}` }}>
              {[
                { label: "In Progress", ...STATUS["in-progress"] },
                { label: "Upcoming", ...STATUS["upcoming"] },
                { label: "Not Started", ...STATUS["not-started"] },
                { label: "Future / 2027+", ...STATUS["future"] },
              ].map((s) => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.dot }} />
                  <span style={{ fontSize: 11, color: BRAND.gray }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: STRATEGY ── */}
        {activeTab === "strategy" && (
          <div style={{ paddingTop: 16, maxWidth: 900 }}>
            <p style={{ fontSize: 13, color: BRAND.gray, lineHeight: 1.6, marginBottom: 24 }}>
              The <em>why</em> and the <em>what</em>. The half-year operational layer lives in the <strong>Roadmap</strong> tab; per-model trajectories live in <strong>Model Evolution</strong>.
            </p>

            <Section title="Vision">
              We are building the operating system of cancer surveillance: an AI layer on top of existing testing and diagnosis technologies that combines them under a single statistical model to improve combined detection power, predict patient outcomes, and find optimal action plans that respect patient and provider preferences and constraints. Our hypothesis is that data-driven combination of many independent tests yields a statistically meaningful gain in detection power that no single test achieves alone.
            </Section>

            <Section title="Who we serve">
              Two populations to start, both addressable by the same underlying machinery.
              <ul style={ulStyle}>
                <li><strong>High-risk individuals who haven&rsquo;t been diagnosed yet</strong> — surface risk earlier, recommend a sequence of screening actions that maximises detection probability under patient and provider constraints, and update those recommendations as new data arrives.</li>
                <li><strong>Cancer survivors who need follow-up and recurrence monitoring</strong> — characterise recurrence risk over time using both pre-diagnosis history and tumor-informed signals, and recommend a follow-up plan that fits the individual.</li>
              </ul>
              The general-purpose systems we build accommodate any stage of the cancer journey and any cancer type. They can be selectively fine-tuned for specific cancer types, populations, or use cases when validation or regulatory approval requires it. Throughout, the work proceeds in tight collaboration with the medical team for clinical validation.
            </Section>

            <Section title="Three reusable models">
              All three exist in a first version today and evolve through 2027 along three dimensions: more refined algorithms, more modalities, and larger training datasets. All three can be commercialised independently. The digital twin uses the other two — risk scoring and the transition model — internally as building blocks.
              <ul style={ulStyle}>
                <li><strong>Digital twin (recommendation engine)</strong> — takes a patient risk profile, transition models, and a catalog of candidate tests; evaluates and compares existing protocols, and generates new policies under preferences and constraints with interpretability.</li>
                <li><strong>Dynamic / longitudinal risk scoring</strong> — long-term (&ldquo;screening&rdquo;) regime exploits genomics and demographics; short-term (&ldquo;diagnosis&rdquo; / recurrence) regime exploits EHR, proteomics, imaging, histology, immunology, cfDNA / MRD.</li>
                <li><strong>Transition / evolution</strong> — probabilistic backbone modelling cancer-stage transitions, drug response, comorbidities, mortality. Standalone artifact; world model inside the twin.</li>
              </ul>
              See the <strong>Model Evolution</strong> tab for v1 → vN trajectories per model.
            </Section>

            <Section title="Data strategy">
              Data gates model evolution. Each version unlocks when the corresponding modalities, scale, and structure come online.
              <ul style={ulStyle}>
                <li><strong>Today:</strong> Tempus EHR (100k patients pre/post Dx); literature priors built via AI-agent swarms (powering today&rsquo;s risk-scoring v1 and transition v1).</li>
                <li><strong>2026 acquisition:</strong> NashBio — 4M EHR + 200k WGS-paired. Trial begins May; live on GCP by August.</li>
                <li><strong>2027+:</strong> Imaging, histology, proteomics, immunology, cfDNA / MRD, wearables, biological age.</li>
                <li><strong>EHR clinical NLP pipeline (in-house):</strong> the lever that turns raw EHR partnerships into model-ready training data. Urgent v1 in May; long-running improvement track; shared with Product.</li>
                <li><strong>Other in-house assets:</strong> agentic literature-prior pipeline; medical-team-validated curated cohorts.</li>
              </ul>
            </Section>

            <Section title="2026 — immediate priorities">
              <ol style={olStyle}>
                <li>New genomic risk drivers from germline genome → advances <em>Risk scoring v3+ (long-term)</em>; population: undiagnosed; modality: germline genomics; timing: Q3+ post-NashBio.</li>
                <li>Improve EHR-based risk prediction → advances <em>Risk scoring v2 (diagnosis)</em>; both populations; EHR (Tempus); now.</li>
                <li>Improve recurrence models with tumor-informed signals → advances <em>Risk scoring v2 (recurrence)</em>; survivors; EHR + tumor-informed; now.</li>
                <li>Digital twin → deep RL solver → advances <em>Twin v2</em>; undiagnosed initially; risk + transition outputs; now → 2027.</li>
              </ol>
            </Section>

            <Section title="2027 — horizon">
              Imaging + histology, proteomics + immunology, cfDNA / MRD, wearables, biological-age models. Federated learning and homomorphic encryption work begins as data scale and partner deployments demand them.
            </Section>

            <Section title="Tech stack">
              <ul style={ulStyle}>
                <li><strong>Jax</strong> — high-efficiency linear algebra, automatic differentiation, hardware acceleration.</li>
                <li><strong>Reinforcement learning, POMDP formulation</strong> — for the digital twin.</li>
                <li><strong>Statistical (Cox, DeepSurv) → simple deep learning (MLPs)</strong> — first risk and recurrence model versions.</li>
                <li><strong>Longitudinal foundation models</strong> — next-event-prediction transformers in the spirit of Catch-FM, Apollo, Delphi-2M. Pre-trained on our own data; same model expected to serve risk scoring and the transition backbone.</li>
                <li><strong>Genomics foundation models</strong> — BIOS Life holds the license over the Nucleotide Transformer family, including NTv3 (AlphaGenome-level performance). Used as a starting point for WGS analysis: surfacing new driver mutations and constructing improved polygenic risk scores.</li>
                <li><strong>Agentic pipelines</strong> — used to build and maintain literature priors that power the v1 of risk scoring and the v1 of the transition model.</li>
              </ul>
              The two foundation-model families and the agentic pipelines are <strong>cross-cutting tools</strong> that feed all three models; they are not standalone research tracks.
            </Section>
          </div>
        )}

        {/* ── TAB: MODEL EVOLUTION ── */}
        {activeTab === "models" && (
          <div style={{ paddingTop: 16, maxWidth: 1100 }}>
            <p style={{ fontSize: 13, color: BRAND.gray, lineHeight: 1.6, marginBottom: 24 }}>
              Each model evolves along three axes: more refined algorithms, more modalities, larger datasets. v1 exists today; subsequent versions ship as data and capability come online.
            </p>
            {MODEL_EVOLUTION.map((m, i) => (
              <div key={i} style={{ marginBottom: 24, background: BRAND.white, borderRadius: 8, border: `1px solid ${BRAND.midGray}`, overflow: "hidden" }}>
                <div style={{ padding: "14px 16px", borderBottom: `1px solid ${BRAND.midGray}`, borderLeft: `4px solid ${m.color}`, background: BRAND.nearWhite }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: BRAND.black }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: BRAND.gray, marginTop: 2 }}>{m.domain}</div>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: BRAND.nearWhite }}>
                      <th style={thStyle}>Version</th>
                      <th style={thStyle}>Approach</th>
                      <th style={thStyle}>Data</th>
                      <th style={thStyleRight}>When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {m.rows.map((row, ri) => (
                      <tr key={ri} style={{ borderTop: `1px solid ${BRAND.lightGray}` }}>
                        <td style={{ ...tdStyle, fontWeight: 700, color: m.color, width: 110 }}>{row.ver}</td>
                        <td style={tdStyle}>{row.approach}</td>
                        <td style={tdStyle}>{row.data}</td>
                        <td style={{ ...tdStyle, color: BRAND.gray, width: 130 }}>{row.when}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

            <div style={{ marginTop: 12, padding: 16, background: BRAND.cream, borderRadius: 8, border: `1px solid ${BRAND.gold}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: BRAND.black, marginBottom: 6 }}>Convergence hypothesis</div>
              <div style={{ fontSize: 12, color: BRAND.black, lineHeight: 1.6 }}>
                The same longitudinal transformer is expected to eventually serve as both the risk-scoring backbone and the transition model the digital twin operates against — a single foundation model used twice.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── STRATEGY HELPERS ───
const ulStyle = { fontSize: 13, color: BRAND.black, lineHeight: 1.7, paddingLeft: 22, margin: "8px 0" };
const olStyle = { fontSize: 13, color: BRAND.black, lineHeight: 1.7, paddingLeft: 22, margin: "8px 0" };
const thStyle = { fontSize: 11, fontWeight: 700, color: BRAND.black, textAlign: "left", padding: "10px 14px", borderBottom: `1px solid ${BRAND.midGray}` };
const thStyleRight = { ...thStyle, textAlign: "left" };
const tdStyle = { fontSize: 12, color: BRAND.black, padding: "10px 14px", lineHeight: 1.5, verticalAlign: "top" };

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: BRAND.black, marginBottom: 8, paddingBottom: 6, borderBottom: `2px solid ${BRAND.gold}` }}>{title}</h2>
      <div style={{ fontSize: 13, color: BRAND.black, lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

// Brand palette — see PROJECT_CONTEXT.md § Brand Colors.
// All colors used in the app must come from here.
export const BRAND = {
  black: "#000000",
  white: "#FFFFFF",
  cream: "#FEE5C5",
  lightGold: "#FFD4A0",
  gold: "#F7C07D",
  amber: "#FFA14F",
  sienna: "#A76941",
  rust: "#903516",
  nearWhite: "#F6F6F6",
  lightGray: "#EDEDED",
  midGray: "#D9D9D9",
  gray: "#9C9C9C",
  patina: "#6A9A8B",
  deepSea: "#4B7178",
};

// Lane → brand color. The brand spec was written for a different set of
// lanes (Survivorship/Screening/Enterprise/AI); the lane names below are
// the current app's, mapped onto the brand palette so AI keeps its spec
// color and the rest are visually distinct.
export const LANE_COLOR = {
  data: BRAND.deepSea,
  infra: BRAND.sienna,
  team: BRAND.gold,
  product: BRAND.rust,
  ai: BRAND.patina,
};

// AI sub-model colors (within the AI lane). Distinguishable, all in-palette.
export const AI_MODEL_COLOR = {
  riskScreening: BRAND.patina,
  riskRecurrence: BRAND.deepSea,
  digitalTwin: BRAND.sienna,
  transition: BRAND.rust,
};

// Item-status colors. Per spec: Cream = in-progress, Light Gold = upcoming,
// Near White = not-started, Light Gray = future. Borders/dots use Gold/Amber/Gray.
export const STATUS = {
  "in-progress": { bg: BRAND.cream,     border: BRAND.gold,    dot: BRAND.gold },
  "upcoming":    { bg: BRAND.lightGold, border: BRAND.amber,   dot: BRAND.amber },
  "not-started": { bg: BRAND.nearWhite, border: BRAND.midGray, dot: BRAND.gray },
  "future":      { bg: BRAND.lightGray, border: BRAND.midGray, dot: BRAND.midGray },
};

// AI-ribbon waypoint styles. `bg` is a soft tint of the accent.
export const WAYPOINT = {
  rules:       { bg: BRAND.cream,        border: BRAND.gold,   icon: "◆", label: "v1 / baseline" },
  shadow:      { bg: BRAND.lightGold,    border: BRAND.amber,  icon: "◐", label: "Shadow / eval" },
  integration: { bg: `${BRAND.patina}1F`, border: BRAND.patina, icon: "▲", label: "Version release" },
  regulatory:  { bg: `${BRAND.rust}1F`,   border: BRAND.rust,   icon: "★", label: "Regulatory" },
};

// Helper: a soft tint of a brand color for lane-interior backgrounds.
export const tint = (hex, alpha = "15") => `${hex}${alpha}`;

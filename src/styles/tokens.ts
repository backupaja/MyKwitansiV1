/**
 * Design tokens — single source of truth for every colour, radius,
 * shadow, spacing, and transition used across the application.
 *
 * Import `tokens` in components instead of scattering raw hex values.
 */

export const tokens = {
  color: {
    brand:       "#7b1113",
    brandDark:   "#5e0c0e",
    brandSoft:   "#fef2f2",
    sidebar:     "#140b0b",
    sidebarItem: "rgba(255,255,255,0.55)",
    sidebarHover:"rgba(255,255,255,0.08)",
    sidebarFade: "rgba(255,255,255,0.07)",
    success:     "#16a34a",
    textPrimary: "#111827",
    textSecondary:"#6b7280",
    textMuted:   "#9ca3af",
    border:      "#f3f4f6", // gray-100 — card borders
    borderInput: "#e5e7eb", // gray-200 — input borders
    surface:     "#ffffff",
    pageBg:      "#f8f7f6",
  },
  radius: {
    sm:  "6px",
    md:  "8px",   // rounded-lg  — buttons, inputs, table controls
    lg:  "12px",  // rounded-xl  — toasts
    xl:  "16px",  // rounded-2xl — cards, modals, sidebar brand mark
  },
  shadow: {
    card:   "0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.05)",
    modal:  "0 20px 60px -10px rgba(0,0,0,0.3)",
    btn:    "0 1px 2px 0 rgba(0,0,0,0.06)",
    toast:  "0 4px 16px 0 rgba(0,0,0,0.12)",
  },
  transition: {
    fast:   "0.1s ease",
    normal: "0.15s ease",
    slow:   "0.2s ease",
  },
  font: {
    family: "'Inter', system-ui, sans-serif",
    sizeXs: "0.75rem",   // 12px — labels, meta
    sizeSm: "0.875rem",  // 14px — body, table rows, inputs
    sizeMd: "1rem",      // 16px — modal titles
    sizeLg: "1.25rem",   // 20px — page titles
    weightNormal:  "400",
    weightMedium:  "500",
    weightSemibold:"600",
    weightBold:    "700",
    weightBlack:   "800",
  },
} as const;

export type Tokens = typeof tokens;

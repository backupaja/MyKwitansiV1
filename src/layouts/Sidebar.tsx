import { tokens } from "../styles/tokens";
import { Ico } from "../utils/icons";
import type { Page } from "../App";

const { color } = tokens;

const NAV_ITEMS: { page: Page; label: string; icon: (c?: string) => JSX.Element }[] = [
  { page: "dashboard", label: "Dashboard",      icon: Ico.monitor },
  { page: "transaksi", label: "Data Transaksi", icon: Ico.folder  },
  { page: "kwitansi",  label: "Print Kwitansi", icon: Ico.receipt },
  { page: "nota",      label: "Nota",           icon: Ico.note    },
];

interface SidebarProps {
  currentPage: Page;
  adminName: string;
  onNavigate: (page: Page) => void;
}

export function Sidebar({ currentPage, adminName, onNavigate }: SidebarProps) {
  const initials = adminName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside
      className="flex flex-col h-screen sticky top-0 overflow-y-auto flex-shrink-0"
      style={{ width: 220, background: color.sidebar }}
    >
      {/* Brand mark */}
      <div className="px-5 py-5 border-b" style={{ borderColor: color.sidebarFade }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-black flex-shrink-0"
            style={{ background: color.brand }}
          >
            M
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-bold leading-tight">MyKwitansi</p>
            <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.35)" }}>
              Finance System
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p
          className="text-xs font-semibold px-3 mb-2"
          style={{ color: "rgba(255,255,255,0.28)", letterSpacing: "0.1em" }}
        >
          MENU
        </p>
        {NAV_ITEMS.map(({ page, label, icon }) => {
          const active = currentPage === page;
          return (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className="sidebar-link w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-left"
              style={{
                background: active ? color.brand : "transparent",
                color: active ? "white" : color.sidebarItem,
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = color.sidebarHover;
                  e.currentTarget.style.color = "rgba(255,255,255,0.9)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = color.sidebarItem;
                }
              }}
            >
              {icon()}
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logged-in user */}
      <div className="px-3 py-4 border-t" style={{ borderColor: color.sidebarFade }}>
        <div className="flex items-center gap-3 px-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: color.brand }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">{adminName}</p>
            <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.35)" }}>
              Administrator
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

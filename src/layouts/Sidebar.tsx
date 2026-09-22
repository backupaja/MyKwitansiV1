/**
 * Sidebar — main navigation panel.
 *
 * Active route detection: useLocation().pathname matched against
 * each nav item path.
 * Navigation: useNavigate() — replaces the old onNavigate prop.
 * Admin name/initials: useAuth() — replaces the old adminName prop.
 */
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { tokens } from "../styles/tokens";
import { Ico } from "../utils/icons";
import { useAuth } from "../contexts/AuthContext";

const { color } = tokens;

const NAV_ITEMS: { path: string; label: string; icon: (c?: string) => React.JSX.Element }[] = [
  { path: "/dashboard", label: "Dashboard",      icon: Ico.monitor },
  { path: "/transaksi", label: "Data Transaksi", icon: Ico.folder  },
  { path: "/kwitansi",  label: "Print Kwitansi", icon: Ico.receipt },
  { path: "/nota",      label: "Nota",           icon: Ico.note    },
  { path: "/trash",     label: "Riwayat Hapus",  icon: Ico.trash   },
];

export function Sidebar() {
  const navigate          = useNavigate();
  const { pathname }      = useLocation();
  const { currentAdmin }  = useAuth();

  const adminName = currentAdmin?.username ?? "";
  const initials  = adminName
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
      <div className="px-4 py-4 border-b flex items-center" style={{ borderColor: color.sidebarFade, height: 80 }}>
        <img 
          src="/logo-horizontal.png" 
          alt="MyKwitansi" 
          className="h-12 w-auto object-contain" 
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p
          className="text-xs font-semibold px-3 mb-2"
          style={{ color: "rgba(255,255,255,0.28)", letterSpacing: "0.1em" }}
        >
          MENU
        </p>
        {NAV_ITEMS.map(({ path, label, icon }) => {
          const active = pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
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

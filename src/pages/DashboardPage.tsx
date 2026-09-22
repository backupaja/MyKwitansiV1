/**
 * DashboardPage — protected route (/dashboard).
 *
 * Admin greeting: reads currentAdmin from AuthContext.
 * Card navigation: useNavigate() — replaces the old onNavigate prop.
 * Visual design unchanged from the Figma-approved layout.
 */
import React from "react";
import { useNavigate } from "react-router-dom";
import { tokens } from "../styles/tokens";
import { Ico } from "../utils/icons";
import { PageHeader } from "../components/ui";
import { TODAY_LABEL } from "../utils/formatters";
import { useAuth } from "../contexts/AuthContext";

const { color } = tokens;

const MENU_CARDS: {
  path: string;
  label: string;
  desc: string;
  icon: (c?: string) => React.JSX.Element;
  accent: string;
  bg: string;
}[] = [
  { path: "/transaksi", label: "Data Transaksi", desc: "Lihat & kelola semua transaksi",  icon: Ico.folder,  accent: color.brand, bg: color.brandSoft },
  { path: "/kwitansi",  label: "Print Kwitansi", desc: "Cetak kwitansi pembayaran",        icon: Ico.receipt, accent: "#b45309",   bg: "#fffbeb"       },
  { path: "/nota",      label: "Nota",           desc: "Kelola data nota barang",          icon: Ico.note,    accent: "#0369a1",   bg: "#eff6ff"       },
];

export function DashboardPage() {
  const { currentAdmin } = useAuth();
  const navigate         = useNavigate();
  const adminName        = currentAdmin?.username ?? "";

  return (
    <div>
      <PageHeader
        title={`Selamat datang, ${adminName} 👋`}
        subtitle={TODAY_LABEL}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {MENU_CARDS.map((c) => (
          <button
            key={c.path}
            onClick={() => navigate(c.path)}
            className="group bg-white rounded-2xl border border-gray-100 shadow-sm
              hover:shadow-md transition-all text-left p-5 active:scale-[0.99]"
          >
            {/* Icon chip */}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-4
                transition-transform group-hover:scale-110"
              style={{ background: c.bg, color: c.accent }}
            >
              {c.icon("w-5 h-5")}
            </div>
            <p className="font-bold text-gray-900 text-sm mb-0.5">{c.label}</p>
            <p className="text-xs text-gray-400">{c.desc}</p>
            <div
              className="flex items-center gap-1 mt-3 text-xs font-semibold"
              style={{ color: c.accent }}
            >
              Buka
              <span className="transition-transform group-hover:translate-x-0.5">
                {Ico.arrow("w-3.5 h-3.5")}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

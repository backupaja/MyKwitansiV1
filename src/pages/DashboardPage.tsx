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
    { path: "/transaksi", label: "Data Transaksi", desc: "Lihat & kelola semua transaksi", icon: Ico.folder, accent: color.brand, bg: color.brandSoft },
    { path: "/kwitansi", label: "Print Kwitansi", desc: "Cetak kwitansi pembayaran", icon: Ico.receipt, accent: "#b45309", bg: "#fffbeb" },
    { path: "/nota", label: "Nota", desc: "Kelola data nota barang", icon: Ico.note, accent: "#0369a1", bg: "#eff6ff" },
  ];

export function DashboardPage() {
  const { currentAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      {/* Clean Animated Welcome Banner with a noticeable soft red animated gradient */}
      <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-100 via-red-50 to-white border border-red-200 shadow-sm p-8 pb-10 animate-gradient">
        <div className="relative z-10 text-center flex flex-col items-center">

          {/* Animated Printer */}
          <div className="flex justify-center mb-4 animate-fade-in-up">
            <div className="relative w-20 h-24 flex flex-col items-center justify-end">

              {/* Paper Container (with overflow hidden to hide paper before it prints) */}
              <div className="absolute bottom-10 w-12 h-14 overflow-hidden z-10 flex justify-center">
                {/* The Paper itself moving UP */}
                <div className="w-10 bg-white shadow-sm border border-gray-200 flex flex-col items-center p-1 animate-print rounded-t-sm"
                  style={{ height: "40px" }}>
                  <div className="w-6 h-[1.5px] bg-gray-300 mb-1.5 mt-1"></div>
                  <div className="w-8 h-[1.5px] bg-gray-300 mb-1.5"></div>
                  <div className="w-5 h-[1.5px] bg-gray-300 mb-1.5"></div>
                  <div className="w-6 h-1.5 bg-brand rounded-sm"></div>
                </div>
              </div>

              {/* Printer Body (In front of the paper's bottom edge) */}
              <div className="relative w-16 h-10 bg-gray-800 rounded-xl shadow-lg z-20 flex flex-col items-center border-t-4 border-gray-900">
                {/* Paper Slot */}
                <div className="w-12 h-1 bg-black absolute top-0 rounded-b-md opacity-80"></div>
                {/* Status LED */}
                <div className="absolute top-4 left-3 w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
              </div>

            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2 animate-fade-in-up animation-delay-200">
            Selamat datang di MyKwitansi <span className="animate-wave inline-block origin-bottom-right">👋</span>
          </h2>
          <p className="text-gray-500 animate-fade-in-up animation-delay-400">
            {TODAY_LABEL} • Siap untuk mengelola transaksi hari ini?
          </p>
        </div>

        {/* Subtle decorative background */}
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-96 h-32 bg-brand/5 blur-3xl rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {MENU_CARDS.map((c, i) => (
          <button
            key={c.path}
            onClick={() => navigate(c.path)}
            className={`group bg-white rounded-2xl border border-gray-100 shadow-sm
              hover:shadow-md hover:-translate-y-1 transition-all text-left p-5 active:scale-[0.99]
              animate-fade-in-up`}
            style={{ animationDelay: `${500 + i * 150}ms`, animationFillMode: "both" }}
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

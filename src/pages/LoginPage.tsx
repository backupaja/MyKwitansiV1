import { useState } from "react";
import { tokens } from "../styles/tokens";
import { Ico } from "../utils/icons";
import { PrimaryBtn } from "../components/ui";
import { adminService } from "../services";
import type { Admin } from "../types";

const { color } = tokens;

interface LoginPageProps {
  onLogin: (admin: Admin) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit() {
    if (loading) return;
    setLoading(true);
    const admin = await adminService.login(username, password);
    setLoading(false);
    if (admin) onLogin(admin);
  }

  return (
    <div className="min-h-screen flex" style={{ background: color.pageBg }}>
      {/* Brand panel — visible on lg+ */}
      <div
        className="hidden lg:flex flex-col justify-between w-2/5 p-10"
        style={{ background: color.sidebar }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black"
            style={{ background: color.brand }}
          >M</div>
          <p className="text-white font-bold text-lg">MyKwitansi</p>
        </div>
        <div>
          <h2 className="text-white text-3xl font-bold leading-snug mb-3">
            Kelola keuangan<br />lebih mudah &amp; cepat.
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
            Sistem pencatatan transaksi, kwitansi, dan nota<br />
            untuk kebutuhan administrasi harian.
          </p>
        </div>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>© 2025 MyKwitansi</p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile brand mark */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm"
              style={{ background: color.brand }}
            >M</div>
            <p className="font-bold text-gray-900">MyKwitansi</p>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Selamat datang!</h1>
          <p className="text-sm text-gray-500 mb-7">Masuk ke akun Anda untuk melanjutkan.</p>

          {/* Username */}
          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                {Ico.user()}
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Masukkan username"
                className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm bg-white text-gray-800"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                {Ico.lock()}
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Masukkan password"
                className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm bg-white text-gray-800"
              />
            </div>
          </div>

          <PrimaryBtn onClick={handleSubmit} disabled={loading} className="w-full justify-center">
            {loading ? "Memuat…" : "Masuk ke Sistem"} {!loading && Ico.arrow()}
          </PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

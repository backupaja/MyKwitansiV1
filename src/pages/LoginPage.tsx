/**
 * LoginPage — public route (/login).
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { tokens } from "../styles/tokens";
import { Ico } from "../utils/icons";
import { useAuth } from "../contexts/AuthContext";

const { color } = tokens;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function clearError() { if (error) setError(""); }

  async function handleSubmit() {
    if (loading) return;
    if (!username.trim()) { setError("Username wajib diisi."); return; }
    if (!password.trim()) { setError("Password wajib diisi."); return; }
    setLoading(true);
    const admin = await login(username.trim(), password);
    setLoading(false);
    if (!admin) { setError("Username atau password salah."); return; }
    navigate("/dashboard", { replace: true });
  }

  return (
    <div className="min-h-screen flex">
      {/* ─── Left brand panel ─────────────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col items-center justify-center relative overflow-hidden"
        style={{
          width: "42%",
          flexShrink: 0,
          /* Use the app's own dark maroon tones — not bright red */
          background: `linear-gradient(160deg, #2a0c0e 0%, ${color.sidebar} 55%, #1f0a0b 100%)`,
        }}
      >
        {/* Subtle blob accents using brand color, very low opacity */}
        <div
          className="absolute rounded-full pointer-events-none animate-float"
          style={{
            width: 380, height: 380,
            background: `radial-gradient(circle, ${color.brand} 0%, transparent 70%)`,
            opacity: 0.18,
            top: -120, left: -100,
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none animate-float-delayed"
          style={{
            width: 280, height: 280,
            background: `radial-gradient(circle, ${color.brand} 0%, transparent 70%)`,
            opacity: 0.12,
            bottom: -80, right: -80,
          }}
        />
        {/* Dot pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            opacity: 0.6,
          }}
        />

        {/* Abstract Decorative Blobs */}
        <div
          className="absolute rounded-full pointer-events-none animate-blob"
          style={{
            width: 400, height: 400,
            background: `radial-gradient(circle, #fca5a5 0%, transparent 60%)`,
            opacity: 0.15,
            top: "-10%", left: "-20%",
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none animate-blob animation-delay-2000"
          style={{
            width: 300, height: 300,
            background: `radial-gradient(circle, #fcd34d 0%, transparent 60%)`,
            opacity: 0.1,
            bottom: "5%", right: "-10%",
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none animate-blob animation-delay-4000"
          style={{
            width: 250, height: 250,
            background: `radial-gradient(circle, #fb7185 0%, transparent 60%)`,
            opacity: 0.12,
            top: "40%", right: "15%",
            animationDuration: '10s'
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none animate-blob"
          style={{
            width: 350, height: 350,
            background: `radial-gradient(circle, #ef4444 0%, transparent 60%)`,
            opacity: 0.1,
            bottom: "20%", left: "5%",
            animationDuration: '12s'
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          <img
            src="/logo-vertical.png"
            alt="MyKwitansi"
            className="hover:scale-110 hover:-translate-y-2 transition-all duration-500 cursor-pointer"
            style={{
              width: 220,
              filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.5))",
            }}
          />
        </div>

        <p
          className="absolute bottom-8 text-xs z-10"
          style={{ color: "rgba(255,255,255,0.2)" }}
        >
          © {new Date().getFullYear()} MyKwitansi
        </p>
      </div>

      {/* ─── Right form panel ─────────────────────────────────────────── */}
      <div
        className="flex-1 flex items-center justify-center px-8 py-10 relative overflow-hidden"
        style={{ background: "#f8f7f6" }}
      >
        {/* Subtle top-right accent blob */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 320, height: 320,
            borderRadius: "50%",
            background: "radial-gradient(circle, #fee2e2 0%, transparent 65%)",
            opacity: 0.6,
            top: -100, right: -100,
          }}
        />

        {/* Mobile logo */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 lg:hidden">
          <img src="/src/assets/logo-vertical.png" alt="MyKwitansi" className="h-16 w-auto" />
        </div>

        {/* Form card */}
        <div
          className="relative z-10 w-full animate-fade-in-up opacity-0 transition-shadow duration-500 hover:shadow-2xl"
          style={{
            maxWidth: 360,
            background: "#fff",
            borderRadius: 20,
            padding: "36px 32px",
            boxShadow: "0 4px 32px -4px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <div className="flex justify-center mb-8">
            <img src="/logo-horizontal.png" alt="MyKwitansi" className="h-12 w-auto" />
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-2.5 rounded-xl px-4 py-3 mb-5 text-sm font-medium"
              style={{ background: "#fff1f2", color: color.brand, border: "1px solid #fecdd3" }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              {error}
            </div>
          )}

          {/* Username */}
          <div className="mb-4">
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#9ca3af" }}>
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#d1d5db" }}>
                {Ico.user("w-4 h-4")}
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); clearError(); }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Masukkan username"
                className="w-full outline-none text-sm transition-all duration-150"
                style={{
                  borderRadius: 10,
                  border: "1.5px solid #e5e7eb",
                  padding: "11px 14px 11px 38px",
                  color: "#111827",
                  background: "#fafafa",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = `1.5px solid ${color.brand}`;
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.boxShadow = `0 0 0 3px rgba(123,17,19,0.07)`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = "1.5px solid #e5e7eb";
                  e.currentTarget.style.background = "#fafafa";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-5">
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#9ca3af" }}>
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#d1d5db" }}>
                {Ico.lock("w-4 h-4")}
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError(); }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Masukkan password"
                className="w-full outline-none text-sm transition-all duration-150"
                style={{
                  borderRadius: 10,
                  border: "1.5px solid #e5e7eb",
                  padding: "11px 42px 11px 38px",
                  color: "#111827",
                  background: "#fafafa",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = `1.5px solid ${color.brand}`;
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.boxShadow = `0 0 0 3px rgba(123,17,19,0.07)`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = "1.5px solid #e5e7eb";
                  e.currentTarget.style.background = "#fafafa";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-150"
                style={{ color: "#d1d5db" }}
                onMouseEnter={(e) => e.currentTarget.style.color = color.brand}
                onMouseLeave={(e) => e.currentTarget.style.color = "#d1d5db"}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center mb-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: color.brand, width: 14, height: 14, borderRadius: 4 }}
              />
              <span className="text-sm" style={{ color: "#6b7280" }}>Ingat saya</span>
            </label>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 text-sm font-bold text-white transition-all duration-200"
            style={{
              borderRadius: 11,
              padding: "13px 20px",
              background: loading ? "#9a1517" : color.brand,
              boxShadow: loading ? "none" : `0 4px 16px -4px rgba(123,17,19,0.4)`,
              opacity: loading ? 0.8 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = color.brandDark;
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 8px 20px -4px rgba(123,17,19,0.45)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = color.brand;
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 16px -4px rgba(123,17,19,0.4)";
              }
            }}
            onMouseDown={(e) => { if (!loading) e.currentTarget.style.transform = "translateY(0) scale(0.985)"; }}
            onMouseUp={(e) => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Memuat…
              </>
            ) : (
              <>
                Masuk ke Sistem
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

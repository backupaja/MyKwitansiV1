import { useState } from "react";
import { AppLayout } from "./layouts/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { TransaksiPage } from "./pages/TransaksiPage";
import { KwitansiPage } from "./pages/KwitansiPage";
import { NotaPage } from "./pages/NotaPage";
import { adminService } from "./services";
import type { Admin } from "./types";

export type Page = "login" | "dashboard" | "transaksi" | "kwitansi" | "nota";

export default function App() {
  const [page,  setPage]  = useState<Page>("login");
  const [toast, setToast] = useState("");
  const [admin, setAdmin] = useState<Admin | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  function handleLogin(a: Admin) {
    setAdmin(a);
    setPage("dashboard");
  }

  async function handleLogout() {
    await adminService.logout();
    setAdmin(null);
    setPage("login");
  }

  if (!admin || page === "login") {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <AppLayout
      currentPage={page}
      onNavigate={setPage}
      onLogout={handleLogout}
      adminName={admin.username}
      toast={toast}
    >
      {page === "dashboard" && (
        <DashboardPage adminName={admin.username} onNavigate={setPage} />
      )}
      {page === "transaksi" && (
        <TransaksiPage adminId={admin.id_admin} adminName={admin.username} onToast={showToast} />
      )}
      {page === "kwitansi" && (
        <KwitansiPage adminId={admin.id_admin} />
      )}
      {page === "nota" && (
        <NotaPage adminId={admin.id_admin} onToast={showToast} />
      )}
    </AppLayout>
  );
}

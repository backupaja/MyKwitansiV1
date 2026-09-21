import { Sidebar } from "./Sidebar";
import { Header }  from "./Header";
import { Toast }   from "../components/ui";
import type { Page } from "../App";

interface AppLayoutProps {
  currentPage: Page;
  adminName: string;
  toast: string;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export function AppLayout({
  currentPage, adminName, toast, onNavigate, onLogout, children,
}: AppLayoutProps) {
  return (
    <div className="flex min-h-screen" style={{ background: "#f8f7f6" }}>
      <Sidebar currentPage={currentPage} adminName={adminName} onNavigate={onNavigate} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Toast message={toast} />
        <Header onLogout={onLogout} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

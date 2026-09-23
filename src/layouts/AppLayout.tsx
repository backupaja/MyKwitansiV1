/**
 * AppLayout — authenticated page shell.
 *
 * Composes Sidebar + Header + Toast + main content area.
 * Auth state (adminName, logout) is consumed from AuthContext
 * inside Sidebar and Header — not passed as props.
 */
import { Sidebar } from "./Sidebar";
import { Header }  from "./Header";
import { BottomNav } from "./BottomNav";
import { Toast }   from "../components/ui";

interface AppLayoutProps {
  /** Toast message forwarded from App-level state. */
  toast: string;
  children: React.ReactNode;
}

export function AppLayout({ toast, children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen" style={{ background: "#f8f7f6" }}>
      {/* Sidebar visible only on md screens and up */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Toast message={toast} />
        <Header />
        {/* pb-20 on mobile to avoid content being hidden behind bottom nav */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-auto">{children}</main>
      </div>

      {/* Bottom navigation visible only on mobile */}
      <BottomNav />
    </div>
  );
}

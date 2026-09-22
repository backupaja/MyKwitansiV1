/**
 * AppLayout — authenticated page shell.
 *
 * Composes Sidebar + Header + Toast + main content area.
 * Auth state (adminName, logout) is consumed from AuthContext
 * inside Sidebar and Header — not passed as props.
 */
import { Sidebar } from "./Sidebar";
import { Header }  from "./Header";
import { Toast }   from "../components/ui";

interface AppLayoutProps {
  /** Toast message forwarded from App-level state. */
  toast: string;
  children: React.ReactNode;
}

export function AppLayout({ toast, children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen" style={{ background: "#f8f7f6" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Toast message={toast} />
        <Header />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

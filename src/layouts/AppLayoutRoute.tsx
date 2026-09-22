/**
 * AppLayoutRoute — route-level wrapper for the authenticated shell.
 *
 * Renders AppLayout with <Outlet /> so nested routes appear as the
 * main content. Sits inside <ProtectedRoute> in the router tree.
 */
import { Outlet } from "react-router-dom";
import { AppLayout } from "./AppLayout";

interface AppLayoutRouteProps {
  /** Toast message forwarded from App-level state. */
  toast: string;
}

export function AppLayoutRoute({ toast }: AppLayoutRouteProps) {
  return (
    <AppLayout toast={toast}>
      <Outlet />
    </AppLayout>
  );
}

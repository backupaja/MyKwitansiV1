/**
 * Header — top bar with notification bell and logout button.
 *
 * Logout action: calls AuthContext.logout() then navigates to /login.
 * Replaces the old onLogout prop.
 */
import { useNavigate } from "react-router-dom";
import { tokens } from "../styles/tokens";
import { Ico } from "../utils/icons";
import { OutlineBtn } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";

const { color } = tokens;

export function Header() {
  const { logout }  = useAuth();
  const navigate    = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="h-[72px] flex items-center justify-end px-6 gap-3 bg-white border-b border-gray-100 flex-shrink-0">
      {/* Notification bell */}
      <button
        className="relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-400
          hover:text-gray-700 hover:bg-gray-100 transition-colors"
        aria-label="Notifikasi"
      >
        {Ico.bell()}
        <span
          className="absolute top-2 right-2 w-2 h-2 rounded-full border-2 border-white"
          style={{ background: color.brand }}
        />
      </button>

      {/* Logout — matches OutlineBtn spec */}
      <OutlineBtn onClick={handleLogout} className="py-1.5 px-3">
        {Ico.logout()} Keluar
      </OutlineBtn>
    </header>
  );
}

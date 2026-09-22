/**
 * AdminService — authentication and session management.
 *
 * SERVICE CONTRACT:
 *   login(username, password)  → Admin | null
 *   logout()                   → void
 *   getCurrentAdmin()          → Admin | null
 *   getAdminById(id)           → Admin | undefined
 *
 * DATABASE MAPPING (final schema):
 *   admin: id_admin, username, password (hash), jabatan
 *
 * MOCK PHASE:
 *   Credentials are plaintext in MOCK_PASSWORDS. Replace with:
 *     - Supabase Auth (web)
 *     - Tauri invoke("authenticate") + bcrypt verify (desktop)
 */
import type { Admin } from "../types";

export interface AdminService {
  login(username: string, password: string): Promise<Admin | null>;
  logout(): Promise<void>;
  getCurrentAdmin(): Admin | null;
  /** Look up an admin by primary key — used by AuthContext to restore session. */
  getAdminById(id: number): Admin | undefined;
  /** Look up an admin by Supabase Auth ID. */
  getAdminByAuthId?(authId: string): Promise<Admin | undefined>;
}

// ── Stub implementation (mock, no real auth) ──────────────────────────────

// id_admin is int(11) per ERD → number
// password field is intentionally absent from these records —
// the Admin type doc states it is "never returned to the client after login".
const MOCK_ADMINS: Admin[] = [
  { id_admin: 1, jabatan: "bang_karir", username: "Bang Karir" },
  { id_admin: 2, jabatan: "bang_tensi", username: "Bang Tensi" },
];

/**
 * Mock password table — keyed by id_admin.
 *
 * ⚠ DEV ONLY. These are plaintext placeholders.
 * In production, passwords are stored as bcrypt hashes and
 * compared server-side (Supabase) or via a Rust Tauri command.
 *
 * Mock credentials:
 *   username: "Bang Karir"  password: "admin"
 *   username: "Bang Tensi"  password: "admin"
 */
const MOCK_PASSWORDS: Record<number, string> = {
  1: "admin",
  2: "admin",
};

let _currentAdmin: Admin | null = null;

export const adminService: AdminService = {
  async login(username, password) {
    // Step 1: find by username (case-insensitive)
    const found = MOCK_ADMINS.find(
      (a) => a.username.toLowerCase() === username.toLowerCase()
    );

    // Step 2: return null if username unknown or password does not match.
    // The ?? MOCK_ADMINS[0] fallback has been removed — a failed lookup
    // must produce null, not a silent default admin.
    if (!found || MOCK_PASSWORDS[found.id_admin] !== password) {
      return null;
    }

    _currentAdmin = found;
    return found;
  },
  async logout() {
    _currentAdmin = null;
  },
  getCurrentAdmin() {
    return _currentAdmin;
  },
  getAdminById(id: number) {
    return MOCK_ADMINS.find((a) => a.id_admin === id);
  },
};

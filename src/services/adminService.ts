/**
 * AdminService — authentication and session management.
 *
 * This is a stub interface. Replace the mock implementation with
 * Supabase auth (web) or a Tauri command calling SQLite (desktop).
 */
import type { Admin } from "../types";

export interface AdminService {
  login(username: string, password: string): Promise<Admin | null>;
  logout(): Promise<void>;
  getCurrentAdmin(): Admin | null;
}

// ── Stub implementation (mock, no real auth) ──────────────────────────────

// id_admin is int(11) per ERD → number
const MOCK_ADMINS: Admin[] = [
  { id_admin: 1, jabatan: "bang_karir", username: "Bang Karir" },
  { id_admin: 2, jabatan: "bang_tensi", username: "Bang Tensi" },
];

let _currentAdmin: Admin | null = null;

export const adminService: AdminService = {
  async login(username) {
    const found = MOCK_ADMINS.find(
      (a) => a.username.toLowerCase() === username.toLowerCase()
    ) ?? MOCK_ADMINS[0];
    _currentAdmin = found;
    return found;
  },
  async logout() {
    _currentAdmin = null;
  },
  getCurrentAdmin() {
    return _currentAdmin;
  },
};

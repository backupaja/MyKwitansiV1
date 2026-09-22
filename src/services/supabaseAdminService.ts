import type { Admin } from "../types";
import type { AdminService } from "./adminService";
import { supabase } from "../lib/supabase";

let _currentAdmin: Admin | null = null;

export const supabaseAdminService: AdminService = {
  // Login now delegates to Supabase Auth entirely in AuthContext.
  // This method remains to fulfill the interface for backwards compatibility,
  // but it's largely bypassed by AuthContext.login().
  async login(username: string, password: string) {
    console.warn("supabaseAdminService.login called directly. AuthContext should handle this.");
    return null;
  },

  async logout() {
    _currentAdmin = null;
  },

  getCurrentAdmin() {
    return _currentAdmin;
  },

  getAdminById(id: number) {
    if (_currentAdmin && _currentAdmin.id_admin === id) {
      return _currentAdmin;
    }
    return undefined;
  },

  async getAdminByAuthId(authId: string) {
    const { data, error } = await supabase
      .from("admin")
      .select("*")
      .eq("auth_id", authId)
      .single();

    if (error || !data) {
      console.error("[Supabase AdminService] Failed to fetch admin profile by auth_id:", error?.message);
      return undefined;
    }

    delete data.password; // Do not expose
    _currentAdmin = data as Admin;
    return _currentAdmin;
  }
};

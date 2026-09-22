import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { adminService } from "../services";
import type { Admin } from "../types";

export interface AuthContextValue {
  /** Logged-in admin record, or null when unauthenticated. */
  currentAdmin: Admin | null;
  /** Derived convenience flag. */
  isAuthenticated: boolean;
  /** Calls Supabase auth login and stores the result. */
  login(username: string, password: string): Promise<Admin | null>;
  /** Calls Supabase auth logout and clears currentAdmin. */
  logout(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from Supabase Auth
  useEffect(() => {
    // 1. Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchAdminProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 2. Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          await fetchAdminProfile(session.user.id);
        } else {
          setCurrentAdmin(null);
          setLoading(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function fetchAdminProfile(authId: string) {
    try {
      // In Supabase mock mode, this will call supabaseAdminService internally
      // if VITE_USE_MOCK is false, but we can't be sure the mock supports authId yet.
      // Since this phase focuses on the Supabase integration, we'll directly query
      // or use a new method on adminService. But for now, we'll rely on the existing
      // adminService.getAdminByAuthId which we will implement.
      
      const admin = await adminService.getAdminByAuthId?.(authId) ?? null;
      setCurrentAdmin(admin);
    } catch (e) {
      console.error("Failed to fetch admin profile:", e);
      setCurrentAdmin(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(username: string, password: string): Promise<Admin | null> {
    try {
      // 1. Resolve the email for this username using the public RPC
      // This is safe because the RPC is SECURITY DEFINER and only returns the email if the username exists.
      const { data: email, error: resolveErr } = await supabase.rpc('resolve_login_email', { p_username: username.trim() });
      
      if (resolveErr || !email) {
        // Fallback for mock if configured
        if (import.meta.env.VITE_USE_MOCK === "true") {
           const mockAdmin = await adminService.login(username, password);
           setCurrentAdmin(mockAdmin);
           return mockAdmin;
        }
        console.warn("[AuthContext] Username not found or email unresolvable.");
        return null; // Return null per AdminService contract instead of throwing
      }

      // 2. Perform Supabase Auth login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.session) {
        console.error("[AuthContext] Supabase login failed:", error?.message);
        return null;
      }

      // 3. fetchAdminProfile will be triggered by onAuthStateChange, but we want to return it immediately
      const admin = await adminService.getAdminByAuthId?.(data.session.user.id);
      if (!admin) {
         console.error("[AuthContext] Missing admin profile for this auth_id");
         // Important: Sign out if they don't have an admin profile!
         await supabase.auth.signOut();
         return null;
      }
      
      setCurrentAdmin(admin);
      return admin;
    } catch (err) {
      console.error("[AuthContext] Unexpected login error:", err);
      return null;
    }
  }

  async function logout(): Promise<void> {
    await supabase.auth.signOut();
    if (import.meta.env.VITE_USE_MOCK === "true") {
      await adminService.logout();
    }
    setCurrentAdmin(null);
  }

  if (loading) {
     return null; // Or a loading spinner
  }

  return (
    <AuthContext.Provider
      value={{
        currentAdmin,
        isAuthenticated: currentAdmin !== null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be called inside <AuthProvider>");
  return ctx;
}

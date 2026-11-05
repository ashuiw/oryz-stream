"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import ProfileSetupModal from "./ProfileSetupModal";

type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  async function loadProfile(userId: string) {
    const { data, error } = await supabase.from("profiles").select("id,display_name,avatar_url,created_at,updated_at").eq("id", userId).maybeSingle();
    if (error) {
      console.error("Profile load failed", error);
      return null;
    }
    setProfile(data as Profile | null);
    setShowProfileSetup(!data?.display_name);
    return data as Profile | null;
  }

  async function refreshProfile() {
    if (!session?.user) return;
    await loadProfile(session.user.id);
  }

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }: { data: { session: Session | null } }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) await loadProfile(data.session.user.id);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, nextSession: Session | null) => {
      if (!mounted) return;
      setSession(nextSession);
      if (nextSession?.user) await loadProfile(nextSession.user.id);
      else {
        setProfile(null);
        setShowProfileSetup(false);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  async function signInWithGoogle() {
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) throw error;
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const value = useMemo(() => ({ user: session?.user ?? null, session, profile, loading, signInWithGoogle, signOut, refreshProfile }), [session, profile, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
      {showProfileSetup && session?.user ? <ProfileSetupModal user={session.user} onSaved={refreshProfile} /> : null}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

"use client";

import { useEffect, useState } from "react";
import { ArrowRight, UserRound } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export default function ProfileSetupModal({ user, onSaved }: { user: User; onSaved: () => Promise<void> }) {
  const supabase = createClient();
  const suggested = (user.user_metadata?.full_name || user.user_metadata?.name || "").trim();
  const [name, setName] = useState(suggested);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const displayName = name.trim().replace(/\\s+/g, " ");
    if (displayName.length < 2 || displayName.length > 30) {
      setError("Choose a profile name between 2 and 30 characters.");
      return;
    }
    setSaving(true);
    setError("");
    const { error: saveError } = await supabase.from("profiles").upsert({
      id: user.id,
      display_name: displayName,
      avatar_url: user.user_metadata?.picture || user.user_metadata?.avatar_url || null,
    }, { onConflict: "id" });
    if (saveError) {
      setError(saveError.message);
      setSaving(false);
      return;
    }
    await onSaved();
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-[220] grid place-items-center bg-black/75 p-4 backdrop-blur-xl">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111111] p-6 shadow-2xl sm:p-8">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/20"><UserRound size={22} /></div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-white/35">Welcome to Oryz</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Create your profile</h1>
        <p className="mt-3 text-sm leading-6 text-white/50">Pick a name for your Oryz profile. You can use it across your library and continue-watching list.</p>
        <label className="mt-6 block text-xs font-medium text-white/55">Profile name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={30} autoFocus className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none transition focus:border-red-500/70" placeholder="Your name" />
        {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}
        <button disabled={saving} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-50">
          {saving ? "Saving..." : "Create profile"}<ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
}

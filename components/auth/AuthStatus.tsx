"use client";

import { useState } from "react";
import { ChevronDown, LogIn, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import GoogleSignInButton from "./GoogleSignInButton";
import Avatar from "./Avatar";

export default function AuthStatus() {
  const { user, profile, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  if (loading) return <div className="h-9 w-9 animate-pulse rounded-full bg-white/10" />;
  if (!user) return <Link href="/login" className="hidden items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-white/90 sm:inline-flex"><LogIn size={15} /> Sign in</Link>;
  const label = profile?.display_name || user.user_metadata?.name || user.email || "Profile";
  return <div className="relative"><button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-2 py-1.5 text-white/80 hover:bg-white/10"><span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-red-600 text-xs font-bold"><Avatar urls={[profile?.avatar_url, user.user_metadata?.avatar_url, user.user_metadata?.picture]} fallback={label} className="h-full w-full object-cover" /></span><span className="hidden max-w-28 truncate text-sm sm:block">{label}</span><ChevronDown size={14} className="hidden sm:block" /></button>{open ? <div className="absolute right-0 top-full z-[160] mt-2 w-48 rounded-2xl border border-white/10 bg-[#111]/95 p-1.5 shadow-2xl backdrop-blur-xl"><Link href="/library" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-white/70 hover:bg-white/[0.06] hover:text-white"><UserRound size={15} /> Library</Link><button onClick={() => { setOpen(false); signOut(); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-white/70 hover:bg-white/[0.06] hover:text-white"><LogOut size={15} /> Sign out</button></div> : null}</div>;
}

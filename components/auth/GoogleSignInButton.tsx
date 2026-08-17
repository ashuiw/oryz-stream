"use client";

import { UserKey } from "lucide-react";
import { useAuth } from "./AuthProvider";

export default function GoogleSignInButton({ className = "" }: { className?: string }) {
  const { signInWithGoogle } = useAuth();
  return (
    <button onClick={() => signInWithGoogle().catch((e) => console.error(e))} className={`inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 ${className}`}>
      <UserKey size={16} /> Continue with Google
    </button>
  );
}

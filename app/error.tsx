"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Application route error", error); }, [error]);
  return <main className="oryz-error-page text-white"><section className="oryz-error-card"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-300/10 text-amber-200"><AlertTriangle size={25}/></div><p className="mt-6 text-xs font-bold uppercase tracking-[.24em] text-amber-200/75">Playback interrupted</p><h1 className="mt-3 text-3xl font-bold">Something went wrong</h1><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/50">A temporary hiccup stopped this page from loading. Try again, or head back to the home screen.</p><div className="mt-7 flex justify-center gap-3"><button onClick={() => reset()} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-black"><RotateCcw size={16}/> Try again</button><Link href="/" className="rounded-xl border border-white/10 bg-white/[.05] px-5 py-3 text-sm font-semibold">Home</Link></div>{error.digest ? <p className="mt-5 text-[10px] text-white/25">Reference: {error.digest}</p> : null}</section></main>;
}

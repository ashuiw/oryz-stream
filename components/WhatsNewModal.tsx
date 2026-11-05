"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Dice, Search, Smartphone, X } from "@/components/ui/icons";
import { LogoMark } from "@/components/Logo";

// Bump this key to show a new announcement to everyone again in a future update.
const STORAGE_KEY = "oryz:whats-new:ui-2026-11";

const highlights = [
  { icon: Dice, title: "Top 10, Continue watching and Surprise me", text: "Find something to watch faster, and resume where you stopped." },
  { icon: Search, title: "Faster search", text: "Press / or ⌘K anywhere. Recent searches are remembered." },
  { icon: Smartphone, title: "Better on phones", text: "A bottom tab bar and layouts built for small screens." },
];

export default function WhatsNewModal() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const skip = pathname.startsWith("/watch");

  // Show once: wait a moment after load, and never during playback.
  useEffect(() => {
    if (skip) return;
    let seen = false;
    try {
      seen = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {}
    if (seen) return;
    const t = setTimeout(() => setOpen(true), 1200);
    return () => clearTimeout(t);
  }, [skip]);

  function close() {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
  }

  useEffect(() => {
    if (!open) return;
    buttonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open || skip) return null;

  return (
    <div
      className="fixed inset-0 z-[300] grid place-items-center bg-ink/80 p-4 backdrop-blur-md"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="whats-new-title"
        className="pop-in relative w-full max-w-md overflow-hidden rounded-lg border border-gold-400/25 bg-ink-2 shadow-2xl"
      >
        <div
          aria-hidden
          className="h-32 bg-cover bg-center"
          style={{ backgroundImage: "url(/brand/banner.jpg)" }}
        />
        <div aria-hidden className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-transparent to-ink-2" />

        <button
          onClick={close}
          aria-label="Close"
          className="glass absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-white/70 hover:text-white"
        >
          <X size={17} />
        </button>

        <div className="relative -mt-12 px-6 pb-6 text-center sm:px-8 sm:pb-8">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-gold-400/30 bg-ink-2">
            <LogoMark size={52} />
          </div>
          <h2 id="whats-new-title" className="mt-4 text-2xl font-semibold sm:text-3xl">
            Our UI is now updated
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Oryz has a new look and a smoother experience. Here is what is new:
          </p>

          <ul className="mt-5 space-y-3 text-left">
            {highlights.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-3 rounded-lg border border-white/[0.07] bg-white/[0.03] p-3.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-gold-400/15 text-gold-400">
                  <Icon size={17} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-white/90">{title}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-white/50">{text}</span>
                </span>
              </li>
            ))}
          </ul>

          <button ref={buttonRef} onClick={close} className="gold-btn mt-6 h-12 w-full rounded-md text-sm">
            Explore Oryz
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/** Thin gold line that fills as the page is scrolled. */
export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        el,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { start: 0, end: "max", scrub: 0.2 },
        },
      );
    });
    return () => mm.revert();
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] overflow-hidden">
      <div ref={ref} className="h-full origin-left scale-x-0 bg-gold-500" />
    </div>
  );
}

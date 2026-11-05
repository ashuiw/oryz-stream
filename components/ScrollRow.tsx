"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "@/components/ui/icons";

/** Horizontal, snap-scrolling shelf with arrow controls on pointer devices. */
export default function ScrollRow({
  title,
  subtitle,
  href,
  hrefLabel = "See all",
  children,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  hrefLabel?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update, children]);

  function page(dir: 1 | -1) {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  }

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-6 sm:px-5">
      <div className="section-head mb-5 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="section-title">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-white/45">{subtitle}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {href ? (
            <Link href={href} className="inline-flex items-center gap-1.5 py-1.5 text-sm font-semibold text-gold-400 transition hover:text-gold-200">
              {hrefLabel}
              <ChevronRight size={14} />
            </Link>
          ) : null}
          <div className="hidden gap-1.5 md:flex">
            <button
              type="button"
              aria-label="Scroll left"
              disabled={!canPrev}
              onClick={() => page(-1)}
              className="grid h-9 w-9 place-items-center rounded-md border border-white/15 text-white/70 transition hover:border-gold-500 hover:text-gold-300 disabled:opacity-25"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              aria-label="Scroll right"
              disabled={!canNext}
              onClick={() => page(1)}
              className="grid h-9 w-9 place-items-center rounded-md border border-white/15 text-white/70 transition hover:border-gold-500 hover:text-gold-300 disabled:opacity-25"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={ref}
        onScroll={update}
        className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-3 sm:-mx-5 sm:scroll-px-5 sm:px-5"
      >
        {children}
      </div>
    </section>
  );
}

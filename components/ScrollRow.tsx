"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    <section className="mx-auto max-w-[1280px] px-4 py-7 sm:px-5">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="section-title">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-white/45">{subtitle}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {href ? (
            <Link href={href} className="rounded-lg px-2 py-1.5 text-sm text-gold-300 transition hover:bg-white/[0.06] hover:text-gold-100">
              {hrefLabel}
            </Link>
          ) : null}
          <div className="hidden gap-1.5 md:flex">
            <button
              type="button"
              aria-label="Scroll left"
              disabled={!canPrev}
              onClick={() => page(-1)}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-gold-400/50 hover:text-gold-200 disabled:opacity-25"
            >
              <ChevronLeft size={17} />
            </button>
            <button
              type="button"
              aria-label="Scroll right"
              disabled={!canNext}
              onClick={() => page(1)}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-gold-400/50 hover:text-gold-200 disabled:opacity-25"
            >
              <ChevronRight size={17} />
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

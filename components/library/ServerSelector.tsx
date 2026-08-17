"use client";

import { ChevronDown, Check, Server } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ServerOption = "server1" | "server2";

type Props = {
  value: ServerOption;
  onChange: (value: ServerOption) => void;
};

const OPTIONS: Array<{ value: ServerOption; label: string }> = [
  { value: "server1", label: "Server 1" },
  { value: "server2", label: "Server 2" },
];

export default function ServerSelector({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = "oryz-server-selector-options";
  const selected = OPTIONS.find((option) => option.value === value) ?? OPTIONS[0];

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && !rootRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const selectServer = (next: ServerOption) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative z-[70] inline-flex">
      <span className="sr-only" id="oryz-server-selector-label">
        Select streaming server
      </span>

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-labelledby="oryz-server-selector-label"
        onClick={() => setOpen((current) => !current)}
        className={[
          "group flex h-11 min-w-[190px] items-center gap-2.5 rounded-xl",
          "border border-white/10 bg-[#111]/90 px-3.5 text-left",
          "text-sm font-medium text-white shadow-xl shadow-black/25",
          "backdrop-blur-xl transition-all duration-200",
          "hover:border-white/20 hover:bg-[#171717]",
          "focus:outline-none focus-visible:border-red-500/60 focus-visible:ring-2 focus-visible:ring-red-500/20",
          open ? "border-white/20 bg-[#171717]" : "",
        ].join(" ")}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06]">
          <Server size={15} strokeWidth={1.8} className="text-white/70" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-medium uppercase tracking-[0.08em] text-white/40">
            Streaming server
          </span>
          <span className="block truncate text-[13px] leading-4 text-white">
            {selected.label}
          </span>
        </span>

        <ChevronDown
          size={16}
          strokeWidth={1.8}
          className={`shrink-0 text-white/50 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Streaming server"
          className="absolute right-0 top-[calc(100%+8px)] w-full min-w-[190px] overflow-hidden rounded-xl border border-white/10 bg-[#111]/[0.98] p-1.5 shadow-2xl shadow-black/50 backdrop-blur-2xl"
        >
          {OPTIONS.map((option) => {
            const active = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => selectServer(option.value)}
                className={[
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left",
                  "text-[13px] font-medium transition-colors duration-150",
                  active
                    ? "bg-red-500/10 text-white"
                    : "text-white/70 hover:bg-white/[0.07] hover:text-white",
                ].join(" ")}
              >
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    active ? "bg-red-500" : "bg-white/20"
                  }`}
                />
                <span className="flex-1">{option.label}</span>
                {active && <Check size={15} className="text-red-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

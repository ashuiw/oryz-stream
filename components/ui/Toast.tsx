"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { Check, X } from "@/components/ui/icons";

type ToastKind = "success" | "error" | "info";
type ToastItem = { id: number; kind: ToastKind; message: string };
type ToastApi = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const noop = () => {};
const ToastContext = createContext<ToastApi>({ success: noop, error: noop, info: noop });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => setItems((all) => all.filter((t) => t.id !== id)), []);

  const push = useCallback(
    (kind: ToastKind, message: string) => {
      const id = ++idRef.current;
      setItems((all) => [...all.slice(-2), { id, kind, message }]);
      setTimeout(() => dismiss(id), kind === "error" ? 6000 : 3500);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (m) => push("success", m),
      error: (m) => push("error", m),
      info: (m) => push("info", m),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--tabbar-h)+12px+env(safe-area-inset-bottom))] z-[400] flex flex-col items-center gap-2 px-3 sm:bottom-6"
        aria-live="polite"
      >
        {items.map((t) => (
          <div
            key={t.id}
            role={t.kind === "error" ? "alert" : "status"}
            className={`pop-in pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-md border bg-ink-2 px-4 py-3 text-sm shadow-2xl ${
              t.kind === "error" ? "border-red-400/50" : t.kind === "success" ? "border-gold-500/60" : "border-white/20"
            }`}
          >
            <span
              className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                t.kind === "error" ? "bg-red-400 text-ink" : "bg-gold-500 text-ink"
              }`}
            >
              {t.kind === "error" ? <X size={12} weight="bold" /> : <Check size={12} />}
            </span>
            <p className="min-w-0 flex-1 leading-5 text-white/90">{t.message}</p>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-white/40 transition hover:text-white">
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

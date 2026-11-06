"use client";

import Link from "next/link";
import { useEffect } from "react";
import { LogoMark } from "@/components/Logo";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center px-5 text-white">
      <div className="max-w-md">
        <LogoMark size={48} />
        <h1 className="mt-6 text-5xl">Something went wrong</h1>
        <p className="mt-4 text-[15px] leading-7 text-white/60">
          We hit an unexpected problem loading this page. Try again, or head back home.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <button onClick={reset} className="gold-btn h-12 px-6 text-[15px]">Try again</button>
          <Link href="/" className="ghost-btn inline-flex h-12 items-center px-6 text-[15px]">Back to home</Link>
        </div>
      </div>
    </main>
  );
}

import { Suspense } from "react";
import HomeClient from "@/components/HomeClient";

function HomeFallback() {
  return (
    <div className="min-h-screen bg-[#070707] text-white" aria-busy="true">
      <div className="min-h-[650px] animate-pulse bg-white/[0.02]" />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeFallback />}>
      <HomeClient />
    </Suspense>
  );
}

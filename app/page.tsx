import { Suspense } from "react";
import HomeClient from "@/components/HomeClient";

function HomeFallback() {
  return (
    <div className="min-h-screen text-white" aria-busy="true">
      <div className="min-h-[650px] skeleton" />
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

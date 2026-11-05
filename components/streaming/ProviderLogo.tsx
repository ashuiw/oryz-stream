"use client";

import Image from "next/image";
import type { Provider } from "./types";

const LOGOS: Record<string, string> = {
  netflix: "/ott/netflix.png",
  "prime-video": "/ott/primevideo.png",
  "disney-plus": "/ott/disney.png",
  hulu: "/ott/hulu.png",
  max: "/ott/hbomax.png",
  "apple-tv-plus": "/ott/appletv.png",
  "paramount-plus": "/ott/paramount.png",
  peacock: "/ott/peacock.png",
  crunchyroll: "/ott/crunchyroll.png",
};

export default function ProviderLogo({
  provider,
  large = false,
}: {
  provider: Provider;
  large?: boolean;
}) {
  const logo = LOGOS[provider.slug];

  if (!logo) {
    return (
      <div className={`${large ? "h-24 w-24" : "h-16 w-16"} flex items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold text-white`}>
        {provider.provider_name.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <div className={`${large ? "h-24 w-24" : "h-16 w-16"} flex items-center justify-center overflow-hidden rounded-2xl bg-white/10 p-2`}>
      <Image
        src={logo}
        alt={provider.provider_name}
        width={64}
        height={64}
        className="h-full w-full object-contain"
      />
    </div>
  );
}
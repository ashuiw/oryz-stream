"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProviderLogo from "./streaming/ProviderLogo";
import { PROVIDER_LABELS, PROVIDER_ORDER, type Provider } from "./streaming/types";

const REGION = process.env.NEXT_PUBLIC_TMDB_REGION || "US";

export default function OttSection() {
  const [providers, setProviders] = useState<Provider[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/streaming?action=providers&region=${REGION}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const ordered = PROVIDER_ORDER
          .map((slug) => data.providers?.find((p: Provider) => p.slug === slug))
          .filter(Boolean) as Provider[];
        setProviders(ordered);
      })
      .catch(() => {
        if (!cancelled) setProviders([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        .provider-logo { position: relative; width: 100%; height: 62px; display: grid; place-items: center; overflow: hidden; border-radius: 16px; color: #fff; text-align: center; }
        .provider-logo img { width: 100%; height: 100%; object-fit: contain; padding: 9px 16px; display: block; border-radius: 14px; }
        .provider-logo span { font-weight: 900; letter-spacing: -.045em; line-height: .95; font-size: 19px; }
        .provider-netflix span { font-size: 40px; }
        .provider-prime-video span { font-size: 17px; }
        .provider-disney-plus span { font-size: 20px; }
        .provider-hulu span { font-size: 25px; }
        .provider-max span { font-size: 28px; }
        .provider-apple-tv-plus span { font-size: 20px; }
        .provider-paramount-plus span { font-size: 11px; }
        .provider-peacock span { font-size: 17px; }
        .provider-crunchyroll span { font-size: 12px; }
      `}</style>
      <section className="mx-auto max-w-[1280px] px-5 py-10">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">Channels & Apps</h2>
          <p className="mt-1 text-xs text-white/35">Browse your favorite streaming platforms</p>
        </div>
        <Link href="/streaming" className="text-xs text-white/45 transition hover:text-white">
          See all
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9">
        {providers.map((provider) => (
          <Link
            key={provider.provider_id}
            href={`/streaming/${provider.slug}`}
            aria-label={`Open ${PROVIDER_LABELS[provider.slug] || provider.provider_name}`}
            className="group flex h-[108px] min-w-0 items-center justify-center overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#151515] px-5 transition hover:-translate-y-0.5 hover:border-white/10 hover:bg-[#191919]"
          >
            <ProviderLogo provider={provider} />
          </Link>
        ))}
      </div>
      </section>
    </>
  );
}

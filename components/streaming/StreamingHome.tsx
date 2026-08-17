"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import ProviderLogo from "./ProviderLogo";
import HorizontalMediaRow from "./HorizontalMediaRow";
import StreamingStyles from "./StreamingStyles";
import { PROVIDER_LABELS, PROVIDER_ORDER, type MediaItem, type Provider } from "./types";

const REGION = process.env.NEXT_PUBLIC_TMDB_REGION || "US";

export default function StreamingHome() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [content, setContent] = useState<Record<string, { movies: MediaItem[]; tv: MediaItem[] }>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch(`/api/streaming?action=providers&region=${REGION}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load streaming platforms");

        const ordered = PROVIDER_ORDER
          .map((slug) => data.providers?.find((p: Provider) => p.slug === slug))
          .filter(Boolean) as Provider[];

        if (cancelled) return;
        setProviders(ordered);

        const entries = await Promise.all(
          ordered.map(async (provider) => {
            const [movieResponse, tvResponse] = await Promise.all([
              fetch(`/api/streaming?action=content&type=movie&provider=${provider.provider_id}&page=1&region=${REGION}`),
              fetch(`/api/streaming?action=content&type=tv&provider=${provider.provider_id}&page=1&region=${REGION}`),
            ]);
            const [movies, tv] = await Promise.all([movieResponse.json(), tvResponse.json()]);
            return [provider.slug, {
              movies: (movies.results || []).slice(0, 10),
              tv: (tv.results || []).slice(0, 10),
            }] as const;
          }),
        );

        if (!cancelled) setContent(Object.fromEntries(entries));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unable to load streaming data");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="streaming-page">
      <StreamingStyles />
      <Navbar />

      <main className="streaming-shell">
        <section className="streaming-intro">
          <div className="streaming-kicker">Channels & Apps</div>
          <h1 className="streaming-title">Streaming</h1>
          <p className="streaming-subtitle">
            Discover movies and TV shows across the platforms you already love.
          </p>
        </section>

        {error ? <div className="stream-error">{error}</div> : null}

        {providers.map((provider) => {
          const data = content[provider.slug];
          const name = PROVIDER_LABELS[provider.slug] || provider.provider_name;

          return (
            <section className="streaming-section" key={provider.provider_id}>
              <div className="streaming-section-head">
                <div className="streaming-brand">
                  <ProviderLogo provider={provider} large />
                  <div>
                    <h2>{name}</h2>
                    <p>Movies and TV shows</p>
                  </div>
                </div>
                <Link className="see-all" href={`/streaming/${provider.slug}`}>
                  See all
                </Link>
              </div>

              {!data ? (
                <div className="loading-line" />
              ) : (
                <>
                  <div className="content-heading">Movies</div>
                  <HorizontalMediaRow items={data.movies} type="movie" />

                  <div className="content-heading">TV Shows</div>
                  <HorizontalMediaRow items={data.tv} type="tv" />
                </>
              )}
            </section>
          );
        })}
      </main>

      <Footer />
    </div>
  );
}

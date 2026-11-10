"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../Navbar";
import Footer from "../Footer";
import ProviderLogo from "./ProviderLogo";
import MediaCard from "./MediaCard";
import StreamingStyles from "./StreamingStyles";
import { PROVIDER_LABELS, type MediaItem, type Provider } from "./types";

const REGION = process.env.NEXT_PUBLIC_TMDB_REGION || "US";

export default function StreamingProviderPage({ slug }: { slug: string }) {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [type, setType] = useState<"movie" | "tv">("movie");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/streaming?action=providers&region=${REGION}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Unable to load platforms");
        const match = data.providers?.find((p: Provider) => p.slug === slug);
        if (!match) throw new Error("Streaming platform not found");
        if (!cancelled) setProvider(match);
      })
      .catch((e) => !cancelled && setError(e.message));

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!provider) return;
    let cancelled = false;

    setPage(1);
    setLoading(true);
    setError("");

    const params = new URLSearchParams({
      action: "content",
      type,
      provider: String(provider.provider_id),
      page: "1",
      region: REGION,
    });

    fetch(`/api/streaming?${params}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Unable to load content");
        if (!cancelled) {
          setItems(data.results || []);
          setTotalPages(data.total_pages || 1);
        }
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [provider, type]);

  async function loadMore() {
    if (!provider || loadingMore || page >= totalPages) return;
    const next = page + 1;
    setLoadingMore(true);

    try {
      const params = new URLSearchParams({
        action: "content",
        type,
        provider: String(provider.provider_id),
        page: String(next),
        region: REGION,
      });
      const r = await fetch(`/api/streaming?${params}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Unable to load more");
      setItems((prev) => [...prev, ...(data.results || [])]);
      setPage(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load more");
    } finally {
      setLoadingMore(false);
    }
  }

  const providerName = provider ? PROVIDER_LABELS[provider.slug] || provider.provider_name : "Streaming";

  return (
    <div className="streaming-page">
      <StreamingStyles />
      <Navbar />

      <main className="streaming-shell">
        <Link href="/streaming" className="stream-back-link">Back to Streaming</Link>

        {error ? <div className="stream-error">{error}</div> : null}

        {provider ? (
          <>
            <section className="provider-detail-hero">
              <ProviderLogo provider={provider} large />
              <div>
                <div className="streaming-kicker">Channels & Apps</div>
                <h1 className="provider-detail-title">{providerName}</h1>
                <p className="streaming-subtitle">
                  Browse movies and TV shows available on {providerName}.
                </p>
              </div>
            </section>

            <div className="provider-actions">
              <div className="type-tabs" role="tablist" aria-label="Content type">
                <button className={type === "movie" ? "active" : ""} onClick={() => setType("movie")}>
                  Movies
                </button>
                <button className={type === "tv" ? "active" : ""} onClick={() => setType("tv")}>
                  TV Shows
                </button>
              </div>
              <span className="catalog-count">{items.length} titles loaded</span>
            </div>

            {loading ? (
              <div className="loading-line" />
            ) : (
              <>
                <div className="detail-grid">
                  {items.map((item) => (
                    <MediaCard key={`${type}-${item.id}`} item={item} type={type} />
                  ))}
                </div>

                {!items.length ? <div className="empty-catalog">No titles were found for this platform.</div> : null}

                {page < totalPages ? (
                  <div className="load-more-wrap">
                    <button className="load-more" onClick={loadMore} disabled={loadingMore}>
                      {loadingMore ? "Loading..." : "Load more"}
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </>
        ) : !error ? (
          <div className="loading-line" />
        ) : null}
      </main>

      <Footer />
    </div>
  );
}

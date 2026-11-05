import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";
const DEFAULT_REGION = (process.env.TMDB_REGION || "US").toUpperCase();

const FALLBACK_PROVIDERS = [
  { provider_id: 8, provider_name: "Netflix", slug: "netflix" },
  { provider_id: 9, provider_name: "Amazon Prime Video", slug: "prime-video" },
  { provider_id: 337, provider_name: "Disney Plus", slug: "disney-plus" },
  { provider_id: 15, provider_name: "Hulu", slug: "hulu" },
  { provider_id: 1899, provider_name: "Max", slug: "max" },
  { provider_id: 350, provider_name: "Apple TV Plus", slug: "apple-tv-plus" },
  { provider_id: 531, provider_name: "Paramount Plus", slug: "paramount-plus" },
  { provider_id: 386, provider_name: "Peacock", slug: "peacock" },
  { provider_id: 283, provider_name: "Crunchyroll", slug: "crunchyroll" },
];

const PROVIDER_ORDER = FALLBACK_PROVIDERS.map((p) => p.slug);

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    accept: "application/json",
  };
  const token = process.env.TMDB_ACCESS_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function buildUrl(path: string, params: Record<string, string | number | undefined>) {
  const url = new URL(`${TMDB_BASE}${path}`);
  if (!process.env.TMDB_ACCESS_TOKEN && process.env.TMDB_API_KEY) {
    url.searchParams.set("api_key", process.env.TMDB_API_KEY);
  }
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  });
  return url;
}

async function tmdb(path: string, params: Record<string, string | number | undefined>) {
  const response = await fetch(buildUrl(path, params), {
    headers: authHeaders(),
    next: { revalidate: 300 },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`TMDB ${response.status}: ${body.slice(0, 300)}`);
  }
  return response.json();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\+/g, "plus")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function getProviders(region: string) {
  const [movies, tv] = await Promise.all([
    tmdb("/watch/providers/movie", { watch_region: region, language: "en-US" }),
    tmdb("/watch/providers/tv", { watch_region: region, language: "en-US" }),
  ]);

  const map = new Map<number, any>();
  for (const item of [...(movies.results ?? []), ...(tv.results ?? [])]) {
    if (!map.has(item.provider_id)) {
      map.set(item.provider_id, {
        provider_id: item.provider_id,
        provider_name: item.provider_name,
        logo_path: item.logo_path ?? null,
        logo_url: item.logo_path ? `${IMAGE_BASE}/w200${item.logo_path}` : null,
        slug: slugify(item.provider_name),
      });
    }
  }

  return PROVIDER_ORDER.map((slug) => {
    const fallback = FALLBACK_PROVIDERS.find((p) => p.slug === slug)!;
    const match = map.get(fallback.provider_id);

    return {
      ...fallback,
      provider_name: match?.provider_name || fallback.provider_name,
      logo_path: match?.logo_path || null,
      logo_url: match?.logo_path ? `${IMAGE_BASE}/w200${match.logo_path}` : null,
      // Always preserve our stable app slug. This prevents TMDB naming changes
      // from breaking /streaming/[slug] links.
      slug: fallback.slug,
    };
  });
}

async function discover(type: "movie" | "tv", provider: string, page: number, region: string) {
  return tmdb(type === "movie" ? "/discover/movie" : "/discover/tv", {
    language: "en-US",
    page,
    watch_region: region,
    with_watch_providers: provider,
    with_watch_monetization_types: "flatrate",
    sort_by: "popularity.desc",
    include_adult: "false",
    vote_count_gte: 5,
  });
}

export async function GET(request: NextRequest) {
  const limit = rateLimit(request, "streaming", 60);
  if (!limit.ok) return rateLimitResponse(limit.retryAfter);

  try {
    if (!process.env.TMDB_ACCESS_TOKEN && !process.env.TMDB_API_KEY) {
      return NextResponse.json({ error: "Missing TMDB_ACCESS_TOKEN or TMDB_API_KEY in .env.local" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "providers";
    const region = (searchParams.get("region") || DEFAULT_REGION).toUpperCase();

    if (action === "providers") {
      return NextResponse.json({ providers: await getProviders(region), region });
    }

    if (action === "content") {
      const type = searchParams.get("type") === "tv" ? "tv" : "movie";
      const provider = searchParams.get("provider");
      if (provider && !/^\d+$/.test(provider)) return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
      const rawPage = Number(searchParams.get("page") || 1); const page = Number.isFinite(rawPage) ? Math.min(20, Math.max(1, Math.floor(rawPage))) : 1;
      if (!provider) return NextResponse.json({ error: "provider is required" }, { status: 400 });
      return NextResponse.json(await discover(type, provider, page, region));
    }

    if (action === "search") {
      const query = searchParams.get("query")?.trim().slice(0, 100);
      if (!query) return NextResponse.json({ results: [] });
      const rawPage = Number(searchParams.get("page") || 1); const page = Number.isFinite(rawPage) ? Math.min(20, Math.max(1, Math.floor(rawPage))) : 1;
      const data = await tmdb("/search/multi", { query, page, language: "en-US", include_adult: "false" });
      return NextResponse.json({
        ...data,
        results: (data.results ?? []).filter((item: any) => item.media_type === "movie" || item.media_type === "tv"),
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("[streaming]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Streaming request failed" }, { status: 500 });
  }
}

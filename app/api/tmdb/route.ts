import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

const BASE = "https://api.themoviedb.org/3";

type Type = "movie" | "tv" | "multi" | "anime";

function headers() {
  return {
    accept: "application/json",
    ...(process.env.TMDB_ACCESS_TOKEN
      ? { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` }
      : {}),
  };
}

function makeUrl(path: string, params: Record<string, string | number | undefined>) {
  const url = new URL(`${BASE}${path}`);

  if (process.env.TMDB_API_KEY) {
    url.searchParams.set("api_key", process.env.TMDB_API_KEY);
  }

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }

  return url;
}

async function tmdb(path: string, params: Record<string, string | number | undefined>) {
  const url = makeUrl(path, params);

  const res = await fetch(url, {
    headers: headers(),
    next: { revalidate: 300 },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.status_message || `TMDB request failed: ${res.status}`);
  }

  return data;
}

export async function GET(request: NextRequest) {
  const limit = rateLimit(request, "tmdb", 60);
  if (!limit.ok) return rateLimitResponse(limit.retryAfter);
  try {
    const { searchParams } = new URL(request.url);

    const type = (searchParams.get("type") || "movie") as Type;
    const mode = searchParams.get("mode") || "discover";
    const query = searchParams.get("query")?.trim();
    const genre = searchParams.get("genre")?.trim();
    const id = searchParams.get("id")?.trim();
    const season = Math.max(0, Number(searchParams.get("season") || 0));
    const page = Math.max(1, Number(searchParams.get("page") || 1));

    if (!process.env.TMDB_API_KEY && !process.env.TMDB_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: "Missing TMDB_API_KEY or TMDB_ACCESS_TOKEN in .env.local" },
        { status: 500 }
      );
    }

    if (id && mode === "details") {
      if (type !== "movie" && type !== "tv") {
        return NextResponse.json({ error: "Details require movie or tv type" }, { status: 400 });
      }
      const data = await tmdb(`/${type}/${id}`, {
        language: "en-US",
        append_to_response: "credits,videos,watch/providers",
      });
      return NextResponse.json({ ...data, media_type: type });
    }

    if (id && mode === "season" && type === "tv") {
      if (!season) return NextResponse.json({ error: "A season is required" }, { status: 400 });
      const data = await tmdb(`/tv/${id}/season/${season}`, { language: "en-US" });
      return NextResponse.json(data);
    }

    // Live homepage search. Multi-search can return people too, so the client
    // filters those out.
    if (query) {
      const data = await tmdb("/search/multi", {
        query,
        page,
        language: "en-US",
        include_adult: "false",
      });

      return NextResponse.json(data);
    }

    // Anime is intentionally a separate API mode. It combines Japanese
    // animated movies and TV shows instead of returning all movies/shows.
    if (type === "anime") {
      const extraGenre = genre ? `,${genre}` : "";

      const [movies, shows] = await Promise.all([
        tmdb("/discover/movie", {
          page,
          language: "en-US",
          sort_by: "popularity.desc",
          include_adult: "false",
          include_video: "false",
          with_genres: `16${extraGenre}`,
          with_original_language: "ja",
        }),
        tmdb("/discover/tv", {
          page,
          language: "en-US",
          sort_by: "popularity.desc",
          include_adult: "false",
          with_genres: `16${extraGenre}`,
          with_original_language: "ja",
        }),
      ]);

      const results = [
        ...(movies.results || []).map((item: any) => ({
          ...item,
          media_type: "movie",
        })),
        ...(shows.results || []).map((item: any) => ({
          ...item,
          media_type: "tv",
        })),
      ]
        .filter((item) => item.poster_path)
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        .slice(0, 20);

      return NextResponse.json({
        page,
        results,
        total_pages: Math.max(movies.total_pages || 1, shows.total_pages || 1),
        total_results: (movies.total_results || 0) + (shows.total_results || 0),
      });
    }

    if (type !== "movie" && type !== "tv" && type !== "multi") {
      return NextResponse.json({ error: "Invalid TMDB type" }, { status: 400 });
    }

    const mediaType = type as "movie" | "tv";
    let endpoint = `/discover/${mediaType}`;
    const params: Record<string, string | number | undefined> = {
      page,
      language: "en-US",
      sort_by: "popularity.desc",
      include_adult: "false",
      include_video: "false",
    };

    if (genre) params.with_genres = genre;

    switch (mode) {
      case "trending":
        endpoint = `/trending/${mediaType}/week`;
        delete params.language;
        delete params.sort_by;
        delete params.include_adult;
        delete params.include_video;
        break;

      case "popular":
        endpoint = `/${mediaType}/popular`;
        break;

      case "top-rated":
        endpoint = `/${mediaType}/top_rated`;
        break;

      case "now-playing":
        if (mediaType === "movie") endpoint = "/movie/now_playing";
        break;

      case "upcoming":
        if (mediaType === "movie") endpoint = "/movie/upcoming";
        break;

      case "airing-today":
        if (mediaType === "tv") endpoint = "/tv/airing_today";
        break;

      case "on-the-air":
        if (mediaType === "tv") endpoint = "/tv/on_the_air";
        break;

      default:
        break;
    }

    const data = await tmdb(endpoint, params);

    return NextResponse.json(data);
  } catch (error) {
    console.error("[TMDB]", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "TMDB request failed",
      },
      { status: 500 }
    );
  }
}

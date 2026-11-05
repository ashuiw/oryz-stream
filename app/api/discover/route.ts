import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const limit = rateLimit(request, "discover", 60);
  if (!limit.ok) return rateLimitResponse(limit.retryAfter);

  const provider = request.nextUrl.searchParams.get("provider");
  const genre = request.nextUrl.searchParams.get("genre");
  const rawPage = Number(request.nextUrl.searchParams.get("page") || "1");
  const page = String(Number.isFinite(rawPage) ? Math.min(20, Math.max(1, Math.floor(rawPage))) : 1);

  const type =
    request.nextUrl.searchParams.get("type") || "movie";

  if (type !== "movie" && type !== "tv") {
    return NextResponse.json(
      { error: "Type must be movie or tv" },
      { status: 400 }
    );
  }

  if (!provider && !genre) {
    // Allow normal discover requests without a filter.
  }

  const token = process.env.TMDB_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: "TMDB access token is not configured" },
      { status: 500 }
    );
  }

  const endpoint =
    type === "movie"
      ? "https://api.themoviedb.org/3/discover/movie"
      : "https://api.themoviedb.org/3/discover/tv";

  const url = new URL(endpoint);

  url.searchParams.set("language", "en-US");
  url.searchParams.set("watch_region", "IN");
  url.searchParams.set("page", page);
  url.searchParams.set("sort_by", "popularity.desc");

  if (provider) {
    url.searchParams.set(
      "with_watch_providers",
      provider
    );

    url.searchParams.set(
      "with_watch_monetization_types",
      "flatrate"
    );
  }

  if (genre) {
    if (!/^\d+(,\d+)*$/.test(genre) || genre.length > 64) {
      return NextResponse.json({ error: "Invalid genre" }, { status: 400 });
    }
    url.searchParams.set("with_genres", genre);
  }

  if (provider) {
    if (!/^\d+(,\d+)*$/.test(provider) || provider.length > 64) {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }
  }

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },

      next: {
        revalidate: 1800,
      },
    });

    if (!response.ok) {
      const error = await response.text();

      return NextResponse.json(
        {
          error: "TMDB discover request failed",
          details: error,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to connect to TMDB",
      },
      { status: 500 }
    );
  }
}
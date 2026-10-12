import { NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

const GENRES = {
  romance: 10749,
  horror: 27,
  drama: 18,
  action: 28,
  comedy: 35,
  thriller: 53,
};

async function tmdbFetch(url: string, token: string) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    next: {
      revalidate: 1800,
    },
  });

  if (!response.ok) {
    throw new Error(`TMDB request failed: ${response.status}`);
  }

  return response.json();
}

function discoverUrl(
  type: "movie" | "tv",
  params: Record<string, string>
) {
  const url = new URL(
    `https://api.themoviedb.org/3/discover/${type}`
  );

  url.searchParams.set("language", "en-US");
  url.searchParams.set("page", "1");

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  return url.toString();
}

export async function GET(request: Request) {
  const limit = rateLimit(request, "home", 30);
  if (!limit.ok) return rateLimitResponse(limit.retryAfter);
  const token = process.env.TMDB_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json(
      {
        error: "TMDB access token is not configured",
      },
      { status: 500 }
    );
  }

  try {
    const commonMovie = {
      include_adult: "false",
      include_video: "false",
    };

    const [
      popularMovies,
      popularTv,
      mustWatch,
      romance,
      horror,
      drama,
      action,
      comedy,
      thriller,
    ] = await Promise.all([
      tmdbFetch(
        discoverUrl("movie", {
          ...commonMovie,
          sort_by: "popularity.desc",
        }),
        token
      ),

      tmdbFetch(
        discoverUrl("tv", {
          include_adult: "false",
          sort_by: "popularity.desc",
        }),
        token
      ),

      tmdbFetch(
        discoverUrl("movie", {
          ...commonMovie,
          sort_by: "vote_average.desc",
          "vote_count.gte": "500",
        }),
        token
      ),

      tmdbFetch(
        discoverUrl("movie", {
          ...commonMovie,
          with_genres: String(GENRES.romance),
          sort_by: "popularity.desc",
        }),
        token
      ),

      tmdbFetch(
        discoverUrl("movie", {
          ...commonMovie,
          with_genres: String(GENRES.horror),
          sort_by: "popularity.desc",
        }),
        token
      ),

      tmdbFetch(
        discoverUrl("movie", {
          ...commonMovie,
          with_genres: String(GENRES.drama),
          sort_by: "popularity.desc",
        }),
        token
      ),

      tmdbFetch(
        discoverUrl("movie", {
          ...commonMovie,
          with_genres: String(GENRES.action),
          sort_by: "popularity.desc",
        }),
        token
      ),

      tmdbFetch(
        discoverUrl("movie", {
          ...commonMovie,
          with_genres: String(GENRES.comedy),
          sort_by: "popularity.desc",
        }),
        token
      ),

      tmdbFetch(
        discoverUrl("movie", {
          ...commonMovie,
          with_genres: String(GENRES.thriller),
          sort_by: "popularity.desc",
        }),
        token
      ),
    ]);

    return NextResponse.json({
      popularMovies: popularMovies.results || [],
      popularTv: popularTv.results || [],
      mustWatch: mustWatch.results || [],
      genres: {
        romance: romance.results || [],
        horror: horror.results || [],
        drama: drama.results || [],
        action: action.results || [],
        comedy: comedy.results || [],
        thriller: thriller.results || [],
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to load homepage data",
      },
      { status: 500 }
    );
  }
}
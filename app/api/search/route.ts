import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const limit = rateLimit(request, "search", 60);
  if (!limit.ok) return rateLimitResponse(limit.retryAfter);
  const query = request.nextUrl.searchParams.get("query")?.trim().slice(0, 100);

  if (!query) {
    return NextResponse.json(
      { error: "Missing search query" },
      { status: 400 }
    );
  }

  const token = process.env.TMDB_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: "TMDB access token is not configured" },
      { status: 500 }
    );
  }

  const url = new URL("https://api.themoviedb.org/3/search/movie");

  url.searchParams.set("query", query);
  url.searchParams.set("language", "en-US");
  url.searchParams.set("include_adult", "false");
  url.searchParams.set("page", "1");

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.text();

      return NextResponse.json(
        {
          error: "TMDB request failed",
          details: error,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to TMDB" },
      { status: 500 }
    );
  }
}
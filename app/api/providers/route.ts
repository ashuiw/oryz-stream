import { NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const limit = rateLimit(request, "providers", 30);
  if (!limit.ok) return rateLimitResponse(limit.retryAfter);
  const token = process.env.TMDB_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: "TMDB access token is not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      "https://api.themoviedb.org/3/watch/providers/movie?language=en-US&watch_region=IN",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        next: {
          revalidate: 86400,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to load providers" },
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
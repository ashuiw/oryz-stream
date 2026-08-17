import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Missing movie ID" },
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

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?language=en-US`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();

      return NextResponse.json(
        {
          error: "Movie not found",
          details: error,
        },
        { status: response.status }
      );
    }

    const movie = await response.json();

    return NextResponse.json(movie);
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to TMDB" },
      { status: 500 }
    );
  }
}
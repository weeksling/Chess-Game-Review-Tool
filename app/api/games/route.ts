import { NextRequest, NextResponse } from "next/server";
import { getGames } from "@/lib/storage";

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username");
  if (!username) {
    return NextResponse.json(
      { error: "username query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const games = await getGames(username);
    return NextResponse.json(games);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

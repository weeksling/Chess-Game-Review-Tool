import { NextResponse } from "next/server";
import { getGames } from "@/lib/storage";

export async function GET() {
  try {
    const games = await getGames();
    return NextResponse.json(games);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

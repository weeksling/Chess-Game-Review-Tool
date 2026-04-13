import { NextRequest, NextResponse } from "next/server";
import { getRecentGames } from "@/lib/chess-com";
import { importGame } from "@/lib/lichess";
import { hasGame, saveGame } from "@/lib/storage";
import type { ReviewedGame } from "@/types";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const username = body.username;

  if (!username || typeof username !== "string") {
    return NextResponse.json(
      { error: "username is required in request body" },
      { status: 400 }
    );
  }

  try {
    const recentGames = await getRecentGames(username, 10);
    const synced: ReviewedGame[] = [];
    const errors: string[] = [];

    for (const game of recentGames) {
      if (await hasGame(game.uuid)) continue;

      try {
        const result = await importGame(game.pgn);

        const reviewed: ReviewedGame = {
          chessComUrl: game.url,
          chessComUuid: game.uuid,
          lichessId: result.id,
          lichessUrl: result.url,
          embedUrl: result.embedUrl,
          pgn: game.pgn,
          timeControl: game.time_control,
          timeClass: game.time_class,
          endTime: game.end_time,
          white: {
            username: game.white.username,
            rating: game.white.rating,
            result: game.white.result,
          },
          black: {
            username: game.black.username,
            rating: game.black.rating,
            result: game.black.result,
          },
          syncedAt: Date.now(),
        };

        await saveGame(username, reviewed);
        synced.push(reviewed);

        // Small delay to respect Lichess rate limits
        await new Promise((r) => setTimeout(r, 500));
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`Failed to import game ${game.uuid}: ${msg}`);
      }
    }

    return NextResponse.json({
      synced: synced.length,
      skipped: recentGames.length - synced.length - errors.length,
      errors,
      games: synced,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

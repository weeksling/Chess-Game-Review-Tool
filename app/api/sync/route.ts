import { NextResponse } from "next/server";
import { getRecentGames } from "@/lib/chess-com";
import { importGame } from "@/lib/lichess";
import { hasGame, saveGame } from "@/lib/storage";
import type { ReviewedGame } from "@/types";

export async function POST() {
  const username = process.env.CHESS_COM_USERNAME;
  if (!username) {
    return NextResponse.json(
      { error: "CHESS_COM_USERNAME not configured" },
      { status: 500 }
    );
  }

  try {
    const recentGames = await getRecentGames(username, 10);
    const synced: ReviewedGame[] = [];
    const errors: string[] = [];

    for (const game of recentGames) {
      // Skip already-synced games
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

        await saveGame(reviewed);
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

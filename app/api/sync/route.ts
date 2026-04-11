import { NextResponse } from "next/server";
import { getRecentGames } from "@/lib/chess-com";
import { importGame } from "@/lib/lichess";
import type { ReviewedGame } from "@/types";

interface SyncRequest {
  username?: string;
  existingUuids?: string[];
}

export async function POST(req: Request) {
  let body: SyncRequest;
  try {
    body = (await req.json()) as SyncRequest;
  } catch {
    body = {};
  }

  const username = body.username?.trim();
  if (!username) {
    return NextResponse.json(
      { error: "username is required" },
      { status: 400 }
    );
  }

  const existingUuids = new Set(body.existingUuids ?? []);

  try {
    const recentGames = await getRecentGames(username, 10);
    const synced: ReviewedGame[] = [];
    const errors: string[] = [];
    let skipped = 0;

    for (const game of recentGames) {
      if (existingUuids.has(game.uuid)) {
        skipped++;
        continue;
      }

      try {
        const result = await importGame(game.pgn);

        synced.push({
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
        });

        // Small delay to respect Lichess rate limits
        await new Promise((r) => setTimeout(r, 500));
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`Failed to import game ${game.uuid}: ${msg}`);
      }
    }

    return NextResponse.json({
      synced: synced.length,
      skipped,
      errors,
      games: synced,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

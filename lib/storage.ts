import { neon } from "@neondatabase/serverless";
import type { ReviewedGame } from "@/types";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return neon(url);
}

export async function ensureTable(): Promise<void> {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS reviewed_games (
      id SERIAL PRIMARY KEY,
      chess_com_url TEXT NOT NULL,
      chess_com_uuid TEXT UNIQUE NOT NULL,
      lichess_id TEXT NOT NULL,
      lichess_url TEXT NOT NULL,
      embed_url TEXT NOT NULL,
      pgn TEXT NOT NULL,
      time_control TEXT NOT NULL,
      time_class TEXT NOT NULL,
      end_time BIGINT NOT NULL,
      white_username TEXT NOT NULL,
      white_rating INTEGER NOT NULL,
      white_result TEXT NOT NULL,
      black_username TEXT NOT NULL,
      black_rating INTEGER NOT NULL,
      black_result TEXT NOT NULL,
      synced_at BIGINT NOT NULL
    )
  `;
}

function rowToGame(row: Record<string, unknown>): ReviewedGame {
  return {
    chessComUrl: row.chess_com_url as string,
    chessComUuid: row.chess_com_uuid as string,
    lichessId: row.lichess_id as string,
    lichessUrl: row.lichess_url as string,
    embedUrl: row.embed_url as string,
    pgn: row.pgn as string,
    timeControl: row.time_control as string,
    timeClass: row.time_class as string,
    endTime: Number(row.end_time),
    white: {
      username: row.white_username as string,
      rating: row.white_rating as number,
      result: row.white_result as string,
    },
    black: {
      username: row.black_username as string,
      rating: row.black_rating as number,
      result: row.black_result as string,
    },
    syncedAt: Number(row.synced_at),
  };
}

export async function getGames(): Promise<ReviewedGame[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM reviewed_games ORDER BY end_time DESC
  `;
  return rows.map(rowToGame);
}

export async function getGameByLichessId(
  lichessId: string
): Promise<ReviewedGame | null> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM reviewed_games WHERE lichess_id = ${lichessId} LIMIT 1
  `;
  if (rows.length === 0) return null;
  return rowToGame(rows[0]);
}

export async function saveGame(game: ReviewedGame): Promise<void> {
  const sql = getDb();
  await sql`
    INSERT INTO reviewed_games (
      chess_com_url, chess_com_uuid, lichess_id, lichess_url, embed_url,
      pgn, time_control, time_class, end_time,
      white_username, white_rating, white_result,
      black_username, black_rating, black_result,
      synced_at
    ) VALUES (
      ${game.chessComUrl}, ${game.chessComUuid}, ${game.lichessId},
      ${game.lichessUrl}, ${game.embedUrl}, ${game.pgn},
      ${game.timeControl}, ${game.timeClass}, ${game.endTime},
      ${game.white.username}, ${game.white.rating}, ${game.white.result},
      ${game.black.username}, ${game.black.rating}, ${game.black.result},
      ${game.syncedAt}
    )
    ON CONFLICT (chess_com_uuid) DO NOTHING
  `;
}

export async function hasGame(chessComUuid: string): Promise<boolean> {
  const sql = getDb();
  const rows = await sql`
    SELECT 1 FROM reviewed_games WHERE chess_com_uuid = ${chessComUuid} LIMIT 1
  `;
  return rows.length > 0;
}

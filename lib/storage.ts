import { neon } from "@neondatabase/serverless";
import type { ReviewedGame } from "@/types";

function getSQL() {
  const url = process.env.POSTGRES_URL;
  if (!url) throw new Error("POSTGRES_URL not configured");
  return neon(url);
}

interface GameRow {
  username: string;
  chess_com_url: string;
  chess_com_uuid: string;
  lichess_id: string;
  lichess_url: string;
  embed_url: string;
  pgn: string;
  time_control: string;
  time_class: string;
  end_time: number;
  white_username: string;
  white_rating: number;
  white_result: string;
  black_username: string;
  black_rating: number;
  black_result: string;
  synced_at: number;
}

function rowToGame(row: GameRow): ReviewedGame {
  return {
    chessComUrl: row.chess_com_url,
    chessComUuid: row.chess_com_uuid,
    lichessId: row.lichess_id,
    lichessUrl: row.lichess_url,
    embedUrl: row.embed_url,
    pgn: row.pgn,
    timeControl: row.time_control,
    timeClass: row.time_class,
    endTime: row.end_time,
    white: {
      username: row.white_username,
      rating: row.white_rating,
      result: row.white_result,
    },
    black: {
      username: row.black_username,
      rating: row.black_rating,
      result: row.black_result,
    },
    syncedAt: row.synced_at,
  };
}

export async function getGames(username: string): Promise<ReviewedGame[]> {
  const sql = getSQL();
  const rows = await sql`SELECT * FROM games WHERE username = ${username} ORDER BY end_time DESC`;
  return (rows as GameRow[]).map(rowToGame);
}

export async function getGameByLichessId(
  lichessId: string
): Promise<ReviewedGame | null> {
  const sql = getSQL();
  const rows = await sql`SELECT * FROM games WHERE lichess_id = ${lichessId} LIMIT 1`;
  return rows.length > 0 ? rowToGame(rows[0] as GameRow) : null;
}

export async function saveGame(
  username: string,
  game: ReviewedGame
): Promise<void> {
  const sql = getSQL();
  await sql`
    INSERT INTO games (
      username, chess_com_url, chess_com_uuid, lichess_id, lichess_url,
      embed_url, pgn, time_control, time_class, end_time,
      white_username, white_rating, white_result,
      black_username, black_rating, black_result, synced_at
    ) VALUES (
      ${username}, ${game.chessComUrl}, ${game.chessComUuid}, ${game.lichessId}, ${game.lichessUrl},
      ${game.embedUrl}, ${game.pgn}, ${game.timeControl}, ${game.timeClass}, ${game.endTime},
      ${game.white.username}, ${game.white.rating}, ${game.white.result},
      ${game.black.username}, ${game.black.rating}, ${game.black.result}, ${game.syncedAt}
    )
    ON CONFLICT (chess_com_uuid) DO NOTHING
  `;
}

export async function hasGame(chessComUuid: string): Promise<boolean> {
  const sql = getSQL();
  const rows = await sql`SELECT 1 FROM games WHERE chess_com_uuid = ${chessComUuid} LIMIT 1`;
  return rows.length > 0;
}

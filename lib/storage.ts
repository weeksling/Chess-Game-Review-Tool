import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import type { ReviewedGame } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const GAMES_FILE = path.join(DATA_DIR, "games.json");

async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
  if (!existsSync(GAMES_FILE)) {
    await writeFile(GAMES_FILE, "[]", "utf-8");
  }
}

export async function getGames(): Promise<ReviewedGame[]> {
  await ensureDataDir();
  const raw = await readFile(GAMES_FILE, "utf-8");
  return JSON.parse(raw) as ReviewedGame[];
}

export async function saveGame(game: ReviewedGame): Promise<void> {
  const games = await getGames();
  games.push(game);
  // Keep sorted by endTime descending (most recent first)
  games.sort((a, b) => b.endTime - a.endTime);
  await writeFile(GAMES_FILE, JSON.stringify(games, null, 2), "utf-8");
}

export async function hasGame(chessComUuid: string): Promise<boolean> {
  const games = await getGames();
  return games.some((g) => g.chessComUuid === chessComUuid);
}

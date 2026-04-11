import type { ReviewedGame } from "@/types";

// Client-side localStorage-backed storage for username and synced games.
// Vercel serverless functions have a read-only filesystem, so the previous
// file-based storage could not persist anything in production. Keeping
// everything in the browser also removes the need for a backend user model.

const USERNAME_KEY = "chess-review:username";
const GAMES_KEY = "chess-review:games";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getUsername(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(USERNAME_KEY);
}

export function setUsername(username: string): void {
  if (!isBrowser()) return;
  localStorage.setItem(USERNAME_KEY, username);
}

export function clearUsername(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(USERNAME_KEY);
}

export function getGames(): ReviewedGame[] {
  if (!isBrowser()) return [];
  const raw = localStorage.getItem(GAMES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ReviewedGame[];
  } catch {
    return [];
  }
}

export function saveGames(games: ReviewedGame[]): void {
  if (!isBrowser()) return;
  const sorted = [...games].sort((a, b) => b.endTime - a.endTime);
  localStorage.setItem(GAMES_KEY, JSON.stringify(sorted));
}

export function mergeGames(
  existing: ReviewedGame[],
  incoming: ReviewedGame[]
): ReviewedGame[] {
  const byUuid = new Map<string, ReviewedGame>();
  for (const g of existing) byUuid.set(g.chessComUuid, g);
  for (const g of incoming) byUuid.set(g.chessComUuid, g);
  return Array.from(byUuid.values()).sort((a, b) => b.endTime - a.endTime);
}

export function getGameById(id: string): ReviewedGame | undefined {
  return getGames().find((g) => g.lichessId === id);
}

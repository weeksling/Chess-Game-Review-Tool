import type {
  ChessComGame,
  ChessComArchiveResponse,
  ChessComArchivesResponse,
} from "@/types";

const BASE_URL = "https://api.chess.com/pub";
const USER_AGENT = "ChessGameReviewApp/0.1 (personal review tool)";

async function fetchApi<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) {
    throw new Error(`Chess.com API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function getRecentGames(
  username: string,
  count: number = 10
): Promise<ChessComGame[]> {
  // Get the list of monthly archives
  const { archives } = await fetchApi<ChessComArchivesResponse>(
    `${BASE_URL}/player/${username.toLowerCase()}/games/archives`
  );

  if (archives.length === 0) {
    return [];
  }

  // Fetch the most recent month (and previous month if we need more games)
  const allGames: ChessComGame[] = [];

  for (let i = archives.length - 1; i >= Math.max(0, archives.length - 2); i--) {
    const { games } = await fetchApi<ChessComArchiveResponse>(archives[i]);
    allGames.push(...games);
    if (allGames.length >= count) break;
  }

  // Sort by end_time descending (most recent first) and take the requested count
  return allGames
    .sort((a, b) => b.end_time - a.end_time)
    .slice(0, count);
}

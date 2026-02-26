"use client";

import { useCallback, useEffect, useState } from "react";
import { GameCard } from "@/components/GameCard";
import type { ReviewedGame } from "@/types";

const USERNAME = process.env.NEXT_PUBLIC_CHESS_COM_USERNAME ?? "anewmatt";

export default function HomePage() {
  const [games, setGames] = useState<ReviewedGame[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadGames = useCallback(async () => {
    try {
      const res = await fetch("/api/games");
      if (res.ok) {
        setGames(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  async function handleSync() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setSyncResult(`Error: ${data.error}`);
      } else {
        const parts = [`Synced ${data.synced} new game(s)`];
        if (data.skipped > 0) parts.push(`${data.skipped} already imported`);
        if (data.errors?.length > 0)
          parts.push(`${data.errors.length} error(s)`);
        setSyncResult(parts.join(" · "));
        await loadGames();
      }
    } catch (err) {
      setSyncResult(`Network error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div>
      {/* Header section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Recent Games</h1>
          <p className="text-sm text-gray-400 mt-1">
            Games for{" "}
            <a
              href={`https://www.chess.com/member/${USERNAME}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              {USERNAME}
            </a>
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-400 text-sm font-medium transition-colors"
        >
          {syncing ? "Syncing..." : "Sync Now"}
        </button>
      </div>

      {/* Sync status */}
      {syncResult && (
        <div
          className={`mb-4 text-sm px-3 py-2 rounded ${
            syncResult.startsWith("Error")
              ? "bg-red-900/30 text-red-300"
              : "bg-green-900/30 text-green-300"
          }`}
        >
          {syncResult}
        </div>
      )}

      {/* Game list */}
      {loading ? (
        <p className="text-gray-500">Loading games...</p>
      ) : games.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No games synced yet</p>
          <p className="mt-2 text-sm">
            Click &quot;Sync Now&quot; to import your recent Chess.com games
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {games.map((game) => (
            <GameCard key={game.lichessId} game={game} username={USERNAME} />
          ))}
        </div>
      )}
    </div>
  );
}

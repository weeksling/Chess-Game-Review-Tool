"use client";

import { useCallback, useEffect, useState } from "react";
import { GameCard } from "@/components/GameCard";
import {
  getUsername,
  setUsername as saveUsername,
  clearUsername,
  getGames,
  mergeGames,
  saveGames,
} from "@/lib/storage";
import type { ReviewedGame } from "@/types";

export default function HomePage() {
  const [username, setUsernameState] = useState<string | null>(null);
  const [games, setGames] = useState<ReviewedGame[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");

  useEffect(() => {
    setUsernameState(getUsername());
    setGames(getGames());
    setHydrated(true);
  }, []);

  const handleSaveUsername = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const name = usernameInput.trim();
      if (!name) return;
      saveUsername(name);
      setUsernameState(name);
      setSyncResult(null);
    },
    [usernameInput]
  );

  const handleChangeUsername = useCallback(() => {
    clearUsername();
    setUsernameState(null);
    setUsernameInput("");
    setSyncResult(null);
  }, []);

  async function handleSync() {
    if (!username) return;
    setSyncing(true);
    setSyncResult(null);
    try {
      const existing = getGames();
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          existingUuids: existing.map((g) => g.chessComUuid),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSyncResult(`Error: ${data.error}`);
      } else {
        const merged = mergeGames(existing, data.games ?? []);
        saveGames(merged);
        setGames(merged);

        const parts = [`Synced ${data.synced} new game(s)`];
        if (data.skipped > 0) parts.push(`${data.skipped} already imported`);
        if (data.errors?.length > 0)
          parts.push(`${data.errors.length} error(s)`);
        setSyncResult(parts.join(" · "));
      }
    } catch (err) {
      setSyncResult(
        `Network error: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      setSyncing(false);
    }
  }

  if (!hydrated) {
    return <p className="text-gray-500">Loading...</p>;
  }

  // Welcome / username prompt
  if (!username) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <h1 className="text-2xl font-bold mb-2">Welcome</h1>
        <p className="text-sm text-gray-400 mb-6">
          Enter your Chess.com username to import your recent games and review
          them with Lichess analysis.
        </p>
        <form onSubmit={handleSaveUsername} className="space-y-3">
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-gray-500">
              Chess.com Username
            </span>
            <input
              type="text"
              autoFocus
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="e.g. hikaru"
              className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 focus:border-blue-500 focus:outline-none text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={!usernameInput.trim()}
            className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 text-sm font-medium transition-colors"
          >
            Continue
          </button>
        </form>
        <p className="text-xs text-gray-600 mt-6">
          Your username and synced games are saved only in this browser. No
          account needed.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header section */}
      <div className="flex items-center justify-between mb-6 gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">Recent Games</h1>
          <p className="text-sm text-gray-400 mt-1">
            Games for{" "}
            <a
              href={`https://www.chess.com/member/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              {username}
            </a>
            {" · "}
            <button
              onClick={handleChangeUsername}
              className="text-gray-500 hover:text-gray-300 underline"
            >
              change
            </button>
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-400 text-sm font-medium transition-colors shrink-0"
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
      {games.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No games synced yet</p>
          <p className="mt-2 text-sm">
            Click &quot;Sync Now&quot; to import your recent Chess.com games
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {games.map((game) => (
            <GameCard key={game.lichessId} game={game} username={username} />
          ))}
        </div>
      )}
    </div>
  );
}

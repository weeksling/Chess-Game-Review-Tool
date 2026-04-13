"use client";

import { useCallback, useEffect, useState } from "react";
import { GameCard } from "@/components/GameCard";
import { SettingsPanel } from "@/components/SettingsPanel";
import { useSettings } from "@/lib/hooks/use-settings";
import type { ReviewedGame } from "@/types";

export default function HomePage() {
  const { settings, loaded, updateSettings } = useSettings();
  const [games, setGames] = useState<ReviewedGame[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const username = settings.chessComUsername;

  const loadGames = useCallback(async () => {
    if (!username) {
      setGames([]);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/games?username=${encodeURIComponent(username)}`);
      if (res.ok) {
        setGames(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    if (loaded) loadGames();
  }, [loaded, loadGames]);

  async function handleSync() {
    if (!username) return;
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
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

  // Show loading state while settings hydrate from localStorage
  if (!loaded) return null;

  // Show settings if no username configured or user opened settings
  if (!username || showSettings) {
    return (
      <div className="max-w-md mx-auto mt-8">
        {!username && (
          <p className="text-gray-400 text-sm mb-4">
            Set your Chess.com username to get started.
          </p>
        )}
        <SettingsPanel
          settings={settings}
          onSave={(updates) => {
            updateSettings(updates);
            setShowSettings(false);
          }}
          onClose={username ? () => setShowSettings(false) : undefined}
        />
      </div>
    );
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
              href={`https://www.chess.com/member/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              {username}
            </a>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="px-3 py-2 rounded-lg border border-gray-700 hover:border-gray-500 text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            Settings
          </button>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-400 text-sm font-medium transition-colors"
          >
            {syncing ? "Syncing..." : "Sync Now"}
          </button>
        </div>
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
            <GameCard key={game.lichessId} game={game} username={username} />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import type { UserSettings } from "@/lib/hooks/use-settings";

interface SettingsPanelProps {
  settings: UserSettings;
  onSave: (updates: Partial<UserSettings>) => void;
  onClose?: () => void;
}

export function SettingsPanel({ settings, onSave, onClose }: SettingsPanelProps) {
  const [username, setUsername] = useState(settings.chessComUsername);

  function handleSave() {
    onSave({ chessComUsername: username.trim() });
    onClose?.();
  }

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Settings</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-sm"
          >
            Close
          </button>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="username" className="block text-sm font-medium text-gray-300">
          Chess.com Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. anewmatt"
          className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={!username.trim()}
        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-400 text-sm font-medium transition-colors"
      >
        Save
      </button>
    </div>
  );
}

import { useCallback, useEffect, useState } from "react";

export interface UserSettings {
  chessComUsername: string;
}

const STORAGE_KEY = "chess-review-settings";

const defaults: UserSettings = {
  chessComUsername: "",
};

function load(): UserSettings {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(defaults);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSettings(load());
    setLoaded(true);
  }, []);

  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearSettings = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSettings(defaults);
  }, []);

  return { settings, loaded, updateSettings, clearSettings };
}

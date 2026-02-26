import { initialize, gameImport } from "equine";

let initialized = false;

function ensureInitialized() {
  if (initialized) return;
  const token = process.env.LICHESS_API_TOKEN;
  if (token) {
    initialize(token);
  }
  initialized = true;
}

export interface ImportResult {
  id: string;
  url: string;
  embedUrl: string;
}

export async function importGame(pgn: string): Promise<ImportResult> {
  ensureInitialized();

  const response = await gameImport({ body: { pgn } });

  const id = response.data?.id;
  const url = response.data?.url;

  if (!id || !url) {
    throw new Error(
      `Lichess import failed: ${JSON.stringify(response.error ?? "no id/url returned")}`
    );
  }

  return {
    id,
    url,
    embedUrl: `https://lichess.org/embed/game/${id}?theme=auto&bg=auto`,
  };
}

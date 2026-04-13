import { initialize, gameImport } from "equine";

export interface ImportResult {
  id: string;
  url: string;
  embedUrl: string;
}

export async function importGame(pgn: string): Promise<ImportResult> {
  const token = process.env.LICHESS_API_TOKEN;
  if (token) {
    initialize(token);
  }

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

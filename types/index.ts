export interface ChessComPlayer {
  username: string;
  rating: number;
  result: string;
  "@id": string;
  uuid: string;
}

export interface ChessComGame {
  url: string;
  uuid: string;
  pgn: string;
  time_control: string;
  time_class: "daily" | "rapid" | "blitz" | "bullet";
  rated: boolean;
  end_time: number;
  fen: string;
  rules: string;
  white: ChessComPlayer;
  black: ChessComPlayer;
}

export interface ChessComArchiveResponse {
  games: ChessComGame[];
}

export interface ChessComArchivesResponse {
  archives: string[];
}

export interface ReviewedGame {
  chessComUrl: string;
  chessComUuid: string;
  lichessId: string;
  lichessUrl: string;
  embedUrl: string;
  pgn: string;
  timeControl: string;
  timeClass: string;
  endTime: number;
  white: { username: string; rating: number; result: string };
  black: { username: string; rating: number; result: string };
  syncedAt: number;
}

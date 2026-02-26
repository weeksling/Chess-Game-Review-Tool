import type { ReviewedGame } from "@/types";
import Link from "next/link";

function resultLabel(result: string): string {
  switch (result) {
    case "win":
      return "Won";
    case "checkmated":
    case "timeout":
    case "resigned":
    case "lose":
    case "abandoned":
      return "Lost";
    case "agreed":
    case "repetition":
    case "stalemate":
    case "insufficient":
    case "50move":
    case "timevsinsufficient":
      return "Draw";
    default:
      return result;
  }
}

function resultColor(result: string): string {
  const label = resultLabel(result);
  if (label === "Won") return "text-green-400";
  if (label === "Lost") return "text-red-400";
  return "text-yellow-400";
}

function timeClassBadge(timeClass: string): string {
  switch (timeClass) {
    case "bullet":
      return "bg-red-900/50 text-red-300";
    case "blitz":
      return "bg-yellow-900/50 text-yellow-300";
    case "rapid":
      return "bg-blue-900/50 text-blue-300";
    case "daily":
      return "bg-green-900/50 text-green-300";
    default:
      return "bg-gray-800 text-gray-300";
  }
}

export function GameCard({
  game,
  username,
}: {
  game: ReviewedGame;
  username: string;
}) {
  const isWhite = game.white.username.toLowerCase() === username.toLowerCase();
  const player = isWhite ? game.white : game.black;
  const opponent = isWhite ? game.black : game.white;
  const playerColor = isWhite ? "White" : "Black";
  const playerResult = resultLabel(player.result);

  const date = new Date(game.endTime * 1000);
  const dateStr = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Link
      href={`/review/${game.lichessId}`}
      className="block rounded-lg border border-gray-800 bg-gray-900 p-4 hover:border-gray-600 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Players */}
          <div className="text-sm">
            <span className="font-semibold">{player.username}</span>
            <span className="text-gray-400"> ({player.rating})</span>
            <span className="text-gray-500 mx-2">vs</span>
            <span className="font-semibold">{opponent.username}</span>
            <span className="text-gray-400"> ({opponent.rating})</span>
          </div>

          {/* Result & color */}
          <div className="mt-1 flex items-center gap-2 text-sm">
            <span className={`font-medium ${resultColor(player.result)}`}>
              {playerResult}
            </span>
            <span className="text-gray-600">as {playerColor}</span>
          </div>
        </div>

        {/* Right side badges */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded ${timeClassBadge(game.timeClass)}`}
          >
            {game.timeClass}
          </span>
          <span className="text-xs text-gray-500">{dateStr}</span>
        </div>
      </div>

      {/* Links */}
      <div className="mt-3 flex gap-3 text-xs">
        <span className="text-blue-400 hover:underline">
          Lichess Analysis &rarr;
        </span>
      </div>
    </Link>
  );
}

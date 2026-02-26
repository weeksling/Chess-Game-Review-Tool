import { getGames } from "@/lib/storage";
import { AnalysisBoard } from "@/components/AnalysisBoard";
import Link from "next/link";
import { notFound } from "next/navigation";

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

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const games = await getGames();
  const game = games.find((g) => g.lichessId === id);

  if (!game) {
    notFound();
  }

  const date = new Date(game.endTime * 1000);

  return (
    <div>
      <Link
        href="/"
        className="text-sm text-gray-400 hover:text-gray-200 mb-6 inline-block"
      >
        &larr; Back to games
      </Link>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        {/* Analysis board */}
        <AnalysisBoard embedUrl={game.embedUrl} lichessUrl={game.lichessUrl} />

        {/* Game details */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Game Details</h2>

          <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 space-y-3 text-sm">
            <div>
              <div className="text-gray-500 text-xs uppercase tracking-wide">
                White
              </div>
              <div className="font-medium">
                {game.white.username}{" "}
                <span className="text-gray-400">({game.white.rating})</span>
                <span className="ml-2 text-xs">
                  {resultLabel(game.white.result)}
                </span>
              </div>
            </div>

            <div>
              <div className="text-gray-500 text-xs uppercase tracking-wide">
                Black
              </div>
              <div className="font-medium">
                {game.black.username}{" "}
                <span className="text-gray-400">({game.black.rating})</span>
                <span className="ml-2 text-xs">
                  {resultLabel(game.black.result)}
                </span>
              </div>
            </div>

            <div>
              <div className="text-gray-500 text-xs uppercase tracking-wide">
                Time Control
              </div>
              <div className="capitalize">{game.timeClass} ({game.timeControl})</div>
            </div>

            <div>
              <div className="text-gray-500 text-xs uppercase tracking-wide">
                Played
              </div>
              <div>
                {date.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <a
              href={game.lichessUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-400 hover:underline"
            >
              Open on Lichess &rarr;
            </a>
            <a
              href={game.chessComUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-400 hover:underline"
            >
              View on Chess.com &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

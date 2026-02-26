export function AnalysisBoard({
  embedUrl,
  lichessUrl,
}: {
  embedUrl: string;
  lichessUrl: string;
}) {
  return (
    <div>
      <div className="aspect-square w-full max-w-[600px] rounded-lg overflow-hidden border border-gray-800">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allowFullScreen
          title="Lichess Analysis Board"
        />
      </div>
      <div className="mt-2">
        <a
          href={lichessUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-400 hover:underline"
        >
          Open full analysis on Lichess &rarr;
        </a>
      </div>
    </div>
  );
}

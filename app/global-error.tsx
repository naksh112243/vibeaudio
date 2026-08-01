'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">VibeAudio Application Error</h2>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-orange-600 rounded text-sm font-medium text-white hover:bg-orange-500"
          >
            Reset Application
          </button>
        </div>
      </body>
    </html>
  );
}

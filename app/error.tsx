'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Router error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <h2 className="text-xl font-bold text-foreground">Something went wrong!</h2>
      <button
        onClick={() => reset()}
        className="mt-4 rounded bg-primary px-4 py-2 text-sm font-medium text-white"
      >
        Try again
      </button>
    </div>
  );
}

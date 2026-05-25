'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Home, RefreshCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-2xl rounded-xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-2xl font-semibold">Algo deu errado</h1>
        <p className="mt-2 text-white/70">Um erro inesperado ocorreu.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-md bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
          >
            <RefreshCcw className="h-4 w-4" /> Tentar novamente
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
          >
            <Home className="h-4 w-4" /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}

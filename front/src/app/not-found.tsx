import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-2xl rounded-xl border border-white/10 bg-white/5 p-8">
        <div className="text-sm text-white/60">404</div>
        <h1 className="mt-2 text-2xl font-semibold">Pagina nao encontrada</h1>
        <p className="mt-2 text-white/70">A rota nao existe.</p>
        <div className="mt-6">
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

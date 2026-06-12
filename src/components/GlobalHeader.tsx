import Link from 'next/link';

export default function GlobalHeader() {
  return (
    <header className="sticky top-0 w-full z-50 border-b border-white/5 backdrop-blur-md bg-black/75">
      <div className="w-full px-6 lg:px-12 xl:px-16 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="transition-opacity hover:opacity-80 font-bold text-white text-lg">
            Pintores
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold text-slate-200 hover:text-white px-3 sm:px-4 py-2 whitespace-nowrap">
            Entrar
          </Link>
        </div>
      </div>
    </header>
  );
}

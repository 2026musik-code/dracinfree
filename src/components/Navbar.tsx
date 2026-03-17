import { Film, Search, Menu, User, Sparkles } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-40 w-full border-b border-white/5 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-lg shadow-amber-500/20">
            <Film size={24} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            DRACIN<span className="text-amber-500">FREE</span>
          </span>
        </div>

        <div className="hidden flex-1 items-center justify-center px-8 md:flex">
          <div className="relative w-full max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search size={18} className="text-zinc-500" />
            </div>
            <input
              type="text"
              className="block w-full rounded-full border border-zinc-800 bg-zinc-900/50 py-2.5 pl-11 pr-4 text-sm text-white placeholder-zinc-500 transition-colors focus:border-amber-500/50 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              placeholder="Cari drama favoritmu..."
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-500 transition-colors hover:bg-amber-500 hover:text-black sm:flex">
            <Sparkles size={16} />
            Premium
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white">
            <User size={20} />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white md:hidden">
            <Menu size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}

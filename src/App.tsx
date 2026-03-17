import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, AlertCircle, Film } from 'lucide-react';
import ApiKeyModal from './components/ApiKeyModal';
import DramaCard from './components/DramaCard';
import Navbar from './components/Navbar';
import { ApiResponse, Drama } from './types';

export default function App() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [dramas, setDramas] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for saved API key on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('dracin_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  // Fetch data when API key changes
  useEffect(() => {
    if (!apiKey) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://api.ferdev.my.id/internet/dramabox/home?apikey=${apiKey}`);
        if (!response.ok) {
          throw new Error('Gagal mengambil data dari server');
        }
        const result: ApiResponse = await response.json();
        
        if (result.success && result.data?.latest) {
          setDramas(result.data.latest);
        } else {
          throw new Error('Format data tidak sesuai atau API Key salah');
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui');
        // If it's an API key error, we might want to clear it so they can try again
        if (err instanceof Error && err.message.includes('API Key')) {
          localStorage.removeItem('dracin_api_key');
          setApiKey(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiKey]);

  const handleSaveKey = (key: string) => {
    localStorage.setItem('dracin_api_key', key);
    setApiKey(key);
  };

  const handleLogout = () => {
    localStorage.removeItem('dracin_api_key');
    setApiKey(null);
    setDramas([]);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 selection:bg-amber-500/30">
      <AnimatePresence>
        {!apiKey && <ApiKeyModal onSave={handleSaveKey} />}
      </AnimatePresence>

      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Rilis Terbaru
            </h1>
            <p className="mt-2 text-zinc-400">
              Koleksi drama China premium dengan subtitle Indonesia.
            </p>
          </div>
          {apiKey && (
            <button
              onClick={handleLogout}
              className="hidden rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white sm:block"
            >
              Ganti API Key
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
            <p className="text-sm font-medium text-zinc-500 animate-pulse">Memuat koleksi premium...</p>
          </div>
        ) : error ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
            <div className="rounded-full bg-red-500/10 p-4 text-red-500">
              <AlertCircle size={32} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Terjadi Kesalahan</h3>
              <p className="mt-2 max-w-md text-sm text-zinc-400">{error}</p>
            </div>
            <button
              onClick={() => setApiKey(null)}
              className="mt-4 rounded-lg bg-zinc-800 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
            >
              Masukkan Ulang API Key
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:gap-6">
            <AnimatePresence>
              {dramas.map((drama, index) => (
                <DramaCard key={index} drama={drama} index={index} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && !error && dramas.length === 0 && apiKey && (
          <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
            <div className="rounded-full bg-zinc-900 p-6 text-zinc-600">
              <Film size={48} />
            </div>
            <h3 className="mt-6 text-xl font-semibold text-white">Belum ada drama</h3>
            <p className="mt-2 text-zinc-500">Koleksi terbaru akan segera hadir.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-white/5 bg-black/50 py-12 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 opacity-50">
            <Film size={20} />
            <span className="font-bold tracking-tight">DRACINFREE</span>
          </div>
          <p className="mt-4 text-sm text-zinc-500">
            &copy; {new Date().getFullYear()} Dracin Free Premium. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { KeyRound, Lock } from 'lucide-react';

interface ApiKeyModalProps {
  onSave: (key: string) => void;
}

export default function ApiKeyModal({ onSave }: ApiKeyModalProps) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) {
      setError('API Key tidak boleh kosong');
      return;
    }
    onSave(key.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-amber-500/20 bg-zinc-950 shadow-2xl shadow-amber-500/10"
      >
        <div className="p-8">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
            <Lock size={32} />
          </div>
          
          <h2 className="mb-2 text-center text-2xl font-bold tracking-tight text-white">
            Akses Premium
          </h2>
          <p className="mb-8 text-center text-sm text-zinc-400">
            Masukkan API Key Anda untuk mengakses koleksi Dracin eksklusif.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <KeyRound size={18} className="text-zinc-500" />
                </div>
                <input
                  type="text"
                  value={key}
                  onChange={(e) => {
                    setKey(e.target.value);
                    setError('');
                  }}
                  className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 pl-11 text-white placeholder-zinc-500 transition-colors focus:border-amber-500 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="Masukkan API Key..."
                />
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-500">{error}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 px-4 py-4 font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:from-amber-500 hover:to-amber-400 hover:shadow-amber-500/40 active:scale-[0.98]"
            >
              Buka Akses
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { Film } from 'lucide-react';
import ApiKeyModal from './components/ApiKeyModal';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Detail from './pages/Detail';
import Player from './pages/Player';

export default function App() {
  const [apiKey, setApiKey] = useState<string | null>(null);

  // Check for saved API key on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('dracin_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSaveKey = (key: string) => {
    localStorage.setItem('dracin_api_key', key);
    setApiKey(key);
  };

  const handleLogout = () => {
    localStorage.removeItem('dracin_api_key');
    setApiKey(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-black text-zinc-100 selection:bg-amber-500/30">
        <AnimatePresence>
          {!apiKey && <ApiKeyModal onSave={handleSaveKey} />}
        </AnimatePresence>

        <Navbar />

        {apiKey && (
          <Routes>
            <Route path="/" element={<Home apiKey={apiKey} onLogout={handleLogout} />} />
            <Route path="/detail/:bookId" element={<Detail apiKey={apiKey} />} />
            <Route path="/play/:bookId/:episode" element={<Player apiKey={apiKey} />} />
          </Routes>
        )}

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
    </Router>
  );
}

import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Loader2, AlertCircle, ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, SkipForward, SkipBack } from 'lucide-react';
import { StreamResponse, StreamData } from '../types';

interface PlayerProps {
  apiKey: string;
}

export default function Player({ apiKey }: PlayerProps) {
  const { bookId, episode } = useParams<{ bookId: string; episode: string }>();
  const navigate = useNavigate();
  const [streamData, setStreamData] = useState<StreamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!bookId || !episode || !apiKey) return;

    const fetchStream = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://api.ferdev.my.id/internet/dramabox/stream?bookId=${bookId}&episode=${episode}&apikey=${apiKey}`);
        if (!response.ok) {
          throw new Error('Gagal mengambil video stream');
        }
        const result: StreamResponse = await response.json();
        
        if (result.success && result.data) {
          setStreamData(result.data);
        } else {
          throw new Error('Video tidak ditemukan atau API Key salah');
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };

    fetchStream();
  }, [bookId, episode, apiKey]);

  const handleNextEpisode = () => {
    if (episode && bookId) {
      const nextEp = parseInt(episode) + 1;
      navigate(`/play/${bookId}/${nextEp}`);
    }
  };

  const handlePrevEpisode = () => {
    if (episode && bookId) {
      const prevEp = parseInt(episode) - 1;
      if (prevEp > 0) {
        navigate(`/play/${bookId}/${prevEp}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
        <p className="text-sm font-medium text-zinc-500 animate-pulse">Menyiapkan pemutar video...</p>
      </div>
    );
  }

  if (error || !streamData) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Link to={`/detail/${bookId}`} className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white">
          <ArrowLeft size={16} /> Kembali ke Detail
        </Link>
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <div className="rounded-full bg-red-500/10 p-4 text-red-500">
            <AlertCircle size={32} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Gagal Memuat Video</h3>
            <p className="mt-2 text-sm text-zinc-400">{error || 'Video tidak ditemukan'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <div className="mb-6 flex items-center justify-between">
        <Link to={`/detail/${bookId}`} className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-amber-500">
          <ArrowLeft size={16} /> Kembali ke Detail
        </Link>
        <div className="text-sm font-medium text-zinc-500">
          Episode <span className="text-amber-500">{episode}</span>
        </div>
      </div>

      <div className="relative mx-auto aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl shadow-amber-500/10 ring-1 ring-white/10">
        <video
          ref={videoRef}
          src={streamData.video_url}
          controls
          autoPlay
          className="h-full w-full object-contain"
          controlsList="nodownload"
        >
          Browser Anda tidak mendukung tag video.
        </video>
      </div>

      <div className="mt-8 flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div>
          <h2 className="text-xl font-bold text-white">Episode {episode}</h2>
          <p className="mt-1 text-sm text-zinc-400">Putar otomatis ke episode selanjutnya saat selesai</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handlePrevEpisode}
            disabled={parseInt(episode || '1') <= 1}
            className="flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 disabled:hover:bg-zinc-800"
          >
            <SkipBack size={18} />
            <span className="hidden sm:inline">Sebelumnya</span>
          </button>
          
          <button 
            onClick={handleNextEpisode}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-amber-500/25 transition-all hover:from-amber-500 hover:to-amber-400 hover:shadow-amber-500/40"
          >
            <span className="hidden sm:inline">Selanjutnya</span>
            <SkipForward size={18} />
          </button>
        </div>
      </div>
    </motion.main>
  );
}

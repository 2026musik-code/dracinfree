import { useEffect, useState, useRef, SyntheticEvent } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Loader2, AlertCircle, ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, SkipForward, SkipBack, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { StreamResponse, StreamData, DetailResponse, DramaDetail, Episode } from '../types';

interface PlayerProps {
  apiKey: string;
}

export default function Player({ apiKey }: PlayerProps) {
  const { bookId, videoId } = useParams<{ bookId: string; videoId: string }>();
  const [searchParams] = useSearchParams();
  const episode = searchParams.get('ep') || '1';
  
  const navigate = useNavigate();
  const [streamData, setStreamData] = useState<StreamData | null>(null);
  const [detail, setDetail] = useState<DramaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVideoEncrypted, setIsVideoEncrypted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!bookId || !videoId || !apiKey) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setIsVideoEncrypted(false);
      try {
        // Fetch detail to get episode list for next/prev
        const detailRes = await fetch(`https://api.ferdev.my.id/internet/melolo/detail?bookId=${bookId}&apikey=${apiKey}`);
        if (!detailRes.ok) throw new Error('Gagal mengambil detail drama');
        const detailResult: DetailResponse = await detailRes.json();
        
        if (detailResult.success && detailResult.result) {
          setDetail(detailResult.result);
        }

        // Fetch stream
        const streamRes = await fetch(`https://api.ferdev.my.id/internet/melolo/stream?videoId=${videoId}&apikey=${apiKey}`);
        if (!streamRes.ok) throw new Error('Gagal mengambil video stream');
        const streamResult: StreamResponse = await streamRes.json();
        
        if (streamResult.success && streamResult.result && streamResult.result.length > 0) {
          // Find best quality
          const bestQuality = streamResult.result.find(r => r.quality === '720p') 
            || streamResult.result.find(r => r.quality === '540p') 
            || streamResult.result[0];
          setStreamData(bestQuality);
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

    fetchData();
  }, [bookId, videoId, apiKey]);

  const handleNextEpisode = () => {
    if (detail && videoId) {
      const currentIndex = detail.episodes.findIndex(ep => ep.video_id === videoId);
      if (currentIndex !== -1 && currentIndex < detail.episodes.length - 1) {
        const nextEp = detail.episodes[currentIndex + 1];
        navigate(`/play/${bookId}/${nextEp.video_id}?ep=${nextEp.episode}`);
      }
    }
  };

  const handlePrevEpisode = () => {
    if (detail && videoId) {
      const currentIndex = detail.episodes.findIndex(ep => ep.video_id === videoId);
      if (currentIndex > 0) {
        const prevEp = detail.episodes[currentIndex - 1];
        navigate(`/play/${bookId}/${prevEp.video_id}?ep=${prevEp.episode}`);
      }
    }
  };

  const handleVideoError = (e: SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    const error = video.error;
    
    if (error) {
      if (error.code === error.MEDIA_ERR_DECODE) {
        setIsVideoEncrypted(true);
      } else {
        let errorMessage = 'Terjadi kesalahan saat memutar video.';
        switch (error.code) {
          case error.MEDIA_ERR_ABORTED:
            errorMessage = 'Pemutaran video dibatalkan.';
            break;
          case error.MEDIA_ERR_NETWORK:
            errorMessage = 'Terjadi kesalahan jaringan. Silakan periksa koneksi internet Anda.';
            break;
          case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Format video tidak didukung atau URL tidak valid.';
            break;
        }
        toast.error(errorMessage, { duration: 5000 });
      }
    }
  };

  const handleEncrypted = () => {
    console.warn('Video is DRM encrypted');
    setIsVideoEncrypted(true);
  };

  const handleStalled = () => {
    if (!isVideoEncrypted) {
      toast.loading('Koneksi lambat, sedang memuat video...', { id: 'stalled', duration: 3000 });
    }
  };

  const handlePlaying = () => {
    toast.dismiss('stalled');
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

  const currentIndex = detail?.episodes.findIndex(ep => ep.video_id === videoId) ?? -1;
  const hasNext = detail ? currentIndex !== -1 && currentIndex < detail.episodes.length - 1 : false;
  const hasPrev = detail ? currentIndex > 0 : false;

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
        {isVideoEncrypted ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-900/95 p-6 text-center backdrop-blur-sm">
            <div className="mb-4 rounded-full bg-red-500/10 p-4 text-red-500 ring-1 ring-red-500/20">
              <Lock size={32} />
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">Video Terkunci (DRM)</h3>
            <p className="max-w-md text-sm text-zinc-400">
              Mohon maaf, video ini dienkripsi secara eksklusif oleh penyedia dan tidak dapat diputar di luar aplikasi resmi mereka.
            </p>
            <p className="mt-4 text-xs text-zinc-500">
              URL Sumber: <span className="font-mono opacity-50">...{streamData.url.split('/').pop()?.split('?')[0]}</span>
            </p>
          </div>
        ) : null}
        
        <video
          key={streamData.url}
          ref={videoRef}
          src={streamData.url}
          controls={!isVideoEncrypted}
          playsInline
          onEnded={handleNextEpisode}
          onError={handleVideoError}
          onEncrypted={handleEncrypted}
          onStalled={handleStalled}
          onWaiting={() => {
            if (!isVideoEncrypted) toast.loading('Memuat data video...', { id: 'waiting', duration: 2000 });
          }}
          onPlaying={() => {
            toast.dismiss('stalled');
            toast.dismiss('waiting');
          }}
          onPause={() => console.log('Video paused')}
          referrerPolicy="no-referrer"
          className={`h-full w-full object-contain ${isVideoEncrypted ? 'opacity-0' : 'opacity-100'}`}
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
            disabled={!hasPrev}
            className="flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 disabled:hover:bg-zinc-800"
          >
            <SkipBack size={18} />
            <span className="hidden sm:inline">Sebelumnya</span>
          </button>
          
          <button 
            onClick={handleNextEpisode}
            disabled={!hasNext}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-amber-500/25 transition-all hover:from-amber-500 hover:to-amber-400 hover:shadow-amber-500/40 disabled:opacity-50 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 disabled:shadow-none"
          >
            <span className="hidden sm:inline">Selanjutnya</span>
            <SkipForward size={18} />
          </button>
        </div>
      </div>
    </motion.main>
  );
}

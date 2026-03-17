import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Loader2, AlertCircle, Play, ArrowLeft, Calendar, ListVideo } from 'lucide-react';
import { DetailResponse, DramaDetail } from '../types';
import HeicImage from '../components/HeicImage';

interface DetailProps {
  apiKey: string;
}

export default function Detail({ apiKey }: DetailProps) {
  const { bookId } = useParams<{ bookId: string }>();
  const [detail, setDetail] = useState<DramaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookId || !apiKey) return;

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://api.ferdev.my.id/internet/melolo/detail?bookId=${bookId}&apikey=${apiKey}`);
        if (!response.ok) {
          throw new Error('Gagal mengambil detail drama');
        }
        const result: DetailResponse = await response.json();
        
        if (result.success && result.result) {
          setDetail(result.result);
        } else {
          throw new Error('Drama tidak ditemukan atau API Key salah');
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [bookId, apiKey]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
        <p className="text-sm font-medium text-zinc-500 animate-pulse">Memuat detail drama...</p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white">
          <ArrowLeft size={16} /> Kembali ke Beranda
        </Link>
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <div className="rounded-full bg-red-500/10 p-4 text-red-500">
            <AlertCircle size={32} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Gagal Memuat</h3>
            <p className="mt-2 text-sm text-zinc-400">{error || 'Drama tidak ditemukan'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-amber-500">
        <ArrowLeft size={16} /> Kembali ke Beranda
      </Link>

      <div className="grid gap-8 md:grid-cols-[300px_1fr] lg:gap-12">
        {/* Poster */}
        <div className="relative mx-auto w-full max-w-[300px] overflow-hidden rounded-2xl shadow-2xl shadow-amber-500/10 md:mx-0">
          <div className="aspect-[3/4] w-full bg-zinc-900">
            <HeicImage 
              src={detail.cover} 
              alt={detail.title} 
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {detail.title}
          </h1>
          
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-400">
            <div className="flex items-center gap-1.5 rounded-full bg-zinc-900 px-3 py-1">
              <ListVideo size={16} className="text-amber-500" />
              <span>{detail.total_episodes}</span>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-white">Sinopsis</h3>
            <p className="mt-2 leading-relaxed text-zinc-400">
              {detail.intro}
            </p>
          </div>

          {/* Episode List */}
          <div className="mt-10 flex-1">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Daftar Episode</h3>
              <span className="text-sm text-zinc-500">{detail.episodes.length} Episode</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {detail.episodes.map((ep) => (
                <Link
                  key={ep.video_id}
                  to={`/play/${bookId}/${ep.video_id}?ep=${ep.episode}`}
                  className="group relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all hover:border-amber-500/50 hover:bg-zinc-800 hover:shadow-lg hover:shadow-amber-500/10"
                >
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 transition-colors group-hover:bg-amber-500 group-hover:text-white">
                    <Play size={18} className="ml-1" fill="currentColor" />
                  </div>
                  <span className="text-sm font-medium text-zinc-300 group-hover:text-white">
                    Episode {ep.episode}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.main>
  );
}

import { motion } from 'motion/react';
import { Play, Eye, ListVideo } from 'lucide-react';
import { Drama } from '../types';
import HeicImage from './HeicImage';

interface DramaCardProps {
  drama: Drama;
  index: number;
}

export default function DramaCard({ drama, index }: DramaCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-zinc-900/50 shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/10"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-800">
        <HeicImage
          src={drama.cover}
          alt={drama.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/90 text-white shadow-lg shadow-amber-500/50 backdrop-blur-sm transition-transform hover:scale-110">
            <Play fill="currentColor" size={24} className="ml-1" />
          </div>
        </div>

        {/* Badges */}
        <div className="absolute left-3 top-3 flex gap-2">
          {drama.total_chapters && (
            <div className="flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-amber-400 backdrop-blur-md">
              <ListVideo size={12} />
              <span>{drama.total_chapters} Ep</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <h3 className="line-clamp-2 text-base font-semibold leading-tight text-white transition-colors group-hover:text-amber-400">
          {drama.title}
        </h3>
        
        <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1">
            <Eye size={14} />
            <span>{drama.status || 'N/A'}</span>
          </div>
          <button className="rounded-full bg-zinc-800 px-3 py-1.5 font-medium text-white transition-colors hover:bg-amber-500 hover:text-white">
            Tonton
          </button>
        </div>
      </div>
    </motion.div>
  );
}

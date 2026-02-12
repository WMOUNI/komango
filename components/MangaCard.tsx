
import React from 'react';
import { UnifiedManga } from '../types';
import { Star } from 'lucide-react';

interface MangaCardProps {
  manga: UnifiedManga;
  onClick: (manga: UnifiedManga) => void;
  variant?: 'grid' | 'scroll';
}

export const MangaCard: React.FC<MangaCardProps> = ({ manga, onClick, variant = 'scroll' }) => {
  return (
    <div 
      className={`${variant === 'scroll' ? 'w-32 md:w-44 flex-shrink-0' : 'w-full'} group cursor-pointer transition-transform duration-200 active:scale-95`}
      onClick={() => onClick(manga)}
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-[#1A1A1A]">
        <img 
          src={manga.coverImage} 
          alt={manga.title} 
          className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
          loading="lazy"
        />
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
          <span className="text-[10px] font-bold text-white">{manga.rating.toFixed(1)}</span>
        </div>
        {manga.status === 'Ongoing' && (
          <div className="absolute top-2 right-2 bg-purple-600 px-2 py-0.5 rounded-md">
            <span className="text-[10px] font-bold text-white uppercase tracking-tighter">New</span>
          </div>
        )}
      </div>
      <h3 className="mt-2 text-sm font-semibold line-clamp-2 text-gray-200 group-hover:text-purple-400 h-10">
        {manga.title}
      </h3>
      <p className="text-[10px] text-gray-500 mt-0.5">{manga.genres[0] || 'Unknown'}</p>
    </div>
  );
};

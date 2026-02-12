
import React from 'react';
import { UnifiedManga, Chapter } from '../types';
import { ChevronLeft, Heart, Share2, MoreVertical, Play, Download, ArrowDown, CheckCircle2 } from 'lucide-react';

interface DetailViewProps {
  manga: UnifiedManga;
  isFavorite: boolean;
  isDownloaded: (chapterId: string) => boolean;
  onBack: () => void;
  onToggleFavorite: (manga: UnifiedManga) => void;
  onDownloadChapter: (chapter: Chapter) => void;
  onReadChapter: (chapter: Chapter) => void;
}

export const DetailView: React.FC<DetailViewProps> = ({ 
  manga, 
  isFavorite, 
  isDownloaded,
  onBack, 
  onToggleFavorite, 
  onDownloadChapter,
  onReadChapter 
}) => {
  return (
    <div className="fixed inset-0 z-40 bg-[#000000] overflow-y-auto animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Background Cover Blur */}
      <div className="relative h-[300px] w-full">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 blur-2xl"
          style={{ backgroundImage: `url(${manga.coverImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#000000]/60 to-[#000000]" />
        
        {/* Header Actions */}
        <div className="relative z-10 flex items-center justify-between p-4">
          <button onClick={onBack} className="p-2 bg-black/40 rounded-full backdrop-blur-md">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex gap-4">
            <button className="p-2 bg-black/40 rounded-full backdrop-blur-md"><Share2 className="w-5 h-5" /></button>
            <button className="p-2 bg-black/40 rounded-full backdrop-blur-md"><MoreVertical className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Info Card Overlay */}
        <div className="relative z-10 px-6 flex gap-4 -mt-4">
          <img 
            src={manga.coverImage} 
            className="w-32 aspect-[2/3] rounded-xl object-cover shadow-2xl border-2 border-white/10"
            alt={manga.title}
          />
          <div className="flex-1 pt-6">
            <h1 className="text-xl font-bold line-clamp-2 leading-tight">{manga.title}</h1>
            <p className="text-sm text-gray-400 mt-1">By {manga.author}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-[10px] bg-purple-600/30 text-purple-400 px-2 py-0.5 rounded border border-purple-600/30 font-semibold">{manga.status}</span>
              <span className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded border border-white/10 font-semibold">{manga.sources[0]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-6 flex gap-3">
        <button 
          onClick={() => onReadChapter(manga.chapters[0])}
          className="flex-1 bg-purple-600 hover:bg-purple-700 h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <Play className="w-5 h-5 fill-current" /> Read Now
        </button>
        <button 
          onClick={() => onToggleFavorite(manga)}
          className={`w-12 h-12 rounded-xl flex items-center justify-center border border-white/5 transition-colors ${isFavorite ? 'bg-purple-600 text-white border-purple-600' : 'bg-[#1A1A1A] text-gray-400 hover:bg-white/5'}`}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
        <button className="w-12 h-12 bg-[#1A1A1A] rounded-xl flex items-center justify-center border border-white/5 hover:bg-white/5">
          <Download className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Description */}
      <div className="px-6 mb-8">
        <h3 className="text-lg font-bold mb-2">Summary</h3>
        <p className="text-sm text-gray-400 leading-relaxed line-clamp-4">
          {manga.description}
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {manga.genres.map(genre => (
            <span key={genre} className="text-[11px] bg-[#1A1A1A] text-gray-300 px-3 py-1 rounded-full border border-white/5">
              {genre}
            </span>
          ))}
        </div>
      </div>

      {/* Chapters List */}
      <div className="px-6 pb-24">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{manga.chapters.length} Chapters</h3>
          <button className="text-purple-500 text-sm font-semibold flex items-center gap-1">
            <ArrowDown className="w-4 h-4" /> Newest
          </button>
        </div>
        <div className="space-y-2">
          {manga.chapters.map((chapter) => {
            const downloaded = isDownloaded(chapter.id);
            return (
              <div 
                key={chapter.id}
                onClick={() => onReadChapter(chapter)}
                className="flex items-center justify-between p-4 bg-[#1A1A1A]/40 rounded-xl border border-white/5 active:bg-[#1A1A1A] transition-all cursor-pointer"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-200">Chapter {chapter.number}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{chapter.releaseDate} • {chapter.source}</p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDownloadChapter(chapter); }}
                  className={`p-2 rounded-lg transition-colors ${downloaded ? 'text-green-500' : 'text-gray-600 hover:text-purple-500'}`}
                >
                  {downloaded ? <CheckCircle2 className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


import React, { useEffect, useState } from 'react';
import { ChevronLeft, Settings, Download, ArrowRight, ArrowLeft } from 'lucide-react';
import { Chapter, UnifiedManga } from '../types';

interface ReaderViewProps {
  manga: UnifiedManga;
  chapter: Chapter;
  onBack: () => void;
  onNextChapter?: () => void;
  onPrevChapter?: () => void;
}

export const ReaderView: React.FC<ReaderViewProps> = ({ manga, chapter, onBack, onNextChapter, onPrevChapter }) => {
  const [showHeader, setShowHeader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowHeader(false), 3000);
    return () => clearTimeout(timer);
  }, [chapter.id]);

  const toggleHeader = () => setShowHeader(!showHeader);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col h-screen overflow-hidden animate-in fade-in duration-300">
      {/* Header Overlay */}
      <div className={`fixed top-0 inset-x-0 z-50 bg-black/90 backdrop-blur-md px-4 py-4 flex items-center justify-between transition-all duration-500 ${showHeader ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 active:scale-90 transition-transform">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="overflow-hidden">
            <h2 className="text-sm font-bold truncate max-w-[150px]">{manga.title}</h2>
            <p className="text-[10px] text-gray-400">Chapter {chapter.number} • {chapter.source}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Download className="w-5 h-5 text-gray-300 cursor-pointer hover:text-white" />
          <Settings className="w-5 h-5 text-gray-300 cursor-pointer hover:text-white" />
        </div>
      </div>

      {/* Reader Body */}
      <div 
        className="flex-1 overflow-y-auto no-scrollbar scroll-smooth"
        onClick={toggleHeader}
      >
        <div className="flex flex-col items-center">
          {chapter.pages.map((url, idx) => (
            <div key={`${chapter.id}-page-${idx}`} className="w-full max-w-2xl relative min-h-[400px]">
              <img 
                src={url} 
                alt={`Page ${idx + 1}`} 
                className="w-full h-auto object-contain block select-none pointer-events-none"
                loading={idx < 3 ? "eager" : "lazy"}
              />
            </div>
          ))}
          
          <div className="w-full max-w-2xl py-20 px-6 flex flex-col items-center gap-6 bg-gradient-to-b from-transparent to-[#111]">
            <div className="text-center text-gray-500 italic text-sm">
              End of Chapter {chapter.number}
            </div>
            <div className="flex gap-4 w-full">
              {onPrevChapter && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onPrevChapter(); }}
                  className="flex-1 bg-[#1A1A1A] border border-white/5 py-4 rounded-2xl flex items-center justify-center gap-2 font-bold active:scale-95 transition-transform"
                >
                  <ArrowLeft className="w-5 h-5" /> Previous
                </button>
              )}
              {onNextChapter && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onNextChapter(); }}
                  className="flex-1 bg-purple-600 py-4 rounded-2xl flex items-center justify-center gap-2 font-bold active:scale-95 transition-transform"
                >
                  Next Chapter <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onBack(); }}
              className="text-xs text-gray-500 uppercase font-bold tracking-widest mt-4"
            >
              Back to Details
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Overlay */}
      <div className={`fixed bottom-0 inset-x-0 z-50 bg-black/90 backdrop-blur-md px-6 py-6 flex items-center justify-between transition-all duration-500 ${showHeader ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
        <div className="text-[10px] font-bold text-gray-500 uppercase">Immersive Mode</div>
        <div className="flex gap-6">
           <ArrowLeft onClick={(e) => { e.stopPropagation(); onPrevChapter?.(); }} className={`w-5 h-5 ${onPrevChapter ? 'text-white cursor-pointer' : 'text-gray-700'}`} />
           <ArrowRight onClick={(e) => { e.stopPropagation(); onNextChapter?.(); }} className={`w-5 h-5 ${onNextChapter ? 'text-white cursor-pointer' : 'text-gray-700'}`} />
        </div>
      </div>
    </div>
  );
};

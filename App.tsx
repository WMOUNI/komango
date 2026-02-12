
import React, { useState, useEffect, useCallback } from 'react';
import { Home, Search, Library, User, Compass, Settings as SettingsIcon, Download, Heart, Clock, Trash2, ChevronRight, Bell, Shield, CheckCircle2 } from 'lucide-react';
import { UnifiedManga, AppTab, Chapter } from './types';
import { MangaService } from './services/geminiService';
import { MangaCard } from './components/MangaCard';
import { DetailView } from './components/DetailView';
import { ReaderView } from './components/ReaderView';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [librarySubTab, setLibrarySubTab] = useState<'favorites' | 'downloads' | 'history'>('favorites');
  const [popularManga, setPopularManga] = useState<UnifiedManga[]>([]);
  const [searchResults, setSearchResults] = useState<UnifiedManga[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedManga, setSelectedManga] = useState<UnifiedManga | null>(null);
  const [activeChapter, setActiveChapter] = useState<{manga: UnifiedManga, chapter: Chapter} | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Settings State
  const [settings, setSettings] = useState({
    readerMode: 'continuous',
    quality: 'high',
    notifications: true,
  });

  // Persistence
  const [favorites, setFavorites] = useState<UnifiedManga[]>(() => {
    const saved = localStorage.getItem('komango_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [history, setHistory] = useState<{manga: UnifiedManga, chapter: Chapter, timestamp: number}[]>(() => {
    const saved = localStorage.getItem('komango_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [downloads, setDownloads] = useState<{manga: UnifiedManga, chapter: Chapter}[]>(() => {
    const saved = localStorage.getItem('komango_downloads');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('komango_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('komango_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('komango_downloads', JSON.stringify(downloads));
  }, [downloads]);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    setLoading(true);
    const data = await MangaService.getPopularManga();
    setPopularManga(data);
    setLoading(false);
  };

  const handleSearch = async (val: string) => {
    setSearchQuery(val);
    if (val.length > 2) {
      setIsSearching(true);
      const results = await MangaService.searchManga(val);
      setSearchResults(results);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  };

  const toggleFavorite = (manga: UnifiedManga) => {
    setFavorites(prev => {
      const exists = prev.find(f => f.id === manga.id);
      if (exists) return prev.filter(f => f.id !== manga.id);
      return [manga, ...prev];
    });
  };

  const addToHistory = (manga: UnifiedManga, chapter: Chapter) => {
    setHistory(prev => {
      const filtered = prev.filter(h => h.manga.id !== manga.id);
      return [{ manga, chapter, timestamp: Date.now() }, ...filtered].slice(0, 20);
    });
  };

  const toggleDownload = (manga: UnifiedManga, chapter: Chapter) => {
    setDownloads(prev => {
      const exists = prev.find(d => d.chapter.id === chapter.id);
      if (exists) {
        return prev.filter(d => d.chapter.id !== chapter.id);
      }
      return [...prev, { manga, chapter }];
    });
  };

  const isChapterDownloaded = (chapterId: string) => downloads.some(d => d.chapter.id === chapterId);
  const isMangaFavorite = (mangaId: string) => favorites.some(f => f.id === mangaId);

  const startReading = (manga: UnifiedManga, chapter: Chapter) => {
    setActiveChapter({ manga, chapter });
    addToHistory(manga, chapter);
  };

  const nextChapter = () => {
    if (!activeChapter) return;
    const currentIndex = activeChapter.manga.chapters.findIndex(c => c.id === activeChapter.chapter.id);
    if (currentIndex < activeChapter.manga.chapters.length - 1) {
      startReading(activeChapter.manga, activeChapter.manga.chapters[currentIndex + 1]);
    }
  };

  const prevChapter = () => {
    if (!activeChapter) return;
    const currentIndex = activeChapter.manga.chapters.findIndex(c => c.id === activeChapter.chapter.id);
    if (currentIndex > 0) {
      startReading(activeChapter.manga, activeChapter.manga.chapters[currentIndex - 1]);
    }
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear your reading history?')) {
      setHistory([]);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex-1 flex flex-col p-6 space-y-8 animate-pulse">
           <div className="w-full h-48 bg-[#1A1A1A] rounded-2xl"></div>
           <div className="space-y-4">
             <div className="w-1/3 h-6 bg-[#1A1A1A] rounded"></div>
             <div className="flex gap-4 overflow-hidden">
               {[1,2,3,4].map(i => <div key={i} className="w-32 h-48 bg-[#1A1A1A] rounded-xl flex-shrink-0"></div>)}
             </div>
           </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <div className="flex-1 overflow-y-auto pb-24 scroll-smooth">
            {popularManga.length > 0 && (
              <div className="px-6 pt-4">
                <div className="relative h-56 rounded-3xl overflow-hidden shadow-2xl group cursor-pointer" onClick={() => setSelectedManga(popularManga[0])}>
                  <img src={popularManga[0]?.bannerImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Banner" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-purple-400 text-[10px] font-bold uppercase tracking-wider mb-1">Featured Today</p>
                    <h2 className="text-2xl font-black text-white leading-tight uppercase tracking-tight line-clamp-2">{popularManga[0]?.title}</h2>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="bg-purple-600 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase">Must Read</span>
                       <span className="text-[10px] text-gray-300 font-medium">Chapter {popularManga[0].chapters.length} available</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 px-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Trending Now</h3>
                <button className="text-purple-500 text-xs font-semibold hover:underline">See All</button>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {popularManga.map(m => (
                  <MangaCard key={m.id} manga={m} onClick={setSelectedManga} variant="scroll" />
                ))}
              </div>
            </div>

            <div className="mt-8 px-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Updates from {popularManga[0]?.sources[0]}</h3>
                <button onClick={loadHomeData} className="text-purple-500 text-xs font-semibold active:rotate-180 transition-transform">Refresh</button>
              </div>
              <div className="space-y-3">
                {popularManga.slice(2, 6).map(m => (
                  <div key={m.id} onClick={() => setSelectedManga(m)} className="flex gap-4 bg-[#1A1A1A]/40 border border-white/5 p-3 rounded-2xl active:bg-[#1A1A1A] cursor-pointer group">
                    <div className="relative overflow-hidden rounded-xl shrink-0">
                      <img src={m.coverImage} className="w-16 h-24 object-cover group-hover:scale-110 transition-transform duration-300" alt={m.title} />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="text-sm font-bold text-gray-200 line-clamp-1 group-hover:text-purple-400 transition-colors">{m.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter">{m.sources[0]}</span>
                        <p className="text-[10px] text-purple-500 font-semibold uppercase">CH. {m.chapters[0]?.number}</p>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-2 italic">Updated {m.lastUpdated}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'browse':
        return (
          <div className="flex-1 p-6 overflow-y-auto pb-24">
            <div className="relative mb-6">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isSearching ? 'text-purple-500 animate-spin' : 'text-gray-500'}`} />
              <input 
                type="text"
                placeholder="Search across all sources..."
                className="w-full bg-[#1A1A1A] border-none rounded-2xl py-4 pl-12 pr-6 text-sm focus:ring-2 focus:ring-purple-600 transition-all shadow-inner outline-none"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-3 gap-x-3 gap-y-6">
                {searchResults.map((m, idx) => (
                  <div key={`${m.id}-${idx}`} className="animate-in fade-in zoom-in-95 duration-200" style={{ animationDelay: `${idx * 50}ms` }}>
                    <MangaCard manga={m} onClick={setSelectedManga} variant="grid" />
                  </div>
                ))}
              </div>
            ) : isSearching ? (
               <div className="grid grid-cols-3 gap-3">
                 {[1,2,3,4,5,6].map(i => (
                   <div key={i} className="aspect-[2/3] bg-[#1A1A1A] rounded-xl animate-pulse" />
                 ))}
               </div>
            ) : searchQuery.length > 2 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <Compass className="w-12 h-12 mb-4 opacity-20" />
                <p>No results found for "{searchQuery}"</p>
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="font-bold text-gray-400 text-[10px] uppercase tracking-widest">Recommended Genres</h3>
                <div className="grid grid-cols-2 gap-3">
                   {['Action', 'Murim', 'Romance', 'Fantasy', 'Isekai', 'Comedy'].map(g => (
                     <div key={g} 
                        onClick={() => handleSearch(g)}
                        className="bg-gradient-to-br from-[#1A1A1A] to-black h-20 rounded-2xl flex items-center justify-center font-black text-xs uppercase tracking-widest border border-white/5 hover:border-purple-600/50 transition-all cursor-pointer active:scale-95 shadow-lg">
                        {g}
                     </div>
                   ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'library':
        return (
          <div className="flex-1 p-6 overflow-y-auto pb-24">
            <h2 className="text-2xl font-black mb-6 tracking-tight">Library</h2>
            <div className="flex gap-2 mb-8 bg-[#1A1A1A] p-1.5 rounded-2xl overflow-x-auto no-scrollbar">
              {[
                { id: 'favorites', label: 'FAVORITES', icon: Heart },
                { id: 'history', label: 'HISTORY', icon: Clock },
                { id: 'downloads', label: 'DOWNLOADS', icon: Download }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setLibrarySubTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 text-[10px] font-black py-2.5 px-4 rounded-xl transition-all whitespace-nowrap ${librarySubTab === tab.id ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                </button>
              ))}
            </div>
            
            {librarySubTab === 'favorites' && (
              favorites.length > 0 ? (
                <div className="grid grid-cols-3 gap-x-3 gap-y-6">
                  {favorites.map(m => (
                    <MangaCard key={m.id} manga={m} onClick={setSelectedManga} variant="grid" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-gray-500 text-center px-4">
                  <Heart className="w-16 h-16 mb-4 opacity-10" />
                  <p className="font-bold text-gray-400 text-sm">Your library is empty</p>
                  <p className="text-[10px] mt-2 text-gray-600 uppercase tracking-widest">Follow manga to see updates</p>
                  <button onClick={() => setActiveTab('browse')} className="mt-6 text-white font-black text-[10px] px-8 py-3 bg-purple-600 rounded-full uppercase tracking-widest shadow-xl shadow-purple-900/30">Browse Now</button>
                </div>
              )
            )}

            {librarySubTab === 'history' && (
              history.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button onClick={clearHistory} className="flex items-center gap-1.5 text-[10px] font-bold text-red-500/70 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" /> CLEAR HISTORY
                    </button>
                  </div>
                  <div className="space-y-3">
                    {history.map((h, idx) => (
                      <div key={`${h.manga.id}-${idx}`} onClick={() => startReading(h.manga, h.chapter)} className="flex gap-4 bg-[#1A1A1A]/40 border border-white/5 p-3 rounded-2xl active:bg-[#1A1A1A] cursor-pointer group">
                        <img src={h.manga.coverImage} className="w-14 h-20 object-cover rounded-xl" alt={h.manga.title} />
                        <div className="flex-1 flex flex-col justify-center">
                          <h4 className="text-sm font-bold text-gray-200 line-clamp-1 group-hover:text-purple-400">{h.manga.title}</h4>
                          <p className="text-[10px] text-purple-500 font-semibold mt-1">Read Chapter {h.chapter.number}</p>
                          <p className="text-[9px] text-gray-600 mt-2 font-medium uppercase">{new Date(h.timestamp).toLocaleString()}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 self-center text-gray-700" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-gray-500 text-center px-4">
                  <Clock className="w-16 h-16 mb-4 opacity-10" />
                  <p className="font-bold text-gray-400 text-sm">No reading history</p>
                  <p className="text-[10px] mt-2 text-gray-600 uppercase tracking-widest">Your journey starts here</p>
                </div>
              )
            )}

            {librarySubTab === 'downloads' && (
              downloads.length > 0 ? (
                <div className="space-y-3">
                  {downloads.map((d, idx) => (
                    <div key={`${d.chapter.id}-${idx}`} onClick={() => startReading(d.manga, d.chapter)} className="flex gap-4 bg-[#1A1A1A]/40 border border-white/5 p-3 rounded-2xl active:bg-[#1A1A1A] cursor-pointer group">
                      <img src={d.manga.coverImage} className="w-14 h-20 object-cover rounded-xl" alt={d.manga.title} />
                      <div className="flex-1 flex flex-col justify-center">
                        <h4 className="text-sm font-bold text-gray-200 line-clamp-1 group-hover:text-purple-400">{d.manga.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          <p className="text-[10px] text-gray-400 font-semibold uppercase">Chapter {d.chapter.number} • {d.chapter.source}</p>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleDownload(d.manga, d.chapter); }}
                        className="p-2 text-gray-600 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-gray-500 text-center px-4">
                  <Download className="w-16 h-16 mb-4 opacity-10" />
                  <p className="font-bold text-gray-400 text-sm">Offline Mode</p>
                  <p className="text-[10px] mt-2 text-gray-600 uppercase tracking-widest">Chapters appear here when downloaded</p>
                </div>
              )
            )}
          </div>
        );

      case 'profile':
        return (
          <div className="flex-1 p-6 pb-24 overflow-y-auto">
            <div className="flex flex-col items-center py-8">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-full flex items-center justify-center text-3xl font-black shadow-lg shadow-purple-900/40 border-4 border-black ring-2 ring-purple-600/30">
                  K
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-black" />
              </div>
              <h2 className="mt-4 text-xl font-black tracking-tight">Komango Reader</h2>
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">Free Tier • v1.0.4</p>
            </div>

            <div className="space-y-6">
              <section>
                <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-3 ml-2">Preferences</h3>
                <div className="bg-[#1A1A1A]/40 rounded-3xl border border-white/5 overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-600/20 p-2 rounded-xl text-purple-500"><Bell className="w-5 h-5"/></div>
                      <span className="text-sm font-bold text-gray-300">Push Notifications</span>
                    </div>
                    <button 
                      onClick={() => setSettings(s => ({...s, notifications: !s.notifications}))}
                      className={`w-12 h-6 rounded-full transition-colors relative ${settings.notifications ? 'bg-purple-600' : 'bg-gray-800'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.notifications ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-600/20 p-2 rounded-xl text-blue-500"><Shield className="w-5 h-5"/></div>
                      <span className="text-sm font-bold text-gray-300">Incognito Mode</span>
                    </div>
                    <button className="w-12 h-6 bg-gray-800 rounded-full relative">
                      <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full" />
                    </button>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-3 ml-2">App Config</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Reader Mode', sub: settings.readerMode === 'continuous' ? 'Continuous Vertical' : 'Paged', icon: <Compass className="w-5 h-5"/> },
                    { label: 'Image Quality', sub: settings.quality.toUpperCase(), icon: <Download className="w-5 h-5"/> },
                    { label: 'Source Preferences', sub: 'Olympus, Hijala, Azora...', icon: <Library className="w-5 h-5"/> },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-4 p-4 bg-[#1A1A1A]/40 rounded-2xl border border-white/5 active:bg-[#1A1A1A] cursor-pointer group">
                      <div className="text-gray-500 group-hover:text-purple-500 transition-colors shrink-0">{item.icon}</div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-200">{item.label}</p>
                        <p className="text-[10px] text-gray-500 font-medium uppercase">{item.sub}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-700" />
                    </div>
                  ))}
                </div>
              </section>

              <button 
                onClick={clearHistory}
                className="w-full bg-red-600/10 text-red-500 border border-red-600/20 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Clear Cache & History
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-black text-white relative overflow-hidden font-sans">
      {(activeTab === 'home' || activeTab === 'browse') && !selectedManga && !activeChapter && (
        <header className="px-6 py-6 flex items-center justify-between z-10 shrink-0">
          <h1 className="text-2xl font-black text-white tracking-tighter italic">KOMANGO<span className="text-purple-600">.</span></h1>
          <div className="flex gap-4">
             <div className="relative group" onClick={() => setActiveTab('browse')}>
                <Search className="w-5 h-5 text-gray-400 cursor-pointer group-hover:text-white transition-colors" />
             </div>
             <User className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white transition-colors" onClick={() => setActiveTab('profile')} />
          </div>
        </header>
      )}

      {renderContent()}

      {!selectedManga && !activeChapter && (
        <nav className="fixed bottom-0 inset-x-0 mx-auto max-w-md bg-black/90 backdrop-blur-2xl border-t border-white/5 px-6 pt-3 pb-8 flex items-center justify-between z-30">
          {[
            { id: 'home', icon: Home, label: 'Home' },
            { id: 'browse', icon: Compass, label: 'Browse' },
            { id: 'library', icon: Library, label: 'Library' },
            { id: 'profile', icon: SettingsIcon, label: 'Settings' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AppTab)}
              className={`flex flex-col items-center gap-1.5 transition-all duration-300 relative group ${activeTab === tab.id ? 'text-purple-500' : 'text-gray-600 hover:text-gray-400'}`}
            >
              <tab.icon className={`w-6 h-6 ${activeTab === tab.id ? 'scale-110 drop-shadow-[0_0_12px_rgba(168,85,247,0.5)]' : 'group-active:scale-90 transition-transform'}`} />
              <span className={`text-[9px] font-black uppercase tracking-tighter ${activeTab === tab.id ? 'opacity-100' : 'opacity-60'}`}>{tab.label}</span>
              {activeTab === tab.id && <div className="absolute -top-1 bg-purple-600 w-1 h-1 rounded-full animate-pulse" />}
            </button>
          ))}
        </nav>
      )}

      {selectedManga && (
        <DetailView 
          manga={selectedManga} 
          isFavorite={isMangaFavorite(selectedManga.id)}
          isDownloaded={(chId) => isChapterDownloaded(chId)}
          onBack={() => setSelectedManga(null)} 
          onToggleFavorite={toggleFavorite}
          onDownloadChapter={(ch) => toggleDownload(selectedManga, ch)}
          onReadChapter={(chapter) => startReading(selectedManga, chapter)}
        />
      )}

      {activeChapter && (
        <ReaderView 
          manga={activeChapter.manga} 
          chapter={activeChapter.chapter} 
          onBack={() => setActiveChapter(null)} 
          onNextChapter={nextChapter}
          onPrevChapter={prevChapter}
        />
      )}
    </div>
  );
};

export default App;

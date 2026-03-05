import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Filter from '../components/Filter';

function Results() {
  const location = useLocation();
  const games = location.state?.games || [];
  const availableFilters = location.state?.filters || { tags: {}, genres: {}, price: {} };
  
  const [filters, setFilters] = useState({ 
    genre: '', 
    tag: '', 
    priceRange: null,
    sortBy: 'name',
    showDelisted: true,
    showUnknown: true,
    showFree: true,
    showPaid: true,
    searchTerm: ''
  });

  const extractNumericPrice = (priceStr) => {
    if (!priceStr || priceStr === 'Free to Play' || priceStr === 'Delisted' || priceStr === 'Unknown') return 0;
    const match = priceStr.match(/\d+[.,]\d+/);
    return match ? parseFloat(match[0].replace(',', '.')) : 0;
  };

  const handleRecommendations = (game) => {
  };

  const filteredGames = useMemo(() => {
    let result = games.filter(game => {
      if (filters.searchTerm && !game.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
      if (filters.genre && !game.genres?.includes(filters.genre)) return false;
      if (filters.tag && !game.tags?.includes(filters.tag)) return false;
      if (filters.priceRange) {
        const p = extractNumericPrice(game.price);
        if (p < filters.priceRange[0] || p > filters.priceRange[1]) return false;
      }
      if (!filters.showDelisted && game.price === 'Delisted') return false;
      if (!filters.showUnknown && game.price === 'Unknown') return false;
      if (!filters.showFree && game.price === 'Free to Play') return false;
      if (!filters.showPaid && game.price === 'Not free') return false;
      return true;
    });

    const priceOrder = { 'Free to Play': 0, 'Not free': 1, 'Unknown': 2, 'Delisted': 3 };

    return result.sort((a, b) => {
      if (filters.sortBy === 'price-low') {
        const priceA = priceOrder[a.price] ?? 99;
        const priceB = priceOrder[b.price] ?? 99;
        if (priceA !== priceB) return priceA - priceB;
        return a.name.localeCompare(b.name);
      }
      if (filters.sortBy === 'price-high') {
        const priceA = priceOrder[a.price] ?? 99;
        const priceB = priceOrder[b.price] ?? 99;
        if (priceA !== priceB) return priceB - priceA;
        return a.name.localeCompare(b.name);
      }
      return a.name.localeCompare(b.name);
    });
  }, [games, filters]);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 sm:p-10 flex flex-col items-center">
      <div className="w-full max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-slate-800 pb-8">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">
              Shared <span className="text-blue-500">Library</span>
            </h1>
          </div>

          { /* Searchbar */}
          <div className="flex items-center gap-6">
            <div className="relative group">
              {/* Magnifier */}
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <input 
                type="text"
                value={filters.searchTerm}
                className="bg-slate-800/40 border border-slate-700 text-white pl-10 pr-10 py-2 rounded-xl outline-none focus:border-blue-500 transition-all placeholder-slate-500 w-64 lg:w-80 font-bold text-sm"
                placeholder="Search by title..."
                onChange={(e) => setFilters(f => ({...f, searchTerm: e.target.value}))}
              />

              {/* X */}
              {filters.searchTerm && (
                <button 
                  onClick={() => setFilters(f => ({...f, searchTerm: ''}))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2 Columns */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Sidebar */}
          <div className="w-full lg:w-[320px] shrink-0">
            <Filter filters={filters} setFilters={setFilters} availableFilters={availableFilters} />
          </div>

          {/* Zoznam hier (Main Content) */}
          <div className="flex-grow w-full">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 bg-slate-800/10 p-2 rounded-2xl border border-slate-800/50 backdrop-blur-sm gap-4">
              <div className="flex items-center gap-3 pl-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Sort By</span>
                <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
                  {[
                    { id: 'name', label: 'A-Z'},
                    { id: 'price-low', label: '€ ↑' },
                    { id: 'price-high', label: '€ ↓' }
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setFilters(f => ({ ...f, sortBy: option.id }))}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all duration-200 ${
                        filters.sortBy === option.id 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                        : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
                
              { /* Results Count */}
              <div className="hidden sm:flex items-center pr-4 border-l border-slate-800 pl-4">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest mr-2">Results:</span>
                <span className="text-sm font-bold text-blue-400">{filteredGames.length}</span>
              </div>
            </div>

            {filteredGames.length > 0 ? (
              <div className="space-y-4">
                {filteredGames.map((game) => (
                  <a 
                    key={game.appid}
                    href={`https://store.steampowered.com/app/${game.appid}`}
                    target="_blank" rel="noreferrer"
                    className="group flex gap-6 bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl hover:bg-slate-800 hover:border-blue-500/50 transition-all duration-300 items-center"
                  >
                    {/* Game Image */}
                    <img 
                      src={`https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`} 
                      className="w-48 h-24 rounded-lg object-cover shadow-lg group-hover:scale-105 transition-transform duration-300" 
                      alt="" 
                    />

                    {/* Game Info Middle */}
                    <div className="flex-grow min-w-0">
                      <h2 className="font-bold text-xl group-hover:text-blue-400 transition-colors truncate">
                        {game.name}
                      </h2>
                      
                      {/* Genres */}
                      {game.genres && game.genres.length > 0 && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {game.genres.slice(0, 4).map((g, i) => (
                            <span key={i} className="text-[10px] uppercase font-black tracking-tighter bg-slate-900 px-2 py-0.5 rounded border border-slate-700 text-slate-400">{g}</span>
                          ))}
                        </div>
                      )}
                      
                      {/* Tags */}
                      {game.tags && game.tags.length > 0 && (
                        <div className="flex gap-2 mt-1 flex-wrap">
                          {game.tags.slice(0, 4).map((t, i) => (
                            <span key={i} className="text-[10px] uppercase font-bold tracking-tighter bg-slate-800/50 px-2 py-0.5 rounded border border-slate-600 text-slate-500">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Recommendations Button */}
                    <div className="text-right shrink-0 flex flex-col gap-2">
                       <div>
                         <p className={`text-lg font-black ${game.price === 'Delisted' ? 'text-rose-500' : 'text-emerald-400'}`}>
                           {game.price}
                         </p>
                         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Steam Store</span>
                       </div>

                       <button
                         onClick={() => handleRecommendations(game)}
                         className="flex items-center justify-center gap-1 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white text-xs font-black uppercase tracking-tighter px-2 py-1 rounded border border-blue-500/20 hover:border-blue-500 transition-all active:scale-95"                       >
                         Find Similar
                       </button>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-800">
                <p className="text-slate-500 italic">No games match your current filters.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Results;
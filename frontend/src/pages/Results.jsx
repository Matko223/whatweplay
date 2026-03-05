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
    searchTerm: ''
  });

  const extractNumericPrice = (priceStr) => {
    if (!priceStr || priceStr === 'Free to Play' || priceStr === 'Delisted' || priceStr === 'Unknown') return 0;
    const match = priceStr.match(/\d+[.,]\d+/);
    return match ? parseFloat(match[0].replace(',', '.')) : 0;
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
      return true;
    });

    return result.sort((a, b) => {
      if (filters.sortBy === 'price-low') return extractNumericPrice(a.price) - extractNumericPrice(b.price);
      if (filters.sortBy === 'price-high') return extractNumericPrice(b.price) - extractNumericPrice(a.price);
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
          <div className="flex items-center gap-6">
            <div className="relative">
               <input 
                className="bg-slate-800/50 border border-slate-700 text-white px-4 py-2 rounded-xl outline-none focus:border-blue-500 transition-all placeholder-slate-500 w-64"
                placeholder="Search games..."
                onChange={(e) => setFilters(f => ({...f, searchTerm: e.target.value}))}
              />
            </div>
            <div>
              <span className="text-xl font-bold uppercase tracking-widest">Games: </span>
              <span className="text-2xl font-black text-blue-400">{filteredGames.length}</span>
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
            <div className="flex items-center justify-between mb-6 bg-slate-800/20 p-3 rounded-xl border border-slate-800">
               <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Sort By:</span>
               <select 
                className="bg-slate-900 border border-slate-700 text-blue-400 px-3 py-1 rounded-lg outline-none text-sm font-bold cursor-pointer hover:border-blue-500"
                onChange={(e) => setFilters(f => ({...f, sortBy: e.target.value}))}
                value={filters.sortBy}
              >
                <option value="name">Alphabetical</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
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

                    {/* Price Right */}
                    <div className="text-right shrink-0">
                       <p className={`text-lg font-black ${game.price === 'Delisted' ? 'text-rose-500' : 'text-emerald-400'}`}>
                         {game.price}
                       </p>
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Steam Store</span>
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
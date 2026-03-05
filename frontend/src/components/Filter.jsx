import React, { useState, useEffect } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const SidebarBlock = ({ title, children }) => (
  <div className="mb-6 bg-slate-800/30 p-4 rounded-2xl border border-slate-800/50">
    <div className="text-blue-500 text-xs font-black uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">
      {title}
    </div>
    <div className="space-y-3">
      {children}
    </div>
  </div>
);

function Filter({ filters, setFilters, availableFilters = {} }) {
  const minPrice = availableFilters.priceRange?.min || 0;
  const maxPrice = availableFilters.priceRange?.max || 100;
  const [localPrice, setLocalPrice] = useState([minPrice, maxPrice]);
  const [tagSearch, setTagSearch] = useState('');
  const [genreSearch, setGenreSearch] = useState('');

  const handleToggle = (category, value) => {
    setFilters(f => ({ ...f, [category]: f[category] === value ? '' : value }));
  };

  const filteredTags = Object.entries(availableFilters.tags || {})
    .filter(([tag]) => tag.toLowerCase().includes(tagSearch.toLowerCase()));

  const filteredGenres = Object.entries(availableFilters.genres || {})
    .filter(([genre]) => genre.toLowerCase().includes(genreSearch.toLowerCase()));

  return (
    <div className="flex flex-col w-full">
      <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4 pl-1">Narrow by</h2>
      
      {/* Price Slider Block */}
      <SidebarBlock title="Budget Range">
        <Slider
          range 
          min={minPrice} 
          max={maxPrice}
          step={5}
          value={filters.priceRange || [minPrice, maxPrice]}
          onChange={(val) => {
            setLocalPrice(val);
            setFilters(f => ({ ...f, priceRange: val }));
          }}
          trackStyle={[{ backgroundColor: '#3b82f6' }]}
          handleStyle={[{ backgroundColor: '#3b82f6', border: 'none', opacity: 1 }, { backgroundColor: '#3b82f6', border: 'none', opacity: 1 }]}
          railStyle={{ backgroundColor: '#1e293b' }}
        />
        <div className="flex justify-between mt-2 font-mono text-xs text-blue-400 font-bold">
          <span>{localPrice[0]}€</span>
          <span>{localPrice[1]}€</span>
        </div>
      </SidebarBlock>

      {/* Preferences Block */}
      <SidebarBlock title="Visibility">
        <label className="flex items-center gap-3 group cursor-pointer p-1 rounded-lg hover:bg-slate-800/50 transition-colors">
          <input 
            type="checkbox" 
            checked={filters.showDelisted} 
            onChange={(e) => setFilters(f => ({...f, showDelisted: e.target.checked}))}
            className="w-4 h-4 rounded border-slate-700 bg-slate-900 checked:bg-blue-500"
          />
          <span className="text-xs font-bold uppercase tracking-tighter text-slate-400">Show Delisted</span>
        </label>
        <label className="flex items-center gap-3 group cursor-pointer p-1 rounded-lg hover:bg-slate-800/50 transition-colors">
          <input 
            type="checkbox" 
            checked={filters.showUnknown} 
            onChange={(e) => setFilters(f => ({...f, showUnknown: e.target.checked}))}
            className="w-4 h-4 rounded border-slate-700 bg-slate-900 checked:bg-blue-500"
          />
          <span className="text-xs font-bold uppercase tracking-tighter text-slate-400">Show Unknown Price</span>
        </label>
      </SidebarBlock>

      {/* Tags Block */}
      <SidebarBlock title="Filter by Tags">
        <input 
          type="text"
          placeholder="Search tags..."
          value={tagSearch}
          onChange={(e) => setTagSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-1 rounded text-xs placeholder-slate-600 focus:border-blue-500 outline-none mb-2"
        />
        <div className="max-h-56 overflow-y-auto pr-2 space-y-1">
          {filteredTags.slice(0, 15).map(([tag, count]) => (
            <label key={tag} className="flex items-center justify-between group cursor-pointer p-1 rounded-lg hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={filters.tag === tag} 
                  onChange={() => handleToggle('tag', tag)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 checked:bg-blue-500"
                />
                <span className={`text-xs font-bold uppercase tracking-tighter ${filters.tag === tag ? 'text-blue-400' : 'text-slate-400'}`}>
                  {tag}
                </span>
              </div>
              <span className="text-[10px] font-black text-slate-600">{count}</span>
            </label>
          ))}
          {filteredTags.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-2">No tags found</p>
          )}
        </div>
      </SidebarBlock>

      {/* Genres Block */}
      <SidebarBlock title="Filter by Genres">
        <input 
          type="text"
          placeholder="Search genres..."
          value={genreSearch}
          onChange={(e) => setGenreSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-1 rounded text-xs placeholder-slate-600 focus:border-blue-500 outline-none mb-2"
        />
        <div className="max-h-56 overflow-y-auto pr-2 space-y-1">
          {filteredGenres.slice(0, 15).map(([genre, count]) => (
            <label key={genre} className="flex items-center justify-between group cursor-pointer p-1 rounded-lg hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={filters.genre === genre} 
                  onChange={() => handleToggle('genre', genre)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 checked:bg-blue-500"
                />
                <span className={`text-xs font-bold uppercase tracking-tighter ${filters.genre === genre ? 'text-blue-400' : 'text-slate-400'}`}>
                  {genre}
                </span>
              </div>
              <span className="text-[10px] font-black text-slate-600">{count}</span>
            </label>
          ))}
          {filteredGenres.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-2">No genres found</p>
          )}
        </div>
      </SidebarBlock>

      {/* Reset Button */}
      {(filters.tag || filters.genre || filters.searchTerm || filters.priceRange) && (
        <button 
          onClick={() => setFilters({ genre: '', tag: '', priceRange: [minPrice, maxPrice], sortBy: 'name', showDelisted: true, showUnknown: true, searchTerm: '' })}
          className="w-full bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white font-black uppercase text-[10px] tracking-widest p-3 rounded-2xl transition-all border border-rose-500/20 shadow-lg shadow-rose-900/20"
        >
          Reset All Filters
        </button>
      )}
    </div>
  );
}

export default Filter;
import React, { useState } from 'react';

const FilterGroup = ({ 
  title, 
  items, 
  counts, 
  selectedValue, 
  onSelect, 
  limit = 6, 
  colorClass = "blue" 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const keys = Object.keys(items || {});
  
  if (keys.length === 0) return null;

  const displayedKeys = isExpanded ? keys : keys.slice(0, limit);

  const colorMap = {
    blue: "bg-blue-600 border-blue-400 shadow-blue-900/40 text-blue-400",
    purple: "bg-purple-600 border-purple-400 shadow-purple-900/40 text-purple-400",
    rose: "bg-rose-600 border-rose-400 shadow-rose-900/40 text-rose-400"
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
        {keys.length > limit && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`text-xs font-semibold transition-colors ${colorMap[colorClass].split(' ')[3]}`}
          >
            {isExpanded ? '▼ Show less' : `▶ Show all (${keys.length})`}
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {displayedKeys.map(key => {
          const isActive = selectedValue === key;
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`px-4 py-2 rounded-full border transition-all duration-300 text-sm font-medium ${
                isActive 
                ? `${colorMap[colorClass].split(' ').slice(0,3).join(' ')} text-white shadow-lg` 
                : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500"
              }`}
            >
              {key} <span className="opacity-60 text-xs ml-1">({items[key]})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

function Filter({ filters, setFilters, availableFilters = {} }) {
  const toggleSelection = (category, value) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category] === value ? "" : value
    }));
  };

  const hasActiveFilters = filters.genre || filters.tag || filters.price;

  return (
    <div className="w-full max-w-5xl mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Narrow Your Search
        </h2>
        {hasActiveFilters && (
          <button
            onClick={() => setFilters({ genre: '', tag: '', price: '' })}
            className="px-4 py-2 text-sm font-bold text-rose-400 hover:text-rose-300 transition-all bg-rose-600/10 border border-rose-500/30 rounded-full hover:bg-rose-600/20"
          >
            Reset Filters
          </button>
        )}
      </div>

      <div className="space-y-2">
        {/* Genres */}
        <FilterGroup 
          title="Genres"
          items={availableFilters.genres}
          selectedValue={filters.genre}
          onSelect={(val) => toggleSelection('genre', val)}
          colorClass="blue"
          limit={5}
        />

        {/* Tags */}
        <FilterGroup 
          title="Tags"
          items={availableFilters.tags}
          selectedValue={filters.tag}
          onSelect={(val) => toggleSelection('tag', val)}
          colorClass="purple"
          limit={5}
        />
      </div>
    </div>
  );
}

export default Filter;
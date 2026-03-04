import React, { useState, useEffect } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

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
  const [priceRange, setPriceRange] = useState(null);

  const minPrice = availableFilters.priceRange?.min || 0;
  const maxPrice = availableFilters.priceRange?.max || 100;

  // Initialize price range ze availableFilters
  useEffect(() => {
    if (!priceRange && maxPrice > 0) {
      setPriceRange([minPrice, maxPrice]);
    }
  }, [maxPrice]);

  const toggleSelection = (category, value) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category] === value ? "" : value
    }));
  };

  const handlePriceChange = (range) => {
    setPriceRange(range);
    setFilters(prev => ({
      ...prev,
      priceRange: range
    }));
  };

  const hasActiveFilters = filters.genre || filters.tag || filters.priceRange;

  return (
    <div className="w-full max-w-5xl mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Narrow Your Search
        </h2>
        {hasActiveFilters && (
          <button
            onClick={() => {
              setFilters({ genre: '', tag: '', priceRange: null });
              setPriceRange([minPrice, maxPrice]);
            }}
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

        {/* Price Range Slider */}
        {maxPrice > 0 && (
        <div className="mb-8 group">
            <div className="flex justify-between items-baseline mb-4">
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Price Range
            </p>
            <span className="text-xl font-bold text-emerald-400 tabular-nums bg-emerald-950/50 px-3 py-1 rounded-lg border border-emerald-900/50">
                {priceRange ? `${priceRange[0].toFixed(2)}` : `${minPrice.toFixed(2)}`}
                <span className="text-sm opacity-60 ml-1">€</span>
                <span className="mx-2 text-slate-600">—</span>
                {priceRange ? `${priceRange[1].toFixed(2)}` : `${maxPrice.toFixed(2)}`}
                <span className="text-sm opacity-60 ml-1">€</span>
            </span>
            </div>

            <div className="px-4 py-6 bg-slate-800/30 rounded-2xl border border-slate-700/50 relative">
            <Slider
                range
                min={minPrice}
                max={maxPrice}
                value={priceRange || [minPrice, maxPrice]}
                onChange={handlePriceChange}
                step={5}
                railStyle={{ backgroundColor: '#1e293b', height: 6, borderRadius: 3 }}
                trackStyle={[{ backgroundColor: '#3b82f6', height: 6, borderRadius: 3 }]}
                handleStyle={[
                {
                    backgroundColor: '#3b82f6',
                    border: 'none',
                    height: 18,
                    width: 18,
                    marginTop: -6,
                    cursor: 'pointer',
                    opacity: 1,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.1)', // Jemný tieň
                    '&:hover': {
                    backgroundColor: '#60a5fa',
                    },
                    focus: {
                    boxShadow: 'none',
                    outline: 'none', 
                    },
                    active: {
                    boxShadow: 'none',
                    outline: 'none',
                    }
                },
                {
                    backgroundColor: '#3b82f6',
                    border: 'none',
                    height: 18,
                    width: 18,
                    marginTop: -6,
                    cursor: 'pointer',
                    opacity: 1,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                    backgroundColor: '#60a5fa',
                    },
                    focus: {
                    boxShadow: 'none',
                    outline: 'none',
                    },
                    active: {
                    boxShadow: 'none',
                    outline: 'none',
                    }
                }
                ]}
            />
            </div>
        </div>
        )}
      </div>
    </div>
  );
}

export default Filter;
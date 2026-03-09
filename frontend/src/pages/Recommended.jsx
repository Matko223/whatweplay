import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function Recommended() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get('gameId');
  const [recommendations, setRecommendations] = useState([]);
  const [gameName, setGameName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!gameId) {
      setError("No game selected");
      setLoading(false);
      return;
    }

    const fetchRecommendations = async () => {
      try {
        const response = await fetch(`http://localhost:8000/recommended-games/${gameId}?limit=10`);
        const data = await response.json();
        setRecommendations(data.recommendations || []);
        setGameName(data.game_name || gameId);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [gameId]);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 sm:p-10 flex flex-col items-center">
      <div className="w-full max-w-7xl">
        
        {/* Header */}
        {!error && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-slate-800 pb-8">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="text-slate-400 hover:text-blue-400 transition-colors mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"></path>
              </svg>
              Back
            </button>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">
              Similar to <span className="text-blue-500">{gameName || gameId}</span>
            </h1>
          </div>
        </div>
        )}

        {/* Main Content */}
        <div className="flex-grow w-full">
          {error ? (
            <div className="text-center py-20 bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-800">
              <p className="text-rose-500 italic">{error}</p>
            </div>
          ) : loading && recommendations.length === 0 ? (
            <div className="text-center py-20 bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-800">
              <p className="text-slate-500 italic">Loading recommendations...</p>
            </div>
          ) : recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((game) => (
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
                    onError={(e) => e.target.src = 'https://via.placeholder.com/192x96?text=No+Image'}
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

                    {/* Match Score */}
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Match Score:</span>
                      <div className="flex items-center gap-1">
                        <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(game.score * 10, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-blue-400">{Math.round(game.score)} / 100</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side Info */}
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
              <p className="text-slate-500 italic">No recommendations found for this game.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Recommended;
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Results() {
  const location = useLocation();
  const games = location.state?.games || [];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 sm:p-10 flex flex-col items-center">
      <div className="w-full max-w-5xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-slate-800 pb-8">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">
              Shared <span className="text-blue-500">Library</span>
            </h1>
          </div>
          <div >
            <span className="text- text-xl font-bold uppercase tracking-widest">Common Games: </span>
            <span className="text-2xl font-black text-blue-400">{games.length}</span>
          </div>
        </div>

        {/* Games Grid */}
        {games.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((game) => (
            <div 
              key={game.appid} 
              className="group bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl hover:bg-slate-800 hover:border-blue-500/50 transition-all duration-300"
            >
              {/* Header Image */}
              <img 
                src={`https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`} 
                alt="" 
                className="rounded-lg mb-4 w-full h-32 object-cover shadow-lg"
              />

              <div className="flex flex-col">
                <h2 className="font-bold text-lg group-hover:text-blue-400 transition-colors truncate">
                  {game.name}
                </h2>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">AppID</span>
                    <span className="text-sm font-mono text-slate-300">{game.appid}</span>
                  </div>
                  
                  <a 
                    href={`https://store.steampowered.com/app/${game.appid}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white font-bold text-xs transition-all"
                  >
                    View Store
                  </a>
                </div>
              </div>
            </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-800">
            <p className="text-slate-500 italic">No common games found. Maybe check your squad's privacy settings?</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Results;
import React, { useState } from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom';

function Home() {
  const [currentInput, setCurrentInput] = useState('')
  const [steamIds, setSteamIds] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [addingFriend, setAddingFriend] = useState(false)
  const navigate = useNavigate();

  const addFriend = async () => {
    const trimmed = currentInput.trim();
    if (trimmed && !steamIds.some(p => p.identifier === trimmed)) {
      try {
        setAddingFriend(true);
        
        const placeholderPlayer = {
          identifier: trimmed,
          steamid: null,
          name: trimmed,
          avatar: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22%3E%3Crect fill=%22%23475569%22 width=%2232%22 height=%2232%22/%3E%3C/svg%3E',
          isLoading: true
        };
        
        setSteamIds([...steamIds, placeholderPlayer]);
        setCurrentInput('');
        setError('');

        // Fetch actual data
        const response = await api.get(`/player-info?identifier=${trimmed}`);

        if (response.data.Error) {
          setError(response.data.Error);
          setSteamIds(prev => prev.filter(p => p.identifier !== trimmed));
        } else {
          setSteamIds(prev => 
            prev.map(p => p.identifier === trimmed ? {...response.data, identifier: trimmed} : p)
          );
        }
      } catch (error) {
        setError('Failed to add friend: ' + error.message);
        setSteamIds(prev => prev.filter(p => p.identifier !== trimmed));
      } finally {
        setAddingFriend(false);
      }
    }
  };

  const removeFriend = (identifier) => {
    setSteamIds(steamIds.filter(p => p.identifier !== identifier));
  };

  const fetchGames = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await api.get('/common-games', {
        params: { user_url: steamIds.map(p => p.steamid).join(',') }
      })
      
      if (response.data.Error) {
        setError(response.data.Error)
      } else {
        navigate('/results', { state: { games: response.data.games, filters: response.data.filters } })
      }
    } catch (error) {
      setError('Loading error: ' + (error.response?.data?.detail || error.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-10">
      {/* Hero section */}
      <div className="text-center max-w-2xl mb-12">
        <h1 className="text-5xl font-black tracking-tight mb-4 italic uppercase">
          WhatWe<span className="text-blue-500">Play</span>
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed">
          The ultimate tool to find common ground in your Steam libraries. Stop arguing, start playing.
          Enter your friend's <span className="text-blue-400 font-semibold">Steam IDs</span> below and instantly discover your next adventure.
        </p>
      </div>

      {/* Input Card */}
      <div className="flex gap-2 mb-4 w-full max-w-2xl">
        <input 
          className="flex-grow p-3 rounded-xl bg-slate-900 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
          placeholder="Steam ID or Vanity URL..."
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addFriend()}
          />
          <button 
          onClick={addFriend}
          className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-600 disabled:opacity-50 px-6 py-3 rounded-xl font-bold text-blue-400 transition"
          disabled={addingFriend}
          >
          {addingFriend ? '...' : 'Add'}
          </button>
      </div>

      {/* Name bubbles */}
      <div className="flex flex-wrap gap-2 mb-8 w-full max-w-2xl justify-start">
          {steamIds.map((player) => (
          <div key={player.identifier} className="flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 px-3 py-1 text-sm font-semibold animate-in fade-in zoom-in duration-300 rounded-lg">
            <img src={player.avatar} className="w-7 h-7 rounded-full border border-slate-600" alt="avatar" />
            <span className="text-xs font-bold text-slate-200">
                {player.name}
            </span>
            {!player.isLoading && (
              <button 
              onClick={() => removeFriend(player.identifier)}
              className="hover:text-red-400 text-blue-500 font-black ml-1"
              >
              ✕
              </button>
            )}
          </div>
          ))}
      </div>

      <button 
          className="w-fit bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 py-3 px-10 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-blue-900/20 transition-all active:scale-95"
          onClick={fetchGames}
          disabled={loading || steamIds.length === 0}
      >
          {loading ? (
          <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              Finding Matches...
          </span>
          ) : 'Find Common Games'}
      </button>

      {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm text-center font-medium">{error}</p>
          </div>
      )}
      </div>
  )
}

export default Home
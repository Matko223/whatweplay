import React, { useState } from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom';

function Home() {
  const [steamId, setSteamId] = useState('')
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate();

  const fetchGames = async () => {
    if (!steamId) return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await api.get('/common-games', {
        params: { user_url: steamId }
      })
      
      if (response.data.Error) {
        setError(response.data.Error)
        setGames([])
      } else {
        setGames(response.data)
        navigate('/results', { state: { games: response.data } })
      }
    } catch (error) {
      setError('Error fetching games: ' + (error.response?.data?.detail || error.message))
      console.error('Error:', error)
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

      {/* Input and Button */}
      <div className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700 w-full max-w-md mb-8">
        <h1 className="text-2xl font-bold mb-4 text-center">Find Games To Play</h1>
        <input 
          className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter Steam ID or vanity URL..."
          value={steamId}
          onChange={(e) => setSteamId(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && fetchGames()}
        />
        <button 
          className="w-full mt-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 py-2 rounded font-semibold transition"
          onClick={fetchGames}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Find Games'}
        </button>

        {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
      </div>
    </div>
  )
}

export default Home
import React, { useState } from 'react'
import api from '../api'

function Home() {
  const [steamId, setSteamId] = useState('')
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      <div className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700 w-full max-w-md mb-8">
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

        <div className="mt-6">
          {games.length > 0 ? (
            <div>
              <h2 className="text-lg font-bold mb-4">Games ({games.length})</h2>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {games.map((game) => (
                    <div key={game.appid} className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg border-b border-slate-600/50">                    <div className="flex flex-col">
                      <span className="font-semibold">{game.name}</span>
                      <span className="text-sm text-slate-400">Playtime: {Math.round(game.playtime_forever / 60)} hrs</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            !loading && <p className="text-slate-400 text-center">No games found. Try entering a valid Steam ID or vanity URL.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
import React, { useState } from 'react'
import axios from 'axios'

function App() {
  const [steamId, setSteamId] = useState('')
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchGames = async () => {
    if (!steamId) return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await axios.get('http://localhost:8000/common-games', {
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
                  <div key={game.appid} className="bg-slate-700 p-3 rounded border border-slate-600">
                    <p className="font-semibold">{game.name}</p>
                    <p className="text-sm text-gray-400">{Math.round(game.playtime_forever / 60)} hours</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-400">No games found. Please enter a valid Steam ID or vanity URL.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
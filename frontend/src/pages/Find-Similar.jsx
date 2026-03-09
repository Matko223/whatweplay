import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

function FindSimilar() {
  const [currentInput, setCurrentInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!currentInput.trim()) {
      return
    }

    setLoading(true)
    setError('')

    try {
      // Validate if game exists by calling the backend
      const response = await fetch(`http://localhost:8000/recommended-games/${currentInput}?limit=1`)
      const data = await response.json()
      
      if (data.Error) {
        setError(data.Error)
      } else {
        // Game is valid, navigate to recommended page
        navigate(`/recommended?gameId=${currentInput}&gameName=${encodeURIComponent(currentInput)}`)
      }
    } catch (err) {
      setError('Failed to validate game. Please try again.')
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
          Enter a <span className="text-blue-400 font-semibold">Game Name or AppID</span> below and instantly discover your next adventure.
        </p>
      </div>

      {/* Input Card */}
      <div className="flex gap-2 mb-4 w-full max-w-2xl">
        <input 
          className="flex-grow p-3 rounded-xl bg-slate-900 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
          placeholder="AppID or Game Name..."
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          disabled={loading}
          />
      </div>

      <button 
          onClick={handleSearch}
          className="w-fit bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 py-3 px-10 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-blue-900/20 transition-all active:scale-95"
          disabled={!currentInput.trim() || loading}
      >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              Validating...
            </span>
          ) : 'Find Similar Games'}
      </button>

      {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm text-center font-medium">{error}</p>
          </div>
      )}
    </div>
  )
}

export default FindSimilar
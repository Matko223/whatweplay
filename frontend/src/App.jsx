import React, { useState, useEffect } from 'react'

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-10">
    
      <div className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700 w-full max-w-md">
        <input 
          className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter Steam ID..."
        />
        <button className="w-full mt-4 bg-blue-600 hover:bg-blue-500 py-2 rounded font-semibold transition">
          Find Games
        </button>
      </div>
    </div>
  )
}

export default App
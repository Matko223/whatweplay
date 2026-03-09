import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-slate-900 text-white px-8 py-4 mx-auto flex items-center justify-between border-b border-slate-700 w-full shadow-lg">
      {/* Logo */}
      <Link to="/" className="group flex-shrink-0">
        <span className="text-4xl font-black italic uppercase tracking-tighter leading-none">
          WhatWe<span className="text-blue-500 italic">Play</span>
        </span>
      </Link>

      {/* Navigation Links */}
      <div className="flex items-center gap-8">
        <Link 
          to="/" 
          className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 hover:text-blue-400 transition-all duration-300 relative group"
        >
          Home
        </Link>

        <Link 
          to="/find-similar" 
          className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 hover:text-blue-400 transition-all duration-300 relative group"
        >
          Find Similar
        </Link>

      </div>
    </nav>
  );
}

export default Navbar;
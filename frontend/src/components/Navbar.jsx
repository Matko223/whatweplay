import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-slate-900 text-white px-6 py-3 mx-auto flex items-center border-b border-slate-700 w-full">
        <Link to="/">
        <span className="text-3xl font-black tracking-tighter leading-none uppercase flex-1 italic">
              WhatWe<span className="text-blue-500 italic">Play</span>
        </span>
        </Link>
    </nav>
  );
}

export default Navbar;
import React from "react";

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-8 mt-auto">
      <div className="container mx-auto px-6">
        <div className="border-t border-slate-800 pt-8 flex flex-col lg:flex-row justify-between items-center gap-8 text-xs tracking-wider uppercase font-bold text-slate-500">
          
          {/* Logo and Slogan*/}
          <div className="flex flex-col items-center lg:items-start shrink-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl font-black tracking-tighter uppercase italic text-white">
                WhatWe<span className="text-blue-500">Play</span>
              </span>
            </div>
            <p className="text-xs font-medium tracking-normal text-slate-600 max-w-[250px] text-center lg:text-left">
              The ultimate tool to find common ground in your Steam libraries. 
              Stop arguing, start playing.
            </p>
          </div>
          
          {/* Copyright text */}
          <p className="text-center">
            &copy; {new Date().getFullYear()} WhatWePlay. Built with FastAPI & React.
          </p>

          {/* Links */}
          <div className="flex gap-6 shrink-0">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
          </div>
          
        </div>
      </div>
    </footer>
  );
}

export default Footer;
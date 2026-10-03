import React from 'react';
import { BookOpen, Sparkles, PlusCircle, Library, Zap } from 'lucide-react';

interface NavbarProps {
  activeTab: 'home' | 'create' | 'comics' | 'viewer';
  onSelectTab: (tab: 'home' | 'create' | 'comics') => void;
  savedCount?: number;
  onOpenDemo?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  savedCount = 0,
  onOpenDemo,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b-2 border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-11 h-11 bg-amber-400 border-2 border-black rounded-xl flex items-center justify-center shadow-[3px_3px_0px_#000] group-hover:rotate-6 transition-transform">
            <BookOpen className="w-6 h-6 text-black" strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bangers text-3xl tracking-wide text-white group-hover:text-amber-400 transition-colors">
                ComicCraft
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-black rounded border border-black shadow-[1px_1px_0px_#000]">
                Gemini AI
              </span>
              <span className="hidden xl:inline-flex items-center gap-1 text-[11px] font-comic font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full ml-1">
                <span>⚡ Gemini requests are optimized to reduce API usage.</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium -mt-1 hidden sm:block">
              AI Comic Story Creator
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onSelectTab('home')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'home'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => onSelectTab('create')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
              activeTab === 'create'
                ? 'bg-amber-400 text-black border-black shadow-[3px_3px_0px_#000] scale-[1.02]'
                : 'bg-amber-400/90 hover:bg-amber-400 text-black border-black shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000]'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-black" strokeWidth={2.5} />
            <span>Create Comic</span>
          </button>

          <button
            onClick={() => onSelectTab('comics')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all ${
              activeTab === 'comics'
                ? 'bg-slate-800 text-amber-400 border-amber-400/60 shadow-[2px_2px_0px_rgba(251,191,36,0.3)]'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600 hover:text-white'
            }`}
          >
            <Library className="w-4 h-4" />
            <span>My Comics</span>
            {savedCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-400 text-black text-[11px] font-bold flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </button>

          {onOpenDemo && (
            <button
              onClick={onOpenDemo}
              title="Load 'The Late Student' College Demo Comic"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 hover:bg-amber-900/60 transition-all"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Demo Comic</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

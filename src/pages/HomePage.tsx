import React from 'react';
import { BookOpen, Sparkles, Wand2, Users, Download, ArrowRight, ShieldCheck, Zap, Layers, MessageSquare } from 'lucide-react';
import { ComicData } from '../types.ts';

interface HomePageProps {
  onCreateClick: () => void;
  onMyComicsClick: () => void;
  onOpenDemo: () => void;
  demoComic?: ComicData | null;
}

export const HomePage: React.FC<HomePageProps> = ({
  onCreateClick,
  onMyComicsClick,
  onOpenDemo,
  demoComic,
}) => {
  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-20 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
          {/* Comic Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400 text-black border-2 border-black shadow-[3px_3px_0px_#000]">
            <Sparkles className="w-4 h-4 text-black fill-black" />
            <span className="font-bangers text-sm sm:text-base tracking-wider uppercase">
              Powered by Google Gemini 3.8 Flash & Gemini Image Models
            </span>
          </div>

          {/* Main Title & Tagline */}
          <div className="space-y-3">
            <h1 className="font-bangers text-5xl sm:text-7xl lg:text-8xl text-white tracking-wider drop-shadow-[5px_5px_0px_#000]">
              Turn Your Ideas Into Comics With AI
            </h1>
            <p className="font-comic text-lg sm:text-2xl text-amber-300 font-bold max-w-3xl mx-auto">
              From a single sentence to a multi-panel visual graphic narrative in seconds.
            </p>
          </div>

          <p className="font-comic text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            ComicCraft transforms simple prompts into structured story arcs, consistent characters, dynamic panel artwork, and fully editable speech bubbles.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={onCreateClick}
              className="flex items-center gap-2.5 px-8 py-4 rounded-2xl text-lg font-bangers text-black tracking-wide bg-amber-400 hover:bg-amber-300 border-4 border-black shadow-[6px_6px_0px_#000] hover:shadow-[8px_8px_0px_#000] transition-all transform active:translate-x-1 active:translate-y-1"
            >
              <Sparkles className="w-5 h-5 text-black" />
              <span>CREATE COMIC NOW</span>
              <ArrowRight className="w-5 h-5 text-black" />
            </button>

            <button
              onClick={onMyComicsClick}
              className="flex items-center gap-2 px-6 py-4 rounded-2xl text-base font-bold bg-slate-900 hover:bg-slate-800 text-white border-3 border-black shadow-[4px_4px_0px_#000] transition-all"
            >
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span>My Comics Gallery</span>
            </button>

            <button
              onClick={onOpenDemo}
              className="flex items-center gap-2 px-5 py-4 rounded-2xl text-base font-bold text-amber-300 bg-amber-950/40 hover:bg-amber-950/80 border-2 border-amber-500/50 transition-all"
            >
              <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span>Explore Demo Comic</span>
            </button>
          </div>

          {/* College CSE Project Badge */}
          <div className="pt-6">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-900/60 px-4 py-1.5 rounded-full border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              College CSE Team Project &bull; Full-Stack AI Architecture &bull; Dual MongoDB & Local File Storage
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Example Comic Preview Section */}
      {demoComic && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-slate-900/80 border-4 border-black rounded-3xl p-6 sm:p-8 shadow-[10px_10px_0px_#000]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="font-bangers text-xs tracking-wider uppercase px-2.5 py-1 bg-amber-400 text-black border border-black rounded shadow-[1.5px_1.5px_0px_#000]">
                  EXAMPLE STORY PREVIEW
                </span>
                <h2 className="font-bangers text-3xl sm:text-4xl text-white tracking-wide mt-2">
                  "{demoComic.title}" ({demoComic.genre} &bull; {demoComic.panelCount} Panels)
                </h2>
                <p className="font-comic text-xs sm:text-sm text-slate-300 italic mt-1">
                  Prompt: "{demoComic.originalPrompt}"
                </p>
              </div>

              <button
                onClick={onOpenDemo}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bangers text-base tracking-wide bg-amber-400 hover:bg-amber-300 text-black border-2 border-black shadow-[3px_3px_0px_#000] transition-all self-start sm:self-auto"
              >
                <span>OPEN & EDIT IN VIEWER</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Strip of First 3 Panels Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {demoComic.panels.slice(0, 3).map(p => (
                <div
                  key={p.panelNumber}
                  onClick={onOpenDemo}
                  className="group relative cursor-pointer bg-slate-950 border-3 border-black rounded-xl overflow-hidden shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] transition-all"
                >
                  <div className="aspect-4/3 overflow-hidden">
                    <img
                      src={p.imageUrl}
                      alt={`Panel ${p.panelNumber}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
                    <span className="font-bangers text-sm text-amber-400">
                      Panel #{p.panelNumber}
                    </span>
                    <span className="font-comic text-[11px] text-slate-300 truncate max-w-[70%]">
                      {p.dialogue?.[0]?.text || p.caption}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Feature Cards Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="font-bangers text-4xl sm:text-5xl text-white tracking-wide">
            Engineered For Creative Storytelling
          </h2>
          <p className="font-comic text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Powered by modern Gemini structured output models and clean layered frontend architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-slate-900 border-3 border-black rounded-2xl p-6 shadow-[6px_6px_0px_#000] space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-400 border-2 border-black flex items-center justify-center text-black shadow-[3px_3px_0px_#000]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bangers text-2xl text-white tracking-wide">
              Gemini Structured Story Engine
            </h3>
            <p className="font-comic text-xs sm:text-sm text-slate-300 leading-relaxed">
              Uses Gemini 3.8 Flash with JSON schemas to map natural-language ideas into multi-panel arcs with setups, dramatic developments, and punchlines.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-900 border-3 border-black rounded-2xl p-6 shadow-[6px_6px_0px_#000] space-y-3">
            <div className="w-12 h-12 rounded-xl bg-sky-400 border-2 border-black flex items-center justify-center text-black shadow-[3px_3px_0px_#000]">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bangers text-2xl text-white tracking-wide">
              Character Consistency
            </h3>
            <p className="font-comic text-xs sm:text-sm text-slate-300 leading-relaxed">
              Maintains hair, attire, and signatures across every scene description and artwork prompt so characters remain recognizable across the comic.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-900 border-3 border-black rounded-2xl p-6 shadow-[6px_6px_0px_#000] space-y-3">
            <div className="w-12 h-12 rounded-xl bg-rose-400 border-2 border-black flex items-center justify-center text-black shadow-[3px_3px_0px_#000]">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-bangers text-2xl text-white tracking-wide">
              Layered Speech Bubbles
            </h3>
            <p className="font-comic text-xs sm:text-sm text-slate-300 leading-relaxed">
              Text is rendered dynamically via HTML/CSS over artwork rather than baked in. Edit text, reposition bubbles, or switch bubble styles instantly.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-slate-900 border-3 border-black rounded-2xl p-6 shadow-[6px_6px_0px_#000] space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-400 border-2 border-black flex items-center justify-center text-black shadow-[3px_3px_0px_#000]">
              <Wand2 className="w-6 h-6" />
            </div>
            <h3 className="font-bangers text-2xl text-white tracking-wide">
              AI Story Doctor & Twists
            </h3>
            <p className="font-comic text-xs sm:text-sm text-slate-300 leading-relaxed">
              Use live Gemini calls to Make Story Funnier, Elevate Dramatic Stakes, Add Plot Twists, Generate Alternate Endings, or Improve Dialogue.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-slate-900 border-3 border-black rounded-2xl p-6 shadow-[6px_6px_0px_#000] space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-400 border-2 border-black flex items-center justify-center text-black shadow-[3px_3px_0px_#000]">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-bangers text-2xl text-white tracking-wide">
              Single-Panel Regeneration
            </h3>
            <p className="font-comic text-xs sm:text-sm text-slate-300 leading-relaxed">
              Regenerate or edit individual panels without losing the rest of your story, saving time and keeping continuity intact.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-slate-900 border-3 border-black rounded-2xl p-6 shadow-[6px_6px_0px_#000] space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-400 border-2 border-black flex items-center justify-center text-black shadow-[3px_3px_0px_#000]">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="font-bangers text-2xl text-white tracking-wide">
              High-Res PNG & PDF Export
            </h3>
            <p className="font-comic text-xs sm:text-sm text-slate-300 leading-relaxed">
              Export complete comic sheets with titles, panel borders, speech bubbles, captions, and publication credits ready for presentation.
            </p>
          </div>
        </div>
      </section>

      {/* Problem Statement Callout (Requirement 28 & 29) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-950 border-4 border-amber-400/80 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-bangers text-amber-400 text-xl tracking-wide uppercase">
              ACADEMIC CONTEXT & PROBLEM STATEMENT
            </span>
          </div>

          <p className="font-comic text-sm sm:text-base text-slate-300 leading-relaxed">
            Traditional comic creation requires combined artistic illustration skills, dialogue writing ability, and substantial time. Users with creative ideas often struggle to transform them into coherent visual stories.
          </p>

          <p className="font-comic text-sm text-slate-400 leading-relaxed">
            <strong>ComicCraft</strong> demonstrates the practical engineering of generative AI: turning natural-language inputs into structured comic stories, consistent character models, scene illustrations, and responsive interactive web layouts with real-time editing and export.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 border-t border-slate-800 text-center text-xs text-slate-500 font-comic space-y-2">
        <p>ComicCraft &bull; AI Comic Story Creator &bull; Powered by Google AI Studio & Gemini Models</p>
        <p>Department of Computer Science & Engineering &bull; College Capstone Team Project</p>
      </footer>
    </div>
  );
};

import React, { useState } from 'react';
import { Genre, ArtStyle, GenerateComicRequest } from '../types.ts';
import { Sparkles, Palette, Grid, BookOpen, Lightbulb, AlertCircle } from 'lucide-react';

interface StoryFormProps {
  onGenerate: (data: GenerateComicRequest) => void;
  isLoading: boolean;
}

const GENRES: { id: Genre; label: string; icon: string; color: string }[] = [
  { id: 'Comedy', label: 'Comedy', icon: '😄', color: 'bg-amber-400 text-black border-black' },
  { id: 'Action', label: 'Action', icon: '💥', color: 'bg-red-500 text-white border-black' },
  { id: 'Adventure', label: 'Adventure', icon: '🗺️', color: 'bg-emerald-500 text-white border-black' },
  { id: 'Fantasy', label: 'Fantasy', icon: '🧙‍♂️', color: 'bg-purple-500 text-white border-black' },
  { id: 'Horror', label: 'Horror', icon: '👻', color: 'bg-slate-700 text-white border-black' },
  { id: 'Romance', label: 'Romance', icon: '💖', color: 'bg-pink-500 text-white border-black' },
  { id: 'Sci-Fi', label: 'Sci-Fi', icon: '🚀', color: 'bg-cyan-500 text-black border-black' },
  { id: 'Mystery', label: 'Mystery', icon: '🔍', color: 'bg-indigo-600 text-white border-black' },
  { id: 'Drama', label: 'Drama', icon: '🎭', color: 'bg-blue-600 text-white border-black' },
];

const ART_STYLES: { id: ArtStyle; label: string; desc: string }[] = [
  { id: 'Comic Book', label: 'Comic Book', desc: 'Classic Western comic, bold ink outlines & vivid halftones' },
  { id: 'Manga', label: 'Manga', desc: 'Japanese manga style with dynamic screentones & action lines' },
  { id: 'Cartoon', label: 'Cartoon', desc: 'Bright, whimsical, expressive cartoon animation style' },
  { id: 'Superhero', label: 'Superhero', desc: 'Dramatic cinematic shadows, high energy, bold hero frames' },
  { id: 'Anime-inspired', label: 'Anime-inspired', desc: 'Luminous anime aesthetics with detailed hair & lighting' },
  { id: 'Watercolor', label: 'Watercolor', desc: 'Soft painted textures, evocative brushstrokes & pastel depth' },
  { id: 'Minimalist', label: 'Minimalist', desc: 'Clean vector lines, understated palette & modern layout' },
];

const SAMPLE_IDEAS = [
  'A college student who is always late to class tries to sneak past the professor.',
  'A friendly robot enrolls in a human college and struggles with canteen food.',
  'A detective investigating the mysterious case of missing library books.',
  'An engineer accidentally invents a coffee mug that talks back.',
];

export const StoryForm: React.FC<StoryFormProps> = ({ onGenerate, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState<Genre>('Comedy');
  const [artStyle, setArtStyle] = useState<ArtStyle>('Comic Book');
  const [panelCount, setPanelCount] = useState<number>(4);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (!prompt || prompt.trim().length === 0) {
      setValidationError('Please enter a story idea to generate your comic.');
      return;
    }
    setValidationError('');
    onGenerate({
      prompt: prompt.trim(),
      genre,
      artStyle,
      panelCount,
    });
  };

  const handleSelectSample = (sample: string) => {
    setPrompt(sample);
    setValidationError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Story Idea Input */}
      <div className="bg-slate-900/90 border-4 border-black rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_#000]">
        <div className="flex items-center justify-between mb-2">
          <label className="font-bangers text-2xl text-white tracking-wide flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-400" />
            1. Describe Your Comic Story Idea
          </label>
          <span className="text-xs text-slate-400 font-medium">
            Natural Language Input
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-3">
          Gemini will create the plot, dialogue, characters, scene descriptions, and artwork prompts.
        </p>

        <textarea
          rows={4}
          value={prompt}
          onChange={e => {
            setPrompt(e.target.value);
            if (validationError) setValidationError('');
          }}
          placeholder="Describe your comic idea... e.g. A lazy college student tries to survive morning classes after waking up late."
          className="w-full bg-slate-950 border-2 border-slate-700 focus:border-amber-400 rounded-2xl p-4 text-base text-white placeholder-slate-500 focus:outline-hidden transition-colors resize-none"
        />

        {validationError && (
          <div className="flex items-center gap-2 mt-2 text-rose-400 text-xs font-semibold">
            <AlertCircle className="w-4 h-4" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Quick Sample Inspiration Chips */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold mb-2">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Try an example idea:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_IDEAS.map((idea, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSample(idea)}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-amber-400/50 transition-all text-left"
              >
                "{idea}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Genre Selector */}
      <div className="bg-slate-900/90 border-4 border-black rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_#000]">
        <label className="font-bangers text-2xl text-white tracking-wide flex items-center gap-2 mb-2">
          <span className="text-amber-400">#</span>
          2. Select Story Genre
        </label>
        <p className="text-xs text-slate-400 mb-4">
          Tunes Gemini's narrative pacing, comedic timing, or dramatic tension.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {GENRES.map(g => {
            const isSelected = genre === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setGenre(g.id)}
                className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center gap-2.5 ${
                  isSelected
                    ? `${g.color} shadow-[4px_4px_0px_#000] scale-[1.03] font-bold`
                    : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-900'
                }`}
              >
                <span className="text-xl">{g.icon}</span>
                <span className="text-sm font-semibold">{g.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Art Style Selector */}
      <div className="bg-slate-900/90 border-4 border-black rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_#000]">
        <label className="font-bangers text-2xl text-white tracking-wide flex items-center gap-2 mb-2">
          <Palette className="w-6 h-6 text-amber-400" />
          3. Choose Visual Art Style
        </label>
        <p className="text-xs text-slate-400 mb-4">
          Defines the artistic aesthetics, inking, coloring, and panel composition.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ART_STYLES.map(style => {
            const isSelected = artStyle === style.id;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => setArtStyle(style.id)}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  isSelected
                    ? 'bg-amber-400 text-black border-black shadow-[4px_4px_0px_#000] scale-[1.02]'
                    : 'bg-slate-950 border-slate-700 text-slate-200 hover:border-slate-500 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bangers text-lg tracking-wide">
                    {style.label}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-black text-amber-400">
                      Selected
                    </span>
                  )}
                </div>
                <p className={`text-xs ${isSelected ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
                  {style.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel Count Selector */}
      <div className="bg-slate-900/90 border-4 border-black rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_#000]">
        <label className="font-bangers text-2xl text-white tracking-wide flex items-center gap-2 mb-2">
          <Grid className="w-6 h-6 text-amber-400" />
          4. Number of Panels
        </label>
        <p className="text-xs text-slate-400 mb-4">
          Choose the narrative length: 4 panels (quick strip), 6 panels (standard page), or 8 panels (extended comic).
        </p>

        <div className="grid grid-cols-3 gap-4 max-w-md">
          {[4, 6, 8].map(count => {
            const isSelected = panelCount === count;
            return (
              <button
                key={count}
                type="button"
                onClick={() => setPanelCount(count)}
                className={`py-3 px-4 rounded-2xl border-2 text-center transition-all ${
                  isSelected
                    ? 'bg-amber-400 text-black border-black shadow-[4px_4px_0px_#000] scale-[1.04]'
                    : 'bg-slate-950 border-slate-700 text-slate-200 hover:border-slate-500 hover:bg-slate-900'
                }`}
              >
                <span className="font-bangers text-3xl block">{count}</span>
                <span className={`text-[11px] font-bold uppercase tracking-wider block ${isSelected ? 'text-black' : 'text-slate-400'}`}>
                  Panels
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex flex-col items-center gap-2 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto min-w-[280px] flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-lg font-bangers text-black tracking-wider bg-amber-400 hover:bg-amber-300 border-4 border-black shadow-[6px_6px_0px_#000] hover:shadow-[8px_8px_0px_#000] transition-all transform active:translate-x-1 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-6 h-6 text-black" strokeWidth={2.5} />
          <span>{isLoading ? 'GENERATING COMIC...' : 'GENERATE COMIC WITH GEMINI'}</span>
        </button>

        {/* Small AI usage indicator (Requirement 19) */}
        <div className="inline-flex items-center gap-1.5 text-xs font-comic text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full mt-1">
          <span>⚡ Gemini requests are optimized to reduce API usage.</span>
        </div>
        <p className="text-[11px] text-slate-500 font-comic">
          Complete story, characters, and panels are created in 1 structured Gemini request to conserve your daily quota.
        </p>
      </div>
    </form>
  );
};

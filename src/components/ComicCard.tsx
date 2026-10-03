import React from 'react';
import { ComicData } from '../types.ts';
import { BookOpen, Calendar, Trash2, ArrowUpRight, Grid } from 'lucide-react';

interface ComicCardProps {
  comic: ComicData;
  onOpen: (comic: ComicData) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export const ComicCard: React.FC<ComicCardProps> = ({ comic, onOpen, onDelete }) => {
  const panel1 = comic.panels && comic.panels.length > 0 ? comic.panels[0] : null;
  const comicId = comic.id || comic._id || '';

  const formattedDate = comic.createdAt
    ? new Date(comic.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent';

  return (
    <div
      onClick={() => onOpen(comic)}
      className="group cursor-pointer bg-slate-900 border-4 border-black rounded-2xl overflow-hidden shadow-[6px_6px_0px_#000] hover:shadow-[10px_10px_0px_#000] hover:-translate-y-1 transition-all flex flex-col justify-between"
    >
      {/* Thumbnail Area */}
      <div className="relative aspect-16/10 bg-slate-950 overflow-hidden border-b-2 border-black flex items-center justify-center">
        {panel1?.imageUrl ? (
          <img
            src={panel1.imageUrl}
            alt={comic.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center text-slate-600">
            <BookOpen className="w-8 h-8 mb-1" />
            <span className="text-[11px] font-semibold">No thumbnail</span>
          </div>
        )}

        {/* Badges on Thumbnail */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <span className="font-bangers text-xs px-2 py-0.5 bg-amber-400 text-black border border-black rounded shadow-[1.5px_1.5px_0px_#000]">
            {comic.genre}
          </span>
          <span className="font-comic text-[10px] font-bold px-2 py-0.5 bg-black/80 text-white rounded border border-slate-700">
            {comic.artStyle}
          </span>
        </div>

        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/80 px-2 py-0.5 rounded text-[11px] font-bold text-amber-300 border border-slate-700">
          <Grid className="w-3 h-3" />
          <span>{comic.panels?.length || comic.panelCount} Panels</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="font-bangers text-xl sm:text-2xl text-white tracking-wide group-hover:text-amber-400 transition-colors line-clamp-1">
            {comic.title}
          </h3>
          <p className="font-comic text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">
            {comic.summary || comic.originalPrompt}
          </p>
        </div>

        {/* Footer Details & Actions */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={e => onDelete(comicId, e)}
              title="Delete Comic"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-0.5 text-amber-400 font-bold font-comic group-hover:translate-x-0.5 transition-transform">
              <span>Read</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

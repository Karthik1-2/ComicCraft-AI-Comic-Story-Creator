import React from 'react';
import { ComicPanelData } from '../types.ts';
import { SpeechBubble } from './SpeechBubble.tsx';
import { Edit3, RefreshCw, Sparkles, Trash2, Loader2, AlertCircle } from 'lucide-react';

interface ComicPanelProps {
  panel: ComicPanelData;
  totalPanels: number;
  onEdit: (panelNumber: number) => void;
  onRegenerate: (panelNumber: number) => void;
  onImproveDialogue: (panelNumber: number) => void;
  onDelete: (panelNumber: number) => void;
  isRegenerating?: boolean;
}

export const ComicPanel: React.FC<ComicPanelProps> = ({
  panel,
  totalPanels,
  onEdit,
  onRegenerate,
  onImproveDialogue,
  onDelete,
  isRegenerating = false,
}) => {
  return (
    <div className="relative group flex flex-col bg-slate-900 border-4 border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_#000000] hover:shadow-[8px_8px_0px_#000000] transition-shadow">
      {/* Top Banner / Number & Caption */}
      <div className="absolute top-2 left-2 z-30 flex items-center gap-2">
        <span className="font-bangers text-base px-2.5 py-0.5 bg-amber-400 text-black border-2 border-black rounded shadow-[2px_2px_0px_#000]">
          #{panel.panelNumber}
        </span>
      </div>

      {/* Comic Action Menu Toolbar (Desktop hover & mobile accessible) */}
      <div className="absolute top-2 right-2 z-30 flex items-center gap-1 bg-black/85 backdrop-blur-sm p-1 rounded-lg border border-slate-700 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(panel.panelNumber)}
          title="Edit Dialogue & Details"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onImproveDialogue(panel.panelNumber)}
          title="Gemini: Improve Dialogue"
          className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-950/60 rounded transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onRegenerate(panel.panelNumber)}
          disabled={isRegenerating}
          title="Regenerate This Panel Artwork"
          className="p-1.5 text-sky-400 hover:text-sky-300 hover:bg-sky-950/60 rounded transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
        </button>

        {totalPanels > 2 && (
          <button
            onClick={() => onDelete(panel.panelNumber)}
            title="Delete Panel"
            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/60 rounded transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Panel Canvas Area */}
      <div className="relative w-full aspect-4/3 overflow-hidden bg-slate-950 flex items-center justify-center">
        {panel.imageUrl ? (
          <img
            src={panel.imageUrl}
            alt={panel.sceneDescription || `Comic Panel ${panel.panelNumber}`}
            className="w-full h-full object-cover select-none"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-slate-500">
            <AlertCircle className="w-10 h-10 text-amber-500 mb-2" />
            <p className="text-sm font-semibold">Artwork pending</p>
          </div>
        )}

        {/* Retry button if panel image had an issue */}
        {panel.error && (
          <div className="absolute bottom-3 left-3 z-30">
            <button
              onClick={() => onRegenerate(panel.panelNumber)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-black rounded-lg text-xs font-bold border-2 border-black shadow-[2px_2px_0px_#000] transition-transform active:translate-x-0.5 active:translate-y-0.5"
              title="Click to retry artwork generation for this panel"
            >
              <RefreshCw className="w-3 h-3 text-black" />
              <span>Retry Artwork</span>
            </button>
          </div>
        )}

        {/* Speech Bubbles Layer */}
        {panel.dialogue && panel.dialogue.map((diag, idx) => (
          <SpeechBubble
            key={idx}
            dialogue={diag}
            onClick={() => onEdit(panel.panelNumber)}
            isEditable={true}
          />
        ))}

        {/* Loading Overlay */}
        {isRegenerating && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center z-40 gap-2">
            <Loader2 className="w-9 h-9 text-amber-400 animate-spin" />
            <span className="font-comic text-sm font-bold text-amber-300">
              Regenerating Panel #{panel.panelNumber}...
            </span>
          </div>
        )}
      </div>

      {/* Caption Box (Classic Comic Style) */}
      {panel.caption && panel.caption.trim() !== '' && (
        <div className="bg-amber-100 text-slate-900 border-t-2 border-black px-3.5 py-1.5 flex items-start gap-2 shadow-inner">
          <span className="font-bangers text-xs text-amber-800 tracking-wider uppercase mt-0.5">
            CAPTION:
          </span>
          <p className="font-comic text-xs font-bold leading-tight">
            {panel.caption}
          </p>
        </div>
      )}

      {/* Scene note footer in subtle print font */}
      <div className="bg-slate-950 border-t border-slate-800 px-3 py-1 flex items-center justify-between text-[11px] text-slate-400">
        <span className="truncate max-w-[80%]" title={panel.sceneDescription}>
          {panel.sceneDescription}
        </span>
        <button
          onClick={() => onEdit(panel.panelNumber)}
          className="text-amber-400 hover:underline font-semibold ml-2 shrink-0"
        >
          Edit
        </button>
      </div>
    </div>
  );
};

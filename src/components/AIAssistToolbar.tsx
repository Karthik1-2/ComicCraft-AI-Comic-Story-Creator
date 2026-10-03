import React from 'react';
import { Laugh, Flame, Wand2, RefreshCcw, PlusSquare, Loader2 } from 'lucide-react';

interface AIAssistToolbarProps {
  onMakeFunnier: () => void;
  onMakeDramatic: () => void;
  onAddPlotTwist: () => void;
  onChangeEnding: () => void;
  onAddPanel: () => void;
  isAiWorking: boolean;
  activeAction?: string;
}

export const AIAssistToolbar: React.FC<AIAssistToolbarProps> = ({
  onMakeFunnier,
  onMakeDramatic,
  onAddPlotTwist,
  onChangeEnding,
  onAddPanel,
  isAiWorking,
  activeAction,
}) => {
  return (
    <div className="bg-slate-900/90 border-2 border-slate-800 rounded-2xl p-3 sm:p-4 shadow-lg backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center">
            <Wand2 className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="font-bangers text-lg text-white tracking-wide">
              Gemini AI Studio Assist
            </h3>
            <p className="text-[11px] text-slate-400">
              Transform your story with live Gemini AI creative rewrites
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onMakeFunnier}
            disabled={isAiWorking}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:border-amber-400 transition-all disabled:opacity-50"
          >
            {isAiWorking && activeAction === 'funnier' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Laugh className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>Make Funnier</span>
          </button>

          <button
            onClick={onMakeDramatic}
            disabled={isAiWorking}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:border-rose-400 transition-all disabled:opacity-50"
          >
            {isAiWorking && activeAction === 'dramatic' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Flame className="w-3.5 h-3.5 text-rose-400" />
            )}
            <span>Make Dramatic</span>
          </button>

          <button
            onClick={onAddPlotTwist}
            disabled={isAiWorking}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:border-purple-400 transition-all disabled:opacity-50"
          >
            {isAiWorking && activeAction === 'twist' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Wand2 className="w-3.5 h-3.5 text-purple-400" />
            )}
            <span>Add Plot Twist</span>
          </button>

          <button
            onClick={onChangeEnding}
            disabled={isAiWorking}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 hover:border-sky-400 transition-all disabled:opacity-50"
          >
            {isAiWorking && activeAction === 'ending' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCcw className="w-3.5 h-3.5 text-sky-400" />
            )}
            <span>Change Ending</span>
          </button>

          <button
            onClick={onAddPanel}
            disabled={isAiWorking}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400 transition-all disabled:opacity-50"
          >
            {isAiWorking && activeAction === 'add-panel' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <PlusSquare className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>+ Add Panel</span>
          </button>
        </div>
      </div>
    </div>
  );
};

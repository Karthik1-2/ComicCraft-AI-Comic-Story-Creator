import React, { useState, useRef } from 'react';
import { ComicData, ComicPanelData } from '../types.ts';
import { ComicPanel } from './ComicPanel.tsx';
import { PanelEditor } from './PanelEditor.tsx';
import { CharacterCard } from './CharacterCard.tsx';
import { AIAssistToolbar } from './AIAssistToolbar.tsx';
import { ExportButton } from './ExportButton.tsx';
import { Save, Users, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';

interface ComicViewerProps {
  comic: ComicData;
  onUpdateComic: (updated: ComicData) => void;
  onSaveToCloud?: () => void;
  onBack?: () => void;
  onRegeneratePanel: (panelNumber: number) => Promise<void>;
  onImproveDialogue: (panelNumber: number) => Promise<void>;
  onDeletePanel: (panelNumber: number) => void;
  onMakeFunnier: () => Promise<void>;
  onMakeDramatic: () => Promise<void>;
  onAddPlotTwist: () => Promise<void>;
  onChangeEnding: () => Promise<void>;
  onAddPanel: () => Promise<void>;
  isAiWorking: boolean;
  activeAction?: string;
  regeneratingPanelNumber?: number | null;
}

export const ComicViewer: React.FC<ComicViewerProps> = ({
  comic,
  onUpdateComic,
  onSaveToCloud,
  onBack,
  onRegeneratePanel,
  onImproveDialogue,
  onDeletePanel,
  onMakeFunnier,
  onMakeDramatic,
  onAddPlotTwist,
  onChangeEnding,
  onAddPanel,
  isAiWorking,
  activeAction,
  regeneratingPanelNumber,
}) => {
  const [editingPanelNumber, setEditingPanelNumber] = useState<number | null>(null);
  const [showCharacters, setShowCharacters] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const activePanel = comic.panels.find(p => p.panelNumber === editingPanelNumber);

  const handleSavePanel = (updatedPanel: ComicPanelData) => {
    const newPanels = comic.panels.map(p =>
      p.panelNumber === updatedPanel.panelNumber ? updatedPanel : p
    );
    onUpdateComic({
      ...comic,
      panels: newPanels,
    });
  };

  // Determine grid columns based on panel count
  const panelCount = comic.panels.length;
  let gridLayoutClass = 'grid-cols-1 md:grid-cols-2';
  if (panelCount === 8) {
    gridLayoutClass = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
  } else if (panelCount === 6) {
    gridLayoutClass = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 pb-16">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 bg-slate-900 border border-slate-700 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-md bg-amber-400 text-black border border-black shadow-[1.5px_1.5px_0px_#000]">
              {comic.genre}
            </span>
            <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-md bg-slate-800 text-slate-200 border border-slate-700">
              Style: {comic.artStyle}
            </span>
            <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-md bg-slate-800 text-slate-200 border border-slate-700">
              {panelCount} Panels
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCharacters(!showCharacters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
              showCharacters
                ? 'bg-amber-400/20 text-amber-300 border-amber-400'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Characters ({comic.characters?.length || 0})</span>
          </button>

          {onSaveToCloud && (
            <button
              onClick={onSaveToCloud}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-black border-2 border-black shadow-[3px_3px_0px_#000] transition-transform active:translate-x-0.5 active:translate-y-0.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Comic</span>
            </button>
          )}

          <ExportButton targetRef={printRef} comic={comic} />
        </div>
      </div>

      {/* AI Assist Toolbar */}
      <AIAssistToolbar
        onMakeFunnier={onMakeFunnier}
        onMakeDramatic={onMakeDramatic}
        onAddPlotTwist={onAddPlotTwist}
        onChangeEnding={onChangeEnding}
        onAddPanel={onAddPanel}
        isAiWorking={isAiWorking}
        activeAction={activeAction}
      />

      {/* Characters Accordion Panel */}
      {showCharacters && comic.characters && comic.characters.length > 0 && (
        <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-4 sm:p-6 shadow-inner animate-in fade-in duration-200">
          <h3 className="font-bangers text-xl text-amber-400 tracking-wide mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            Story Characters & Continuity Descriptions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {comic.characters.map((char, idx) => (
              <CharacterCard key={idx} character={char} />
            ))}
          </div>
        </div>
      )}

      {/* Main Comic Page to Export / View */}
      <div
        ref={printRef}
        className="bg-slate-950 border-4 border-black rounded-3xl p-4 sm:p-8 shadow-[12px_12px_0px_#000] space-y-6"
      >
        {/* Comic Header Header */}
        <div className="text-center pb-4 border-b-4 border-black space-y-2">
          <div className="inline-block px-4 py-1 bg-amber-400 border-2 border-black rounded-full shadow-[3px_3px_0px_#000] mb-1">
            <span className="font-bangers text-sm text-black tracking-widest uppercase">
              COMICCRAFT PRESENTATION EDITION
            </span>
          </div>

          <h1 className="font-bangers text-4xl sm:text-6xl text-white tracking-wider drop-shadow-[3px_3px_0px_#000]">
            {comic.title}
          </h1>

          <p className="font-comic text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed italic">
            "{comic.summary}"
          </p>
        </div>

        {/* Comic Panels Grid */}
        <div className={`grid gap-4 sm:gap-6 ${gridLayoutClass}`}>
          {comic.panels.map(panel => (
            <ComicPanel
              key={panel.panelNumber}
              panel={panel}
              totalPanels={comic.panels.length}
              onEdit={num => setEditingPanelNumber(num)}
              onRegenerate={onRegeneratePanel}
              onImproveDialogue={onImproveDialogue}
              onDelete={onDeletePanel}
              isRegenerating={regeneratingPanelNumber === panel.panelNumber}
            />
          ))}
        </div>

        {/* Comic Book Footer Strip */}
        <div className="pt-4 border-t-2 border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-comic gap-2">
          <span>Created with ComicCraft &bull; Google Gemini AI Models</span>
          <span className="font-bold text-amber-400">
            Genre: {comic.genre} | Style: {comic.artStyle}
          </span>
          <span>College CSE Project 2026</span>
        </div>
      </div>

      {/* Panel Editor Modal */}
      {activePanel && (
        <PanelEditor
          panel={activePanel}
          isOpen={editingPanelNumber !== null}
          onClose={() => setEditingPanelNumber(null)}
          onSave={handleSavePanel}
        />
      )}
    </div>
  );
};

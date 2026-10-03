import React, { useState } from 'react';
import { ComicData } from '../types.ts';
import { ComicViewer } from '../components/ComicViewer.tsx';
import { ConfirmDialog } from '../components/ConfirmDialog.tsx';
import * as api from '../services/api.ts';

interface ComicViewPageProps {
  comic: ComicData;
  onUpdateComic: (comic: ComicData) => void;
  onBack: () => void;
  onDeleteComic: (id: string) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const ComicViewPage: React.FC<ComicViewPageProps> = ({
  comic,
  onUpdateComic,
  onBack,
  onDeleteComic,
  showToast,
}) => {
  const [isAiWorking, setIsAiWorking] = useState(false);
  const [activeAction, setActiveAction] = useState<string | undefined>(undefined);
  const [regeneratingPanelNumber, setRegeneratingPanelNumber] = useState<number | null>(null);

  const [panelToDelete, setPanelToDelete] = useState<number | null>(null);

  const comicId = comic.id || comic._id || '';

  const handleSaveToCloud = async () => {
    try {
      const updated = await api.updateComic(comicId, comic);
      onUpdateComic(updated);
      showToast('Comic saved successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save comic.', 'error');
    }
  };

  const handleRegeneratePanel = async (panelNumber: number) => {
    setRegeneratingPanelNumber(panelNumber);
    try {
      const result = await api.regeneratePanel(comicId, panelNumber);
      onUpdateComic(result.comic);
      showToast(`Panel #${panelNumber} artwork regenerated with Gemini!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to regenerate panel.', 'error');
    } finally {
      setRegeneratingPanelNumber(null);
    }
  };

  const handleImproveDialogue = async (panelNumber: number) => {
    try {
      const result = await api.improveDialogue(comicId, panelNumber);
      onUpdateComic(result.comic);
      showToast(`Dialogue polished with Gemini for Panel #${panelNumber}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to improve dialogue.', 'error');
    }
  };

  const handleConfirmDeletePanel = () => {
    if (panelToDelete === null) return;
    const filteredPanels = comic.panels
      .filter(p => p.panelNumber !== panelToDelete)
      .map((p, idx) => ({ ...p, panelNumber: idx + 1 }));

    const updated: ComicData = {
      ...comic,
      panelCount: filteredPanels.length,
      panels: filteredPanels,
    };

    onUpdateComic(updated);
    api.updateComic(comicId, updated).catch(console.error);
    showToast(`Panel #${panelToDelete} deleted and comic renumbered.`, 'info');
    setPanelToDelete(null);
  };

  // AI Assist Handlers
  const handleMakeFunnier = async () => {
    setIsAiWorking(true);
    setActiveAction('funnier');
    try {
      const updated = await api.makeFunnier(comicId);
      onUpdateComic(updated);
      showToast('Gemini rewrote the comic with fresh comedic punchlines!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to apply comedy twist.', 'error');
    } finally {
      setIsAiWorking(false);
      setActiveAction(undefined);
    }
  };

  const handleMakeDramatic = async () => {
    setIsAiWorking(true);
    setActiveAction('dramatic');
    try {
      const updated = await api.makeDramatic(comicId);
      onUpdateComic(updated);
      showToast('Gemini elevated the dramatic intensity and stakes!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to elevate drama.', 'error');
    } finally {
      setIsAiWorking(false);
      setActiveAction(undefined);
    }
  };

  const handleAddPlotTwist = async () => {
    setIsAiWorking(true);
    setActiveAction('twist');
    try {
      const res = await api.addPlotTwist(comicId);
      onUpdateComic(res.comic);
      showToast(res.twist ? `Twist added: ${res.twist}` : 'Unexpected plot twist injected!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to add plot twist.', 'error');
    } finally {
      setIsAiWorking(false);
      setActiveAction(undefined);
    }
  };

  const handleChangeEnding = async () => {
    setIsAiWorking(true);
    setActiveAction('ending');
    try {
      const updated = await api.changeEnding(comicId);
      onUpdateComic(updated);
      showToast('Gemini crafted an alternative conclusion for the final panel!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to change ending.', 'error');
    } finally {
      setIsAiWorking(false);
      setActiveAction(undefined);
    }
  };

  const handleAddPanel = async () => {
    setIsAiWorking(true);
    setActiveAction('add-panel');
    try {
      const updated = await api.addPanel(comicId);
      onUpdateComic(updated);
      showToast(`Added Panel #${updated.panels.length} to the comic sequence!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to add panel.', 'error');
    } finally {
      setIsAiWorking(false);
      setActiveAction(undefined);
    }
  };

  return (
    <div>
      <ComicViewer
        comic={comic}
        onUpdateComic={onUpdateComic}
        onSaveToCloud={handleSaveToCloud}
        onBack={onBack}
        onRegeneratePanel={handleRegeneratePanel}
        onImproveDialogue={handleImproveDialogue}
        onDeletePanel={num => setPanelToDelete(num)}
        onMakeFunnier={handleMakeFunnier}
        onMakeDramatic={handleMakeDramatic}
        onAddPlotTwist={handleAddPlotTwist}
        onChangeEnding={handleChangeEnding}
        onAddPanel={handleAddPanel}
        isAiWorking={isAiWorking}
        activeAction={activeAction}
        regeneratingPanelNumber={regeneratingPanelNumber}
      />

      {/* Confirm Delete Panel Modal */}
      <ConfirmDialog
        isOpen={panelToDelete !== null}
        title={`Delete Panel #${panelToDelete}?`}
        message="Are you sure you want to remove this panel? The remaining panels will be automatically renumbered to preserve continuity."
        confirmLabel="Delete Panel"
        onConfirm={handleConfirmDeletePanel}
        onCancel={() => setPanelToDelete(null)}
      />
    </div>
  );
};

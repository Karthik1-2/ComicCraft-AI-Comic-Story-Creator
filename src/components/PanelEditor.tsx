import React, { useState } from 'react';
import { ComicPanelData, DialogueItem, BubblePosition, BubbleType } from '../types.ts';
import { X, Plus, Trash2, Check, MessageSquare, Image, MessageCircle } from 'lucide-react';

interface PanelEditorProps {
  panel: ComicPanelData;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPanel: ComicPanelData) => void;
}

export const PanelEditor: React.FC<PanelEditorProps> = ({
  panel,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [sceneDescription, setSceneDescription] = useState(panel.sceneDescription || '');
  const [caption, setCaption] = useState(panel.caption || '');
  const [imagePrompt, setImagePrompt] = useState(panel.imagePrompt || '');
  const [dialogue, setDialogue] = useState<DialogueItem[]>(
    panel.dialogue && panel.dialogue.length > 0
      ? [...panel.dialogue]
      : [{ speaker: '', text: '', type: 'speech', position: 'top-left' }]
  );

  const handleAddDialogue = () => {
    setDialogue(prev => [
      ...prev,
      { speaker: 'Speaker', text: 'New dialogue line', type: 'speech', position: 'top-right' }
    ]);
  };

  const handleRemoveDialogue = (index: number) => {
    setDialogue(prev => prev.filter((_, i) => i !== index));
  };

  const handleDialogueChange = (index: number, field: keyof DialogueItem, value: any) => {
    setDialogue(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...panel,
      sceneDescription,
      caption,
      imagePrompt,
      dialogue: dialogue.filter(d => d.text.trim().length > 0),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border-4 border-black rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[10px_10px_0px_#000] p-6 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-bangers text-2xl text-amber-400">
              Edit Panel #{panel.panelNumber}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Caption */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              Comic Caption
            </label>
            <input
              type="text"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="e.g. Meanwhile, in the computer lab..."
              className="w-full bg-slate-950 border-2 border-slate-700 focus:border-amber-400 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-hidden"
            />
          </div>

          {/* Dialogue Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-amber-400" />
                Speech Bubbles & Dialogue
              </label>
              <button
                type="button"
                onClick={handleAddDialogue}
                className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded border border-amber-500/40"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Speech Bubble
              </button>
            </div>

            <div className="space-y-3">
              {dialogue.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">
                      Bubble #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDialogue(idx)}
                      className="text-rose-400 hover:text-rose-300 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Speaker
                      </label>
                      <input
                        type="text"
                        value={item.speaker}
                        onChange={e => handleDialogueChange(idx, 'speaker', e.target.value)}
                        placeholder="Character name"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Bubble Style
                      </label>
                      <select
                        value={item.type || 'speech'}
                        onChange={e => handleDialogueChange(idx, 'type', e.target.value as BubbleType)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-hidden"
                      >
                        <option value="speech">Normal Speech</option>
                        <option value="shout">Shout / Yell</option>
                        <option value="thought">Thought Cloud</option>
                        <option value="whisper">Quiet Whisper</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Position
                      </label>
                      <select
                        value={item.position || 'top-left'}
                        onChange={e => handleDialogueChange(idx, 'position', e.target.value as BubblePosition)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-hidden"
                      >
                        <option value="top-left">Top Left</option>
                        <option value="top-center">Top Center</option>
                        <option value="top-right">Top Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="bottom-center">Bottom Center</option>
                        <option value="bottom-right">Bottom Right</option>
                        <option value="center">Center</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Dialogue Text
                    </label>
                    <input
                      type="text"
                      value={item.text}
                      onChange={e => handleDialogueChange(idx, 'text', e.target.value)}
                      placeholder="Enter speech text..."
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:border-amber-400 focus:outline-hidden"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scene Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-2">
              <Image className="w-4 h-4 text-amber-400" />
              Scene Description & Visuals
            </label>
            <textarea
              rows={2}
              value={sceneDescription}
              onChange={e => setSceneDescription(e.target.value)}
              className="w-full bg-slate-950 border-2 border-slate-700 focus:border-amber-400 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-hidden resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-amber-400 hover:bg-amber-300 text-black border-2 border-black shadow-[3px_3px_0px_#000] transition-transform active:translate-x-0.5 active:translate-y-0.5"
            >
              <Check className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

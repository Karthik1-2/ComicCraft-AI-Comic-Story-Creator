import React from 'react';
import { ComicCharacter } from '../types.ts';
import { User, Sparkles } from 'lucide-react';

interface CharacterCardProps {
  character: ComicCharacter;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ character }) => {
  return (
    <div className="bg-slate-900 border-2 border-black rounded-xl p-4 shadow-[4px_4px_0px_#000] flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-amber-400 border border-black flex items-center justify-center text-black font-bangers text-lg shadow-[2px_2px_0px_#000]">
            {character.name.charAt(0)}
          </div>
          <div>
            <h4 className="font-bangers text-lg text-white tracking-wide">
              {character.name}
            </h4>
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
              Comic Character
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-3">
          {character.description}
        </p>
      </div>

      <div className="space-y-2 pt-2 border-t border-slate-800 text-[11px]">
        <div>
          <span className="font-bold text-amber-400 uppercase tracking-wider block text-[10px]">
            Visual Consistency Cues:
          </span>
          <p className="text-slate-300 italic">{character.appearance}</p>
        </div>

        <div>
          <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
            Personality:
          </span>
          <p className="text-slate-300">{character.personality}</p>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { DialogueItem, BubblePosition, BubbleType } from '../types.ts';

interface SpeechBubbleProps {
  dialogue: DialogueItem;
  onClick?: () => void;
  isEditable?: boolean;
}

const positionClasses: Record<BubblePosition, string> = {
  'top-left': 'top-3 left-3 items-start',
  'top-center': 'top-3 left-1/2 -translate-x-1/2 items-center',
  'top-right': 'top-3 right-3 items-end',
  'bottom-left': 'bottom-8 left-3 items-start',
  'bottom-center': 'bottom-8 left-1/2 -translate-x-1/2 items-center',
  'bottom-right': 'bottom-8 right-3 items-end',
  'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center',
};

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  dialogue,
  onClick,
  isEditable = false,
}) => {
  const position = (dialogue.position || 'top-left') as BubblePosition;
  const type = (dialogue.type || 'speech') as BubbleType;
  const posClass = positionClasses[position] || positionClasses['top-left'];

  // Bubble style variations
  const isShout = type === 'shout';
  const isThought = type === 'thought';
  const isWhisper = type === 'whisper';

  let bubbleStyle = 'bg-white text-slate-950 border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000000]';
  if (isShout) {
    bubbleStyle = 'bg-amber-100 text-red-950 border-3 border-red-600 rounded-lg shadow-[4px_4px_0px_#991b1b] font-bold';
  } else if (isThought) {
    bubbleStyle = 'bg-sky-50 text-slate-900 border-2 border-dashed border-sky-600 rounded-3xl shadow-[3px_3px_0px_#0284c7]';
  } else if (isWhisper) {
    bubbleStyle = 'bg-slate-50/95 text-slate-700 border-2 border-dashed border-slate-500 rounded-xl shadow-[2px_2px_0px_#475569] italic';
  }

  // Pointer Tail rendering
  const showTail = !isThought;
  const isTop = position.startsWith('top');
  const isLeft = position.includes('left');

  return (
    <div
      onClick={onClick}
      className={`absolute z-20 max-w-[78%] flex flex-col ${posClass} ${
        isEditable ? 'cursor-pointer hover:scale-105 transition-transform' : ''
      }`}
    >
      <div className={`relative px-3.5 py-2 select-none ${bubbleStyle}`}>
        {/* Speaker Name Tag */}
        {dialogue.speaker && dialogue.speaker.trim() !== '' && (
          <div className="flex items-center gap-1 mb-1">
            <span
              className={`text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                isShout
                  ? 'bg-red-600 text-white'
                  : 'bg-black text-amber-400 font-comic'
              }`}
            >
              {dialogue.speaker}
            </span>
            {isThought && (
              <span className="text-[9px] text-sky-600 font-bold uppercase tracking-wider">
                Thinking
              </span>
            )}
            {isWhisper && (
              <span className="text-[9px] text-slate-500 font-medium">
                whispering
              </span>
            )}
          </div>
        )}

        {/* Text Content */}
        <p
          className={`font-comic text-xs sm:text-sm leading-tight text-slate-900 ${
            isShout ? 'font-black tracking-wide text-red-950 text-sm' : 'font-bold'
          }`}
        >
          {dialogue.text}
        </p>

        {/* Classic Speech Tail */}
        {showTail && (
          <div
            className={`w-0 h-0 absolute ${
              isTop
                ? isLeft
                  ? '-bottom-2.5 left-4 border-l-[8px] border-l-transparent border-r-[4px] border-r-transparent border-t-[10px] border-t-black'
                  : '-bottom-2.5 right-4 border-l-[4px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-black'
                : isLeft
                ? '-top-2.5 left-4 border-l-[8px] border-l-transparent border-r-[4px] border-r-transparent border-b-[10px] border-b-black'
                : '-top-2.5 right-4 border-l-[4px] border-l-transparent border-r-[8px] border-r-transparent border-b-[10px] border-b-black'
            }`}
          />
        )}

        {/* Thought Bubble Circles */}
        {isThought && (
          <div
            className={`absolute flex flex-col items-center gap-1 ${
              isTop ? '-bottom-4 left-6' : '-top-4 left-6'
            }`}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-sky-200 border border-sky-600" />
            <div className="w-1.5 h-1.5 rounded-full bg-sky-200 border border-sky-600" />
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { GenerateComicRequest, ComicData, GenerationStep } from '../types.ts';
import { StoryForm } from '../components/StoryForm.tsx';
import { GenerationProgress } from '../components/GenerationProgress.tsx';
import * as api from '../services/api.ts';

interface CreateComicPageProps {
  onComicGenerated: (comic: ComicData) => void;
  onNavigateToComics?: () => void;
}

export const CreateComicPage: React.FC<CreateComicPageProps> = ({ onComicGenerated, onNavigateToComics }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRetryingNotice, setIsRetryingNotice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<GenerateComicRequest | null>(null);
  const [steps, setSteps] = useState<GenerationStep[]>([]);
  const retryTimerRef = useRef<any>(null);

  const runPipeline = async (request: GenerateComicRequest) => {
    if (isGenerating) return; // Prevent duplicate requests (Requirement 10)

    setIsGenerating(true);
    setIsRetryingNotice(false);
    setError(null);
    setLastRequest(request);

    const initialSteps: GenerationStep[] = [
      { id: '1', label: 'Understanding your idea', status: 'in_progress', detail: `Analyzing "${request.prompt.slice(0, 35)}..."` },
      { id: '2', label: 'Creating the story', status: 'pending', detail: `Genre pacing for ${request.genre}` },
      { id: '3', label: 'Creating characters', status: 'pending', detail: 'Designing appearance consistency rules' },
      { id: '4', label: 'Planning comic panels', status: 'pending', detail: `Structuring ${request.panelCount} comic panels` },
      { id: '5', label: `Generating panel artwork (1 to ${request.panelCount})`, status: 'pending', detail: `Applying ${request.artStyle} visual style` },
      { id: '6', label: 'Building your comic', status: 'pending', detail: 'Finalizing speech bubbles and layout' },
    ];
    setSteps(initialSteps);

    // If request takes longer than 3.5s, trigger the auto-retry status banner (Requirement 9)
    retryTimerRef.current = setTimeout(() => {
      setIsRetryingNotice(true);
    }, 3500);

    // Progressive step indicator
    const stepInterval = setInterval(() => {
      setSteps(prev => {
        const inProgressIdx = prev.findIndex(s => s.status === 'in_progress');
        if (inProgressIdx >= 0 && inProgressIdx < prev.length - 1) {
          const next = [...prev];
          next[inProgressIdx] = { ...next[inProgressIdx], status: 'completed' };
          next[inProgressIdx + 1] = { ...next[inProgressIdx + 1], status: 'in_progress' };
          return next;
        }
        return prev;
      });
    }, 2200);

    try {
      const generatedComic = await api.generateComic(request);
      clearInterval(stepInterval);
      clearTimeout(retryTimerRef.current);
      setIsRetryingNotice(false);

      // Mark all completed
      setSteps(prev => prev.map(s => ({ ...s, status: 'completed' })));

      // Short delay for visual satisfaction
      setTimeout(() => {
        setIsGenerating(false);
        onComicGenerated(generatedComic);
      }, 700);
    } catch (err: any) {
      clearInterval(stepInterval);
      clearTimeout(retryTimerRef.current);
      console.error('[ComicCraft] Comic generation error in page:', err);
      setIsGenerating(false);
      setIsRetryingNotice(false);
      setError(err.message || 'Gemini is temporarily busy. Please try again in a moment.');
      setSteps(prev =>
        prev.map(s => (s.status === 'in_progress' ? { ...s, status: 'error' } : s))
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="font-bangers text-4xl sm:text-6xl text-white tracking-wide drop-shadow-[3px_3px_0px_#000]">
          Create New Comic Story
        </h1>
        <p className="font-comic text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
          Enter any scenario, idea, or concept. Gemini will develop the characters, panels, dialogue, and comic artwork.
        </p>
      </div>

      {isGenerating || error ? (
        <GenerationProgress
          steps={steps}
          error={error}
          isRetryingNotice={isRetryingNotice}
          onRetry={lastRequest ? () => runPipeline(lastRequest) : undefined}
          onNavigateToComics={onNavigateToComics}
        />
      ) : (
        <StoryForm onGenerate={runPipeline} isLoading={isGenerating} />
      )}
    </div>
  );
};

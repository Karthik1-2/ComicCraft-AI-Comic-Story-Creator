import React from 'react';
import { CheckCircle2, Loader2, Circle, AlertCircle, RefreshCw, AlertTriangle, BookOpen, Zap } from 'lucide-react';
import { GenerationStep } from '../types.ts';

interface GenerationProgressProps {
  steps: GenerationStep[];
  error?: string | null;
  isRetryingNotice?: boolean;
  onRetry?: () => void;
  onNavigateToComics?: () => void;
}

export const GenerationProgress: React.FC<GenerationProgressProps> = ({
  steps,
  error,
  isRetryingNotice = false,
  onRetry,
  onNavigateToComics,
}) => {
  const isQuotaError =
    Boolean(error) &&
    (error!.includes('Daily Gemini free-tier quota has been reached') ||
      error!.toLowerCase().includes('quota') ||
      error!.includes('RESOURCE_EXHAUSTED'));

  return (
    <div className="bg-slate-900 border-4 border-black rounded-3xl p-6 sm:p-8 max-w-xl mx-auto shadow-[10px_10px_0px_#000] text-slate-100">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-black font-bangers text-xs sm:text-sm rounded-full border border-black shadow-[2px_2px_0px_#000] mb-2">
          <Zap className="w-3.5 h-3.5 fill-black" />
          <span>GEMINI PIPELINE ACTIVE &bull; 1 REQUEST PER COMIC</span>
        </div>
        <h3 className="font-bangers text-3xl text-white tracking-wide">
          Crafting Your Comic Story
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Generating complete story arc, characters, panels, and speech bubbles in 1 structured call
        </p>

        {/* Small AI usage indicator (Requirement 19) */}
        <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-comic font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-0.5 rounded-md">
          <span>⚡ Gemini requests are optimized to reduce API usage.</span>
        </div>
      </div>

      {/* Auto-Retry Notification Banner (Requirement 9 & 15) */}
      {isRetryingNotice && !error && (
        <div className="mb-4 p-3.5 rounded-2xl bg-amber-500/20 border-2 border-amber-400 text-amber-300 text-xs font-bold flex items-center gap-3 animate-pulse shadow-md">
          <Loader2 className="w-5 h-5 text-amber-400 animate-spin shrink-0" />
          <div>
            <span className="block text-sm font-bangers tracking-wide text-amber-300">
              Gemini is busy. Retrying automatically...
            </span>
            <span className="text-[11px] font-comic font-normal text-amber-200/90">
              Applying exponential backoff to handle temporary demand spikes.
            </span>
          </div>
        </div>
      )}

      {/* Progress Steps List */}
      <div className="space-y-3 font-comic">
        {steps.map(step => {
          const isDone = step.status === 'completed';
          const isInProgress = step.status === 'in_progress';
          const isErr = step.status === 'error';

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                isInProgress
                  ? 'bg-amber-400/10 border-amber-400/50 shadow-sm'
                  : isDone
                  ? 'bg-slate-950/80 border-emerald-900/40 text-emerald-400'
                  : isErr
                  ? 'bg-rose-950/20 border-rose-800 text-rose-400'
                  : 'bg-slate-950/40 border-slate-800 text-slate-500'
              }`}
            >
              <div className="shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : isInProgress ? (
                  <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                ) : isErr ? (
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <span
                  className={`text-sm font-bold block ${
                    isInProgress ? 'text-amber-300' : isDone ? 'text-white' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
                {step.detail && (
                  <span className="text-[11px] text-slate-400 block truncate">
                    {step.detail}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dedicated Quota Exhaustion Screen (Requirement 18) */}
      {isQuotaError ? (
        <div className="mt-6 p-5 rounded-2xl bg-amber-950/40 border-2 border-amber-500 text-amber-100 space-y-3.5 shadow-lg">
          <div className="flex items-center gap-2.5 text-amber-400 font-bangers text-lg tracking-wide">
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
            <span>Daily Free-Tier Quota Reached</span>
          </div>

          <p className="font-comic text-xs sm:text-sm leading-relaxed text-amber-200">
            Daily Gemini free-tier quota has been reached. Please try again after the quota resets or upgrade the Gemini API billing tier.
          </p>

          <p className="font-comic text-[11px] text-slate-400 leading-normal border-t border-amber-900/60 pt-2">
            The free-tier Gemini API provides 20 requests per day per project. In the meantime, you can explore your saved comics, view the pre-seeded demo comic ("The Late Student"), and edit or export existing comics offline without using any API quota.
          </p>

          {onNavigateToComics && (
            <div className="pt-1">
              <button
                onClick={onNavigateToComics}
                className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black border-2 border-black rounded-xl font-bangers text-sm tracking-wide shadow-[2px_2px_0px_#000] transition-transform active:translate-x-0.5 active:translate-y-0.5"
              >
                <BookOpen className="w-4 h-4 text-black" />
                <span>Open My Comics & Demo</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Standard Error state with Retry CTA */
        error && (
          <div className="mt-6 p-4 rounded-2xl bg-rose-950/50 border-2 border-rose-600 text-rose-200 text-xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>Generation Notice</span>
            </div>
            <p className="font-comic text-xs leading-relaxed text-rose-100">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-2 flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black border-2 border-black rounded-xl font-bangers text-sm tracking-wide shadow-[2px_2px_0px_#000] transition-transform active:translate-x-0.5 active:translate-y-0.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Generation Now</span>
              </button>
            )}
          </div>
        )
      )}
    </div>
  );
};

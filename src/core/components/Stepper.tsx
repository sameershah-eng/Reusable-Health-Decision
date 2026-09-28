import React from 'react';
import { Check } from 'lucide-react';
import type { StageId } from '../../domain/types';
import { JOURNEY_STAGES } from '../journey/stages';

export interface StepperProps {
  currentStageId: StageId;
  completedStageIds: StageId[];
  isStageAccessible: (stageId: StageId) => boolean;
  onSelectStage: (stageId: StageId) => void;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  currentStageId,
  completedStageIds,
  isStageAccessible,
  onSelectStage,
  className = '',
}) => {
  return (
    <nav
      aria-label="Decision journey progress"
      className={`w-full py-4 border-b border-[#EDE6DF] bg-[#FBF8F4]/80 backdrop-blur-sm sticky top-0 z-30 ${className}`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <ol className="flex items-center justify-between gap-1 sm:gap-2">
          {JOURNEY_STAGES.map((stage, idx) => {
            const isCurrent = stage.id === currentStageId;
            const isCompleted = completedStageIds.includes(stage.id);
            const accessible = isStageAccessible(stage.id);

            return (
              <li key={stage.id} className="flex-1 flex items-center">
                <button
                  type="button"
                  disabled={!accessible}
                  onClick={() => accessible && onSelectStage(stage.id)}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={`group w-full flex flex-col sm:flex-row items-center sm:items-center gap-1.5 sm:gap-3 p-1.5 sm:p-2 rounded-xl text-left transition-all duration-200 ${
                    accessible
                      ? 'cursor-pointer hover:bg-white/60'
                      : 'cursor-not-allowed opacity-45'
                  }`}
                >
                  {/* Step circle / indicator */}
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-all duration-300 ${
                      isCurrent
                        ? 'bg-gradient-to-r from-[#E07A6B] to-[#F2A76B] text-white shadow-sm ring-4 ring-[#E07A6B]/15'
                        : isCompleted
                        ? 'bg-[#8FB39A] text-white'
                        : 'bg-[#EDE6DF] text-[#6E6475]'
                    }`}
                  >
                    {isCompleted && !isCurrent ? (
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>

                  {/* Stage Label */}
                  <div className="text-center sm:text-left min-w-0">
                    <span
                      className={`block text-[11px] sm:text-xs font-medium tracking-tight whitespace-nowrap truncate transition-colors ${
                        isCurrent
                          ? 'text-[#2B2233] font-semibold'
                          : isCompleted
                          ? 'text-[#2B2233]'
                          : 'text-[#6E6475]'
                      }`}
                    >
                      {stage.label}
                    </span>
                    <span className="hidden lg:block text-[10px] text-[#8C8294] truncate">
                      {stage.shortDescription.split('&')[0]}
                    </span>
                  </div>
                </button>

                {/* Connecting hairline */}
                {idx < JOURNEY_STAGES.length - 1 && (
                  <div
                    className={`hidden sm:block h-[1.5px] flex-1 mx-1 transition-colors duration-300 ${
                      completedStageIds.includes(JOURNEY_STAGES[idx + 1].id) ||
                      stage.id === currentStageId
                        ? 'bg-[#E07A6B]/40'
                        : 'bg-[#EDE6DF]'
                    }`}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

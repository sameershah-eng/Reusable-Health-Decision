import React from 'react';
import type { ExperienceStory } from '../../domain/types';
import { Quote } from 'lucide-react';

export interface StoryCardProps {
  story: ExperienceStory;
  className?: string;
}

export const StoryCard: React.FC<StoryCardProps> = ({ story, className = '' }) => {
  return (
    <article
      className={`bg-white rounded-2xl border border-[#EDE6DF] p-6 sm:p-7 shadow-[0_2px_12px_rgb(43,34,51,0.03)] flex flex-col justify-between space-y-5 ${className}`}
    >
      <div className="space-y-4">
        {/* Persona header & Illustrative label */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-serif font-semibold text-base text-[#2B2233]">
              {story.personaName}
            </span>
            <span className="text-[#8C8294]">·</span>
            <span className="text-[#6E6475]">{story.ageRange}</span>
          </div>

          <span className="text-[11px] text-[#8C8294] bg-[#FBF8F4] px-2 py-0.5 rounded border border-[#EDE6DF]">
            Illustrative composite
          </span>
        </div>

        {/* Headline */}
        <h4 className="font-serif text-lg text-[#2B2233] font-medium leading-snug">
          {story.headline}
        </h4>

        {/* Situation */}
        <div className="space-y-1.5 text-xs sm:text-sm text-[#4A3E52]">
          <strong className="block text-xs uppercase tracking-wider text-[#8C8294] font-semibold">
            The Situation
          </strong>
          <p className="leading-relaxed">{story.situation}</p>
        </div>

        {/* Choice Made & Outcome */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-[#FBF8F4] border border-[#EFEAE4]">
            <strong className="block text-[#2B2233] font-medium mb-1">Path Chosen</strong>
            <p className="text-[#6E6475] leading-normal">{story.choiceMade}</p>
          </div>
          <div className="p-3 rounded-xl bg-[#FBF8F4] border border-[#EFEAE4]">
            <strong className="block text-[#2B2233] font-medium mb-1">Observed Outcome</strong>
            <p className="text-[#6E6475] leading-normal">{story.outcome}</p>
          </div>
        </div>

        {/* Persona Quote */}
        <div className="relative p-4 rounded-xl bg-gradient-to-r from-[#FBF8F4] to-[#FAF5F0] border-l-3 border-[#E07A6B] text-xs sm:text-sm text-[#2B2233] italic leading-relaxed">
          <Quote className="w-4 h-4 text-[#E07A6B]/50 inline-block mr-1 -mt-1" />
          <span>{story.quote}</span>
        </div>
      </div>

      {/* Reflection Footer */}
      <div className="pt-3 border-t border-[#EDE6DF] text-xs text-[#6E6475] flex items-start gap-1.5">
        <span className="text-[#8C8294] font-medium shrink-0">Key takeaway:</span>
        <span className="leading-normal">{story.reflection}</span>
      </div>
    </article>
  );
};

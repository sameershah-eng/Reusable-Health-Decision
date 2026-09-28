import React, { useState } from 'react';
import type { EvidenceItem } from '../../domain/types';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

export interface EvidenceCardProps {
  item: EvidenceItem;
  className?: string;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ item, className = '' }) => {
  const [expanded, setExpanded] = useState(false);

  const categoryStyles = {
    benefit: 'border-l-4 border-l-[#8FB39A]',
    risk: 'border-l-4 border-l-[#E07A6B]',
    uncertainty: 'border-l-4 border-l-[#B8A4E3]',
  }[item.category];

  const categoryLabel = {
    benefit: 'Documented Benefit',
    risk: 'Known Risk / Nuance',
    uncertainty: 'Scientific Uncertainty',
  }[item.category];

  const strengthBadgeStyles = {
    Strong: 'text-emerald-800 bg-emerald-50/80 border-emerald-200',
    Moderate: 'text-amber-800 bg-amber-50/80 border-amber-200',
    Limited: 'text-stone-700 bg-stone-100 border-stone-200',
    Uncertain: 'text-purple-800 bg-purple-50/80 border-purple-200',
  }[item.strength];

  return (
    <article
      className={`bg-white rounded-2xl border border-[#EDE6DF] shadow-[0_2px_10px_rgb(43,34,51,0.02)] overflow-hidden transition-all duration-200 ${categoryStyles} ${className}`}
    >
      <div className="p-5 sm:p-6 space-y-3">
        {/* Category & Evidence Strength Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold uppercase tracking-wider text-[#8C8294]">
            {categoryLabel}
          </span>

          <span
            className={`px-2.5 py-0.5 rounded-md border text-[11px] font-medium tracking-tight ${strengthBadgeStyles}`}
          >
            Evidence strength: {item.strength}
          </span>
        </div>

        {/* Title */}
        <h4 className="font-serif text-lg sm:text-xl text-[#2B2233] font-medium leading-snug">
          {item.title}
        </h4>

        {/* Summary */}
        <p className="text-sm text-[#4A3E52] leading-relaxed">
          {item.summary}
        </p>

        {/* Progressive Disclosure (Detailed Body) */}
        {expanded && (
          <div className="pt-3 mt-3 border-t border-[#EDE6DF] space-y-3 text-xs sm:text-sm text-[#6E6475] leading-relaxed">
            <p>{item.detailedBody}</p>

            <div className="pt-2 flex items-start gap-2 text-xs text-[#8C8294]">
              <BookOpen className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#A297A8]" />
              <span className="italic">
                Synthetic source: {item.sourceReference}
              </span>
            </div>
          </div>
        )}

        {/* Footer Toggle */}
        <div className="pt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 text-xs font-medium text-[#E07A6B] hover:text-[#C55E4F] transition-colors cursor-pointer"
          >
            <span>{expanded ? 'Show less' : 'Learn more about this finding'}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {!expanded && (
            <span className="text-[11px] text-[#A297A8] truncate max-w-[200px] sm:max-w-xs">
              {item.sourceReference.split('(')[0]}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

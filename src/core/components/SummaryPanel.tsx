import React, { useState } from 'react';
import type { ContextSummary, UnknownItem } from '../../domain/types';
import { Chip } from './base/Chip';
import { HelpCircle, ChevronDown, ChevronUp, Edit3 } from 'lucide-react';

export interface SummaryPanelProps {
  summary: ContextSummary;
  onEditContext?: () => void;
  className?: string;
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({
  summary,
  onEditContext,
  className = '',
}) => {
  const [selectedUnknown, setSelectedUnknown] = useState<UnknownItem | null>(
    summary.unknownItems[0] || null
  );
  const [isExpanded, setIsExpanded] = useState(true);

  const hasKnownItems = summary.knownItems.length > 0;
  const hasUnknowns = summary.unknownItems.length > 0;

  return (
    <div
      className={`bg-white rounded-[20px] border border-[#EDE6DF] shadow-[0_2px_12px_rgb(43,34,51,0.03)] overflow-hidden transition-all ${className}`}
    >
      {/* Top Banner / Accordion Header */}
      <div className="p-6 sm:p-7 border-b border-[#EDE6DF] flex items-center justify-between gap-4 bg-gradient-to-r from-[#FBF8F4] to-white">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-[#8C8294] block mb-1">
            Personal Health Context Summary
          </span>
          <h3 className="font-serif text-xl sm:text-2xl text-[#2B2233] font-medium leading-snug">
            What we understand about your situation
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {onEditContext && (
            <button
              onClick={onEditContext}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6E6475] hover:text-[#2B2233] py-1.5 px-3 rounded-lg border border-[#E8DFD8] hover:bg-white transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Update context</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Collapse summary' : 'Expand summary'}
            className="p-1.5 text-[#6E6475] hover:text-[#2B2233] hover:bg-[#F4EFEB] rounded-lg transition-colors cursor-pointer"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="p-6 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Column 1: What you told us (Known items) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8FB39A]" />
              <h4 className="text-xs uppercase tracking-wider font-semibold text-[#6E6475]">
                What you shared with us ({summary.knownItems.length})
              </h4>
            </div>

            {hasKnownItems ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {summary.knownItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#FBF8F4]/70 border border-[#EFEAE4]"
                  >
                    <span className="block text-xs text-[#8C8294] font-normal leading-tight mb-1">
                      {item.label}
                    </span>
                    <span className="block text-sm font-medium text-[#2B2233] leading-snug">
                      {item.valueDisplay}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#8C8294] italic">
                You skipped all initial fields. That is completely fine—we will highlight key questions for your clinician below.
              </p>
            )}

            {/* Priorities & Concerns callout */}
            {(summary.priorities.length > 0 || summary.concerns.length > 0) && (
              <div className="pt-2 border-t border-[#EDE6DF] text-xs text-[#6E6475] space-y-1.5">
                {summary.priorities.length > 0 && (
                  <p>
                    <strong className="text-[#2B2233] font-medium">Top priorities: </strong>
                    {summary.priorities.join(' · ')}
                  </p>
                )}
                {summary.concerns.length > 0 && (
                  <p>
                    <strong className="text-[#2B2233] font-medium">Key hesitations: </strong>
                    {summary.concerns.join(' · ')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Column 2: What we don't know yet (Unknowns as soft outlined chips) */}
          <div className="lg:col-span-5 bg-[#FDFBF7] p-5 sm:p-6 rounded-2xl border border-dashed border-[#D8CCC3] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E07A6B]" />
                <h4 className="text-xs uppercase tracking-wider font-semibold text-[#9A4638]">
                  What we don't know yet ({summary.unknownItems.length})
                </h4>
              </div>

              <p className="text-xs text-[#6E6475] leading-relaxed">
                Click any unknown to see why clinicians consider it important:
              </p>

              {hasUnknowns ? (
                <div className="flex flex-wrap gap-2">
                  {summary.unknownItems.map((u) => {
                    const isSelected = selectedUnknown?.fieldId === u.fieldId;
                    return (
                      <Chip
                        key={u.fieldId}
                        label={u.fieldName || u.fieldId}
                        variant={isSelected ? 'accent' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedUnknown(u)}
                        className={isSelected ? 'ring-1 ring-[#E07A6B]' : ''}
                      />
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-[#8FB39A] font-medium">
                  Your profile covers all standard background indicators.
                </p>
              )}

              {/* Detail drawer for selected unknown */}
              {selectedUnknown && (
                <div className="mt-4 p-4 rounded-xl bg-white border border-[#E8DFD8] shadow-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2B2233]">
                    <HelpCircle className="w-3.5 h-3.5 text-[#E07A6B]" />
                    <span>Why this matters</span>
                  </div>
                  <p className="text-xs text-[#6E6475] leading-relaxed">
                    {selectedUnknown.reasonWhyItMatters}
                  </p>
                  <p className="text-[11px] text-[#8C8294] border-t border-[#EDE6DF] pt-1.5 mt-2">
                    <strong className="text-[#2B2233]">Suggested action: </strong>
                    {selectedUnknown.suggestedAction}
                  </p>
                </div>
              )}
            </div>

            <div className="text-[11px] text-[#8C8294] mt-4 pt-3 border-t border-[#EDE6DF]">
              These items are automatically added to your clinician discussion guide.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

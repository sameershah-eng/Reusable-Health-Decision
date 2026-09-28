import React from 'react';
import type { DecisionBriefData } from '../../domain/types';
import { Printer, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from './base/Button';

export interface DecisionBriefCardProps {
  brief: DecisionBriefData;
  isSnapshot?: boolean;
  snapshotCreatedAt?: string;
  contextVersion?: number;
  className?: string;
  onPrint?: () => void;
}

export const DecisionBriefCard: React.FC<DecisionBriefCardProps> = ({
  brief,
  isSnapshot = false,
  snapshotCreatedAt,
  contextVersion,
  className = '',
  onPrint,
}) => {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const formattedDate = new Date(
    snapshotCreatedAt || brief.generatedAt
  ).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      className={`bg-white rounded-[24px] border border-[#EDE6DF] shadow-[0_4px_24px_rgba(43,34,51,0.04)] overflow-hidden ${className}`}
    >
      {/* Editorial Header */}
      <div className="p-6 sm:p-8 border-b border-[#EDE6DF] bg-gradient-to-br from-[#FBF8F4] via-white to-[#F9F4EE]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8C8294] mb-1">
              <FileText className="w-3.5 h-3.5 text-[#E07A6B]" />
              <span>Personalized Clinical Consultation Brief</span>
              {isSnapshot && (
                <>
                  <span>·</span>
                  <span className="text-[#9A4638] bg-rose-50 px-2 py-0.5 rounded text-[11px] font-sans">
                    Frozen Snapshot (Context v{contextVersion || 1})
                  </span>
                </>
              )}
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#2B2233] font-medium tracking-tight">
              {brief.topicName}
            </h2>
            <div className="text-xs text-[#8C8294] mt-1 flex items-center gap-2">
              <span>Prepared for clinician consultation</span>
              <span>·</span>
              <span>{formattedDate}</span>
            </div>
          </div>

          <div className="no-print shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrint}
              className="gap-2 text-xs"
            >
              <Printer className="w-4 h-4 text-[#6E6475]" />
              <span>Print / Save as PDF</span>
            </Button>
          </div>
        </div>

        {/* Calm Disclaimer */}
        <div className="mt-5 p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2.5 leading-relaxed">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <span>
            <strong>Clinical Disclaimer:</strong> This brief supports your thinking and discussion with your doctor. It does not provide medical diagnoses or prescriptions. Individual suitability for therapy depends on physical exam, laboratory diagnostics, and clinical evaluation.
          </span>
        </div>
      </div>

      {/* Body sections */}
      <div className="p-6 sm:p-8 space-y-8 text-sm">
        {/* Section 1: Known Context */}
        <section className="space-y-3">
          <h3 className="font-serif text-lg font-medium text-[#2B2233] flex items-center gap-2 border-b border-[#EDE6DF] pb-2">
            <CheckCircle2 className="w-4 h-4 text-[#8FB39A]" />
            <span>1. What you shared about your background</span>
          </h3>

          {brief.contextSummary.knownItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {brief.contextSummary.knownItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#FBF8F4] border border-[#EFEAE4]"
                >
                  <span className="block text-[11px] uppercase tracking-wider text-[#8C8294] font-medium mb-1">
                    {item.label}
                  </span>
                  <span className="block text-xs font-semibold text-[#2B2233] leading-snug">
                    {item.valueDisplay}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#8C8294] italic">
              No specific questions were answered.
            </p>
          )}

          {/* User priorities */}
          {brief.contextSummary.priorities.length > 0 && (
            <p className="text-xs text-[#6E6475] pt-1">
              <strong>Stated priorities: </strong>
              {brief.contextSummary.priorities.map((p) => p.replace(/_/g, ' ')).join(', ')}
            </p>
          )}
        </section>

        {/* Section 2: Clinical Considerations */}
        <section className="space-y-3">
          <h3 className="font-serif text-lg font-medium text-[#2B2233] flex items-center gap-2 border-b border-[#EDE6DF] pb-2">
            <AlertCircle className="w-4 h-4 text-[#E07A6B]" />
            <span>2. Key considerations flagged for your clinician</span>
          </h3>

          {brief.clinicalConsiderations.length > 0 ? (
            <div className="space-y-3">
              {brief.clinicalConsiderations.map((c) => {
                const borderClass =
                  c.severity === 'priority'
                    ? 'border-l-4 border-l-[#E07A6B] bg-rose-50/30'
                    : c.severity === 'advisory'
                    ? 'border-l-4 border-l-amber-500 bg-amber-50/20'
                    : 'border-l-4 border-l-[#9FC3E6] bg-slate-50/50';

                return (
                  <div
                    key={c.id}
                    className={`p-4 rounded-xl border border-[#EDE6DF] ${borderClass} space-y-1.5`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-[#2B2233]">
                        {c.title}
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-[#8C8294]">
                        {c.severity}
                      </span>
                    </div>
                    <p className="text-xs text-[#4A3E52] leading-relaxed">
                      {c.description}
                    </p>
                    <p className="text-[10px] text-[#8C8294] italic">
                      Matched context: {c.matchedRule}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-[#8C8294] italic">
              Standard clinical evaluation applies; no specific high-priority contraindication flags were detected.
            </p>
          )}
        </section>

        {/* Section 3: Open Questions for Clinician */}
        <section className="space-y-3">
          <h3 className="font-serif text-lg font-medium text-[#2B2233] border-b border-[#EDE6DF] pb-2">
            3. Recommended questions to ask during your appointment
          </h3>

          <ul className="space-y-2 text-xs sm:text-sm text-[#4A3E52]">
            {brief.suggestedClinicianQuestions.map((q, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FBF8F4] border border-[#EFEAE4]"
              >
                <span className="font-serif font-semibold text-[#E07A6B] text-sm shrink-0">
                  Q{idx + 1}.
                </span>
                <span className="leading-relaxed">{q}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Section 4: Unknowns & Gaps */}
        {brief.unknownsToClarify.length > 0 && (
          <section className="space-y-3">
            <h3 className="font-serif text-lg font-medium text-[#2B2233] border-b border-[#EDE6DF] pb-2">
              4. Gaps to clarify together ({brief.unknownsToClarify.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {brief.unknownsToClarify.map((u) => (
                <div
                  key={u.fieldId}
                  className="p-3 rounded-xl bg-[#FDFBF7] border border-dashed border-[#D8CCC3] space-y-1"
                >
                  <strong className="block text-[#9A4638] font-medium">
                    {u.fieldName || u.fieldId}
                  </strong>
                  <p className="text-[#6E6475] leading-normal">
                    {u.reasonWhyItMatters}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer watermark & print info */}
      <div className="px-6 sm:px-8 py-4 bg-[#FBF8F4] border-t border-[#EDE6DF] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#8C8294] gap-2">
        <span>Clara Health Decision Support System · Confidential Clinical Brief</span>
        <span>Generated for patient-directed clinician dialogue</span>
      </div>
    </div>
  );
};

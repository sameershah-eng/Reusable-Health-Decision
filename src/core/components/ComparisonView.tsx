import React, { useState } from 'react';
import type {
  DecisionSnapshot,
  UserContext,
  Decision,
  Observation,
  MetricDelta,
  LearningRecord,
  ObservationMetricDefinition,
} from '../../domain/types';
import { Button } from './base/Button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  AlertTriangle,
  ArrowRight,
  BookmarkCheck,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Minus,
} from 'lucide-react';

export interface ComparisonViewProps {
  snapshot: DecisionSnapshot;
  currentContext: UserContext;
  decision: Decision;
  observations: Observation[];
  metricDefs: ObservationMetricDefinition[];
  learningRecord: LearningRecord | null;
  deltas: MetricDelta[];
  onSaveLearning: (payload: {
    reflections: {
      generalNote?: string;
      surpriseOrDifference?: string;
      nextConversationWithClinician?: string;
    };
    wouldDecideAgain: 'yes' | 'no' | 'different_timing' | 'unsure';
  }) => Promise<void>;
  isSaving?: boolean;
  className?: string;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  snapshot,
  currentContext,
  decision,
  observations,
  metricDefs,
  learningRecord,
  deltas,
  onSaveLearning,
  isSaving = false,
  className = '',
}) => {
  // Snapshot drift check: compare context versions!
  const hasContextDrifted = currentContext.version !== snapshot.contextVersion;

  // Reflections state
  const [wouldDecideAgain, setWouldDecideAgain] = useState<
    'yes' | 'no' | 'different_timing' | 'unsure'
  >(learningRecord?.wouldDecideAgain || 'yes');

  const [reflections, setReflections] = useState({
    generalNote: learningRecord?.reflections.generalNote || '',
    surpriseOrDifference: learningRecord?.reflections.surpriseOrDifference || '',
    nextConversationWithClinician:
      learningRecord?.reflections.nextConversationWithClinician || '',
  });

  const [savedSuccess, setSavedSuccess] = useState(Boolean(learningRecord));

  const handleSave = async () => {
    await onSaveLearning({
      reflections,
      wouldDecideAgain,
    });
    setSavedSuccess(true);
  };

  // Prepare chart data for Recharts
  const chartData = deltas.map((d) => ({
    name: d.metricName.split('&')[0].trim(),
    baseline: d.baselineValue,
    followup: d.followupValue,
    delta: d.delta,
    unit: d.unit,
  }));

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Context Drift Warning Notice (if live context version differs from frozen snapshot version) */}
      {hasContextDrifted && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-950 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm space-y-1">
            <strong className="font-semibold block text-amber-900">
              Context has changed since this decision was recorded
            </strong>
            <p className="text-amber-800 leading-relaxed">
              Your live context is now at version {currentContext.version}, but this decision was made when your context was version {snapshot.contextVersion}. Under the Clara Snapshot Rule, this comparison and your Decision Brief remain permanently anchored to the exact immutable state of your health background at that moment.
            </p>
          </div>
        </div>
      )}

      {/* 3-Column Progression: Before -> Decision -> After */}
      <div className="space-y-4">
        <h3 className="font-serif text-2xl text-[#2B2233] font-medium">
          Before → Decision → After Progression
        </h3>
        <p className="text-xs text-[#6E6475]">
          A side-by-side retrospective view of your journey.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Column 1: BEFORE (Frozen Context Snapshot) */}
          <div className="bg-white rounded-[20px] p-6 border border-[#EDE6DF] shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-[#EDE6DF]">
                <span className="font-semibold uppercase tracking-wider text-[#8C8294]">
                  Stage 1: Before
                </span>
                <span className="text-[11px] text-[#8C8294]">
                  Context v{snapshot.contextVersion}
                </span>
              </div>

              <h4 className="font-serif text-lg font-medium text-[#2B2233]">
                Baseline Context
              </h4>

              <div className="space-y-2 text-xs text-[#4A3E52]">
                {snapshot.frozenSummary.knownItems.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#FBF8F4] border border-[#EFEAE4]">
                    <span className="text-[10px] uppercase text-[#8C8294] block">
                      {item.label}
                    </span>
                    <span className="font-medium text-[#2B2233]">
                      {item.valueDisplay}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-[#8C8294] pt-2 border-t border-[#EDE6DF]">
              {snapshot.frozenUnknowns.length} unknowns were noted at baseline
            </div>
          </div>

          {/* Column 2: DECISION (Recorded Choice & Reasons) */}
          <div className="bg-white rounded-[20px] p-6 border border-[#E07A6B]/30 shadow-xs flex flex-col justify-between space-y-4 relative">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-[#EDE6DF]">
                <span className="font-semibold uppercase tracking-wider text-[#E07A6B]">
                  Stage 3: Decision
                </span>
                <span className="text-[11px] text-[#8C8294]">
                  Confidence: {decision.confidence}/5
                </span>
              </div>

              <h4 className="font-serif text-lg font-medium text-[#2B2233]">
                Choice Recorded
              </h4>

              <div className="p-3.5 rounded-xl bg-[#FDF8F5] border border-[#E07A6B]/20 text-xs text-[#2B2233] space-y-1.5">
                <span className="text-[10px] uppercase tracking-wider text-[#9A4638] font-semibold block">
                  Selected Direction
                </span>
                <p className="font-semibold text-sm capitalize">
                  {decision.choice.replace(/_/g, ' ')}
                </p>
                {decision.freeTextReason && (
                  <p className="text-xs text-[#6E6475] italic pt-1 border-t border-[#EDE6DF]">
                    “{decision.freeTextReason}”
                  </p>
                )}
              </div>

              <div className="space-y-1 text-xs">
                <strong className="text-[10px] uppercase tracking-wider text-[#8C8294] font-semibold block">
                  Underlying Reasons
                </strong>
                <ul className="space-y-1 text-[#4A3E52]">
                  {decision.reasons.map((r, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E07A6B]" />
                      <span>{r.replace(/_/g, ' ')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-[11px] text-[#8C8294] pt-2 border-t border-[#EDE6DF]">
              Decided on {new Date(decision.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Column 3: AFTER (6-Week Follow-up & Deltas) */}
          <div className="bg-white rounded-[20px] p-6 border border-[#EDE6DF] shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-[#EDE6DF]">
                <span className="font-semibold uppercase tracking-wider text-[#8FB39A]">
                  Stage 4: Follow-up
                </span>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                  +6 Weeks
                </span>
              </div>

              <h4 className="font-serif text-lg font-medium text-[#2B2233]">
                Observed Outcome
              </h4>

              <div className="space-y-2 text-xs">
                {deltas.map((d) => (
                  <div
                    key={d.metricId}
                    className="p-3 rounded-xl bg-[#FBF8F4] border border-[#EFEAE4] space-y-1"
                  >
                    <div className="flex items-center justify-between font-medium">
                      <span className="text-[#2B2233]">{d.metricName}</span>
                      <span
                        className={`inline-flex items-center gap-1 font-semibold tabular-nums text-xs ${
                          d.favorable ? 'text-emerald-700' : 'text-[#9A4638]'
                        }`}
                      >
                        {d.delta > 0 ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : d.delta < 0 ? (
                          <TrendingDown className="w-3.5 h-3.5" />
                        ) : (
                          <Minus className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {d.delta > 0 ? `+${d.delta}` : d.delta}
                        </span>
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6E6475]">
                      {d.interpretation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-[#8C8294] pt-2 border-t border-[#EDE6DF]">
              {deltas.length} tracked metrics measured
            </div>
          </div>
        </div>
      </div>

      {/* Visual Chart Section using Recharts */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-[20px] p-6 sm:p-8 border border-[#EDE6DF] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EDE6DF] pb-4">
            <div>
              <h4 className="font-serif text-xl text-[#2B2233] font-medium">
                Metric Shifts Visualized
              </h4>
              <p className="text-xs text-[#6E6475] mt-0.5">
                Comparison of Day 0 Baseline vs. 6-Week Follow-up
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-[#6E6475]">
                <span className="w-3 h-3 rounded bg-[#EDE6DF]" /> Baseline
              </span>
              <span className="flex items-center gap-1.5 text-[#2B2233] font-medium">
                <span className="w-3 h-3 rounded bg-[#E07A6B]" /> Follow-up (+6 wks)
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 20, left: -20, bottom: 20 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#6E6475', fontSize: 12 }}
                  interval={0}
                />
                <YAxis
                  domain={[0, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tick={{ fill: '#8C8294', fontSize: 11 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 bg-white rounded-xl border border-[#EDE6DF] shadow-md text-xs space-y-1">
                          <strong className="block text-[#2B2233]">{data.name}</strong>
                          <p className="text-[#6E6475]">Baseline: {data.baseline} / 5</p>
                          <p className="text-[#E07A6B] font-semibold">Follow-up: {data.followup} / 5</p>
                          <p className="text-[11px] text-[#8C8294]">
                            Delta: {data.delta > 0 ? `+${data.delta}` : data.delta}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={3} stroke="#EDE6DF" strokeDasharray="3 3" />
                <Bar dataKey="baseline" fill="#EDE6DF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="followup" fill="#E07A6B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Reflection Prompts & Save Learning Record */}
      <div className="bg-white rounded-[20px] p-6 sm:p-8 border border-[#EDE6DF] shadow-xs space-y-6">
        <div className="border-b border-[#EDE6DF] pb-4">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#8C8294] block mb-1">
            Personal Reflection Record
          </span>
          <h4 className="font-serif text-2xl text-[#2B2233] font-medium">
            Would you decide the same way again?
          </h4>
          <p className="text-xs sm:text-sm text-[#6E6475] mt-1">
            Capturing your takeaways consolidates your health agency for future conversations.
          </p>
        </div>

        {/* Question: Would you decide again */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-[#2B2233]">
            Looking back on the last 6 weeks, would you make the same choice today?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[
              { id: 'yes', label: 'Yes, definitely' },
              { id: 'different_timing', label: 'Yes, but with different timing' },
              { id: 'no', label: 'No, would explore alternatives' },
              { id: 'unsure', label: 'Still reflecting / unsure' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setWouldDecideAgain(opt.id as any)}
                className={`py-3 px-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer text-center ${
                  wouldDecideAgain === opt.id
                    ? 'bg-[#FDF8F5] border-[#E07A6B] text-[#2B2233] ring-1 ring-[#E07A6B] shadow-xs'
                    : 'bg-white border-[#EDE6DF] text-[#4A3E52] hover:bg-[#FDFBF9]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reflection Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#4A3E52] uppercase tracking-wider mb-1.5">
              1. What felt most helpful or surprising about your outcome?
            </label>
            <textarea
              rows={3}
              value={reflections.surpriseOrDifference}
              onChange={(e) =>
                setReflections({
                  ...reflections,
                  surpriseOrDifference: e.target.value,
                })
              }
              placeholder="e.g. Relief happened faster than expected; joint ache subsided..."
              className="w-full text-xs sm:text-sm p-3 bg-[#FBF8F4] border border-[#E8DFD8] rounded-xl text-[#2B2233] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A6B]/50 resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4A3E52] uppercase tracking-wider mb-1.5">
              2. What do you plan to bring to your next clinical check-in?
            </label>
            <textarea
              rows={3}
              value={reflections.nextConversationWithClinician}
              onChange={(e) =>
                setReflections({
                  ...reflections,
                  nextConversationWithClinician: e.target.value,
                })
              }
              placeholder="e.g. Ask whether we can lower the dosage or review my next bone density scan..."
              className="w-full text-xs sm:text-sm p-3 bg-[#FBF8F4] border border-[#E8DFD8] rounded-xl text-[#2B2233] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A6B]/50 resize-y"
            />
          </div>
        </div>

        {/* Action button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#EDE6DF]">
          {savedSuccess ? (
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Learning Record successfully saved to your permanent history.</span>
            </div>
          ) : (
            <span className="text-xs text-[#8C8294]">
              Saves a permanent record attached to your frozen decision snapshot.
            </span>
          )}

          <Button
            variant="primary"
            size="lg"
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2 shrink-0 w-full sm:w-auto"
          >
            <BookmarkCheck className="w-4 h-4" />
            <span>{savedSuccess ? 'Update Learning Record' : 'Save Learning Record'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

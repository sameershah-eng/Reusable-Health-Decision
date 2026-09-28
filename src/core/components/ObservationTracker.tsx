import React, { useState } from 'react';
import type {
  ObservationMetricDefinition,
  Observation,
  FollowUp,
} from '../../domain/types';
import { Slider } from './base/Slider';
import { Button } from './base/Button';
import { Clock, Calendar, CheckCircle2, FastForward } from 'lucide-react';

export interface ObservationTrackerProps {
  metrics: ObservationMetricDefinition[];
  observations: Observation[];
  followUp: FollowUp | null;
  onSaveObservations: (
    items: Array<{ metricId: string; value: number; note?: string }>,
    phase: 'baseline' | 'followup'
  ) => Promise<void>;
  onSimulateFollowUp: (daysAhead?: number) => Promise<void>;
  onEditContextModal?: () => void;
  isSaving?: boolean;
  className?: string;
}

export const ObservationTracker: React.FC<ObservationTrackerProps> = ({
  metrics,
  observations,
  followUp,
  onSaveObservations,
  onSimulateFollowUp,
  onEditContextModal,
  isSaving = false,
  className = '',
}) => {
  // Determine if follow-up is simulated
  const isFollowUpReady = Boolean(followUp?.completedAt);

  // Local rating states for each metric for follow-up
  const [followupValues, setFollowupValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const m of metrics) {
      const existing = observations.find(
        (o) => o.metricId === m.id && o.phase === 'followup'
      );
      if (existing) {
        initial[m.id] = existing.value;
      } else {
        // default to baseline or midpoint
        const base = observations.find(
          (o) => o.metricId === m.id && o.phase === 'baseline'
        );
        initial[m.id] = base ? base.value : 3;
      }
    }
    return initial;
  });

  const [followupNotes, setFollowupNotes] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const m of metrics) {
      const existing = observations.find(
        (o) => o.metricId === m.id && o.phase === 'followup'
      );
      if (existing && existing.note) {
        initial[m.id] = existing.note;
      }
    }
    return initial;
  });

  const handleSaveFollowup = async () => {
    const items = metrics.map((m) => ({
      metricId: m.id,
      value: followupValues[m.id] ?? 3,
      note: followupNotes[m.id],
    }));
    await onSaveObservations(items, 'followup');
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Top Simulation Utility Ribbon */}
      <div className="bg-gradient-to-r from-[#FBF8F4] to-white rounded-[20px] p-6 sm:p-7 border border-[#EDE6DF] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#8C8294]">
            <Clock className="w-3.5 h-3.5 text-[#E07A6B]" />
            <span>Mock Timeline Engine</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl text-[#2B2233] font-medium">
            {isFollowUpReady
              ? `Follow-up Active (+${followUp?.simulatedOffsetDays || 42} days simulated)`
              : 'Baseline Phase Active'}
          </h3>
          <p className="text-xs text-[#6E6475] max-w-xl">
            {isFollowUpReady
              ? 'You have simulated time advancing 6 weeks forward. Record your follow-up metrics below to compare against your baseline.'
              : 'Your baseline observations were frozen when you made your decision. Advance time to experience how your symptoms progress.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {!isFollowUpReady ? (
            <Button
              variant="primary"
              onClick={() => onSimulateFollowUp(42)}
              disabled={isSaving}
              className="gap-2"
            >
              <FastForward className="w-4 h-4" />
              <span>Simulate follow-up (+6 weeks)</span>
            </Button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Follow-up Simulated</span>
            </div>
          )}

          {onEditContextModal && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onEditContextModal}
              className="text-xs"
            >
              Edit current context (verify snapshot)
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Tracking List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="font-serif text-xl text-[#2B2233] font-medium">
            Your Chosen Observation Metrics ({metrics.length})
          </h4>
          <span className="text-xs text-[#8C8294]">
            Comparing Baseline vs. 6-Week Follow-up
          </span>
        </div>

        <div className="space-y-5">
          {metrics.map((metric) => {
            const baselineObs = observations.find(
              (o) => o.metricId === metric.id && o.phase === 'baseline'
            );
            const currentFollowup = followupValues[metric.id] ?? 3;

            return (
              <div
                key={metric.id}
                className="bg-white rounded-[20px] p-6 sm:p-7 border border-[#EDE6DF] shadow-xs space-y-6"
              >
                {/* Metric Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EDE6DF] pb-4">
                  <div>
                    <h5 className="font-serif text-lg text-[#2B2233] font-medium">
                      {metric.name}
                    </h5>
                    <p className="text-xs text-[#6E6475] mt-0.5">
                      {metric.description}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-[#8C8294]">
                    Scale: {metric.scaleMin} to {metric.scaleMax} ({metric.unit})
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Baseline Frozen Rating */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#FBF8F4] border border-[#EFEAE4] space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#8C8294] uppercase tracking-wider">
                        Baseline Rating (Frozen)
                      </span>
                      <span className="text-[11px] text-[#A297A8]">Day 0</span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="font-serif text-3xl font-semibold text-[#2B2233] tabular-nums">
                        {baselineObs ? baselineObs.value : '—'}
                      </span>
                      <span className="text-xs text-[#6E6475]">
                        / {metric.scaleMax}
                      </span>
                    </div>

                    {baselineObs?.note && (
                      <p className="text-xs text-[#6E6475] italic border-t border-[#EDE6DF] pt-2">
                        “{baselineObs.note}”
                      </p>
                    )}
                  </div>

                  {/* Right Column: Follow-up Rating */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EDE6DF] space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#E07A6B] uppercase tracking-wider">
                        6-Week Follow-up Rating
                      </span>
                      {isFollowUpReady ? (
                        <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                          Active
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#A297A8]">
                          Pending simulation
                        </span>
                      )}
                    </div>

                    {isFollowUpReady ? (
                      <div className="space-y-4">
                        <Slider
                          value={currentFollowup}
                          min={metric.scaleMin}
                          max={metric.scaleMax}
                          step={1}
                          unit={metric.unit}
                          labels={{
                            min: metric.minLabel,
                            max: metric.maxLabel,
                          }}
                          onChange={(val) =>
                            setFollowupValues({ ...followupValues, [metric.id]: val })
                          }
                        />

                        <div>
                          <label className="block text-xs font-medium text-[#6E6475] mb-1">
                            Follow-up personal note (optional):
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Flushes are much milder, only waking once..."
                            value={followupNotes[metric.id] || ''}
                            onChange={(e) =>
                              setFollowupNotes({
                                ...followupNotes,
                                [metric.id]: e.target.value,
                              })
                            }
                            className="w-full text-xs p-2.5 bg-[#FBF8F4] border border-[#E8DFD8] rounded-xl text-[#2B2233] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A6B]/50"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 text-center text-xs text-[#8C8294] space-y-2">
                        <Calendar className="w-5 h-5 mx-auto text-[#A297A8]" />
                        <p>
                          Click "Simulate follow-up (+6 weeks)" above to record your symptom check-in.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Save Follow-up Action */}
        {isFollowUpReady && (
          <div className="flex justify-end pt-4">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSaveFollowup}
              disabled={isSaving}
            >
              {isSaving ? 'Saving observations...' : 'Save Follow-Up Observations'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJourneyStore } from '../state/journeyStore';
import { useUIStore } from '../state/uiStore';
import { TopicRegistry } from '../topics/registry';
import { evaluateJourneyStatus } from '../core/journey/journeyEngine';
import { buildSummary, buildDecisionBrief, compareBeforeAfter } from '../core/logic';
import type { StageId, Observation } from '../domain/types';

import { Stepper } from '../core/components/Stepper';
import { QuestionRenderer } from '../core/components/QuestionRenderer';
import { SummaryPanel } from '../core/components/SummaryPanel';
import { PerspectiveTabs } from '../core/components/PerspectiveTabs';
import { DecisionBriefCard } from '../core/components/DecisionBriefCard';
import { ObservationTracker } from '../core/components/ObservationTracker';
import { ComparisonView } from '../core/components/ComparisonView';
import { Button } from '../core/components/base/Button';
import { Modal } from '../core/components/base/Modal';
import { Slider } from '../core/components/base/Slider';

import {
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  Printer,
  Edit,
  CheckCircle2,
  FileCheck,
  Check,
} from 'lucide-react';

export const JourneyPage: React.FC = () => {
  const { topicId: rawTopicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const currentTopicId = rawTopicId || 'hrt';
  const topic = TopicRegistry.getTopic(currentTopicId);

  const {
    currentStageId,
    setStage,
    userContext,
    decision,
    snapshot,
    observations,
    followUp,
    learningRecord,
    evidence,
    stories,
    isLoading,
    isSaving,
    initTopic,
    updateAnswer,
    updateMultipleAnswers,
    saveDecision,
    saveBaselineObservations,
    saveFollowUpObservations,
    simulateFollowUpTime,
    saveLearningRecord,
  } = useJourneyStore();

  const { showToast } = useUIStore();

  // Multi-step context group index
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);

  // Decision form state
  const [selectedChoice, setSelectedChoice] = useState<string>('');
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [freeTextReason, setFreeTextReason] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(4);
  const [selectedMetricIds, setSelectedMetricIds] = useState<string[]>([]);

  // Baseline observation ratings during Decision stage
  const [baselineMetricValues, setBaselineMetricValues] = useState<Record<string, number>>({});
  const [baselineMetricNotes, setBaselineMetricNotes] = useState<Record<string, string>>({});

  // Modals
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [editContextModalOpen, setEditContextModalOpen] = useState(false);
  const [modalAnswers, setModalAnswers] = useState<Record<string, any>>({});

  // Initialize on mount or topic change
  useEffect(() => {
    if (topic) {
      initTopic(topic.id);
    }
  }, [currentTopicId]);

  // Sync existing decision state when loaded
  useEffect(() => {
    if (decision) {
      setSelectedChoice(decision.choice);
      setSelectedReasons(decision.reasons);
      setFreeTextReason(decision.freeTextReason || '');
      setConfidence(decision.confidence);
      setSelectedMetricIds(decision.observationMetricIds);
    } else if (topic) {
      // Default suggested metrics
      const defaults = topic.rules.suggestMetrics
        ? topic.rules.suggestMetrics(userContext?.answers || {}, [])
        : topic.observationMetrics.slice(0, 3).map((m) => m.id);
      setSelectedMetricIds(defaults);
    }
  }, [decision, topic]);

  // Evaluate journey status and permissions
  const journeyStatus = useMemo(() => {
    return evaluateJourneyStatus(
      currentStageId,
      userContext,
      decision,
      observations,
      followUp,
      learningRecord
    );
  }, [currentStageId, userContext, decision, observations, followUp, learningRecord]);

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <h2 className="font-serif text-2xl text-[#2B2233]">Topic not found</h2>
          <Button onClick={() => navigate('/')}>Return to Topics</Button>
        </div>
      </div>
    );
  }

  if (isLoading || !userContext) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#E07A6B] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-wider font-semibold text-[#8C8294]">
            Preparing {topic.name} Decision Support...
          </p>
        </div>
      </div>
    );
  }

  // Active fields for current context group
  const currentGroup = topic.fieldGroups[activeGroupIndex] || topic.fieldGroups[0];
  const groupFields = topic.contextFields.filter((f) => f.groupId === currentGroup.id);

  // Live context summary & live brief
  const liveSummary = buildSummary(userContext, topic);
  const liveBrief = buildDecisionBrief(userContext, topic);

  // Handler for context answers
  const handleAnswerChange = async (fieldId: string, value: any) => {
    await updateAnswer(fieldId, value);
  };

  // Handler to submit decision and freeze snapshot
  const handleRecordDecision = async () => {
    if (!selectedChoice) {
      showToast('Please select a decision path to continue', 'warning');
      return;
    }
    if (selectedMetricIds.length === 0) {
      showToast('Please choose at least 1 metric to observe over time', 'warning');
      return;
    }

    // 1. Save decision & snapshot
    await saveDecision({
      choice: selectedChoice,
      reasons: selectedReasons,
      freeTextReason,
      confidence,
      observationMetricIds: selectedMetricIds,
    });

    // 2. Save baseline observations for selected metrics
    const baselinePayload = selectedMetricIds.map((metricId) => ({
      metricId,
      value: baselineMetricValues[metricId] ?? 3,
      note: baselineMetricNotes[metricId] || '',
    }));
    await saveBaselineObservations(baselinePayload);

    showToast('Decision recorded & baseline snapshot frozen', 'success');
    setStage('observe');
  };

  // Deltas for learn stage
  const metricDefs = topic.observationMetrics.filter((m) =>
    decision?.observationMetricIds.includes(m.id)
  );
  const baselineObs = observations.filter((o) => o.phase === 'baseline');
  const followupObs = observations.filter((o) => o.phase === 'followup');
  const deltas = compareBeforeAfter(baselineObs, followupObs, metricDefs);

  return (
    <div className="min-h-screen paper-grain pb-24">
      {/* Calm Medical Disclaimer Banner */}
      <div className="no-print bg-[#FAF4EE] border-b border-[#EFE5DC] py-2.5 px-4 text-center text-xs text-[#6E6475]">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#E07A6B] shrink-0" />
          <span>
            {topic.disclaimerOverride ||
              'This tool supports your thinking. It does not give medical advice. Talk to your clinician before making health decisions.'}
          </span>
        </div>
      </div>

      {/* 5-Stage Stepper Navigation */}
      <Stepper
        currentStageId={currentStageId}
        completedStageIds={journeyStatus.completedStageIds}
        isStageAccessible={journeyStatus.isStageAccessible}
        onSelectStage={(s) => setStage(s)}
      />

      {/* Main Stage Canvas */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        {/* ========================================================================= */}
        {/* STAGE 1: CONTEXT */}
        {/* ========================================================================= */}
        {currentStageId === 'context' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Stage Header */}
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#8C8294]">
                Stage 1 of 5 · Context
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#2B2233] font-medium tracking-tight">
                {currentGroup.title}
              </h1>
              <p className="text-sm sm:text-base text-[#6E6475] leading-relaxed max-w-2xl">
                {currentGroup.description}
              </p>
            </div>

            {/* Sub-step indicator for groups */}
            <div className="flex items-center gap-2">
              {topic.fieldGroups.map((g, idx) => (
                <button
                  key={g.id}
                  onClick={() => setActiveGroupIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === activeGroupIndex
                      ? 'w-10 bg-[#E07A6B]'
                      : 'w-4 bg-[#EDE6DF] hover:bg-[#D8CCC3]'
                  }`}
                  aria-label={`Jump to group ${g.title}`}
                />
              ))}
              <span className="text-xs text-[#8C8294] ml-2">
                Section {activeGroupIndex + 1} of {topic.fieldGroups.length}
              </span>
            </div>

            {/* Questions Card */}
            <div className="bg-white rounded-[24px] border border-[#EDE6DF] p-6 sm:p-10 shadow-xs">
              <QuestionRenderer
                fields={groupFields}
                answers={userContext.answers}
                onAnswerChange={handleAnswerChange}
              />
            </div>

            {/* Group Navigation Action Bar */}
            <div className="flex items-center justify-between pt-4">
              {activeGroupIndex > 0 ? (
                <Button
                  variant="subtle"
                  onClick={() => setActiveGroupIndex(activeGroupIndex - 1)}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous Section</span>
                </Button>
              ) : (
                <div />
              )}

              {activeGroupIndex < topic.fieldGroups.length - 1 ? (
                <Button
                  variant="primary"
                  onClick={() => setActiveGroupIndex(activeGroupIndex + 1)}
                  className="gap-2"
                >
                  <span>Next: {topic.fieldGroups[activeGroupIndex + 1].title}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setStage('understand')}
                  className="gap-2"
                >
                  <span>Proceed to Understand</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 2: UNDERSTAND */}
        {/* ========================================================================= */}
        {currentStageId === 'understand' && (
          <div className="space-y-10 animate-fadeIn">
            {/* Stage Header */}
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#8C8294]">
                Stage 2 of 5 · Understand
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#2B2233] font-medium tracking-tight">
                Synthesizing your context, evidence & real stories
              </h1>
              <p className="text-sm sm:text-base text-[#6E6475] leading-relaxed max-w-2xl">
                {topic.copy.understandIntro}
              </p>
            </div>

            {/* Summary Panel (What you told us vs What we don't know yet) */}
            <SummaryPanel
              summary={liveSummary}
              onEditContext={() => setStage('context')}
            />

            {/* Three Perspectives: Yourself, Science, Others */}
            <PerspectiveTabs
              topic={topic}
              userContext={userContext}
              summary={liveSummary}
              evidence={evidence}
              stories={stories}
            />

            {/* Bottom Progression Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#EDE6DF]">
              <Button
                variant="subtle"
                onClick={() => setStage('context')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Update context answers</span>
              </Button>

              <Button
                variant="primary"
                size="lg"
                onClick={() => setStage('decision')}
                className="gap-2 w-full sm:w-auto"
              >
                <span>Proceed to Decision Brief</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 3: DECISION */}
        {/* ========================================================================= */}
        {currentStageId === 'decision' && (
          <div className="space-y-10 animate-fadeIn">
            {/* Stage Header */}
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#8C8294]">
                Stage 3 of 5 · Decision
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#2B2233] font-medium tracking-tight">
                Your Decision Brief & Direction
              </h1>
              <p className="text-sm sm:text-base text-[#6E6475] leading-relaxed max-w-2xl">
                {topic.copy.decisionIntro}
              </p>
            </div>

            {/* Printable Decision Brief Card */}
            <DecisionBriefCard
              brief={liveBrief}
              isSnapshot={false}
              contextVersion={userContext.version}
              onPrint={() => setPrintModalOpen(true)}
            />

            {/* Record Decision Form Card */}
            <div className="bg-white rounded-[24px] border border-[#EDE6DF] p-6 sm:p-10 shadow-xs space-y-8">
              <div className="border-b border-[#EDE6DF] pb-4">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#E07A6B] block mb-1">
                  Step A · Record Your Direction
                </span>
                <h3 className="font-serif text-2xl text-[#2B2233] font-medium">
                  What direction feels most aligned today?
                </h3>
                <p className="text-xs text-[#6E6475] mt-1">
                  You are not bound to this choice. It provides an anchor for tracking and clinical discussion.
                </p>
              </div>

              {/* Decision Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {topic.decisionOptions.map((opt) => {
                  const isSelected = selectedChoice === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedChoice(opt.id)}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#FDF8F5] border-[#E07A6B] ring-1 ring-[#E07A6B] shadow-xs'
                          : 'bg-white border-[#EDE6DF] hover:border-[#D8CCC3] hover:bg-[#FDFBF9]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-sm text-[#2B2233]">
                          {opt.label}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected
                              ? 'bg-[#E07A6B] border-[#E07A6B] text-white'
                              : 'border-[#D8CCC3]'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-xs text-[#6E6475] mt-1.5 leading-relaxed">
                        {opt.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Reasons (Multi-select) */}
              <div className="space-y-3 pt-4 border-t border-[#EDE6DF]">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-[#8C8294] block mb-1">
                    Step B · Your Key Reasons
                  </span>
                  <label className="block text-sm font-medium text-[#2B2233]">
                    What factors weighed most heavily in this leaning?
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {topic.reasonOptions.map((r) => {
                    const isChecked = selectedReasons.includes(r.id);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setSelectedReasons(selectedReasons.filter((id) => id !== r.id));
                          } else {
                            setSelectedReasons([...selectedReasons, r.id]);
                          }
                        }}
                        className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                          isChecked
                            ? 'bg-[#FDF8F5] border-[#E07A6B] text-[#2B2233] font-medium'
                            : 'bg-white border-[#EDE6DF] text-[#4A3E52] hover:bg-[#FDFBF9]'
                        }`}
                      >
                        <span>{r.label}</span>
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ml-2 ${
                            isChecked
                              ? 'bg-[#E07A6B] border-[#E07A6B] text-white'
                              : 'border-[#D8CCC3]'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <label className="block text-xs text-[#6E6475] mb-1">
                    Additional private notes on your reasoning (optional):
                  </label>
                  <textarea
                    rows={2}
                    value={freeTextReason}
                    onChange={(e) => setFreeTextReason(e.target.value)}
                    placeholder="e.g. Bringing this up with Dr. Chen next Tuesday..."
                    className="w-full text-xs sm:text-sm p-3 bg-[#FBF8F4] border border-[#E8DFD8] rounded-xl text-[#2B2233] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A6B]/50 resize-y"
                  />
                </div>
              </div>

              {/* Confidence Rating Slider */}
              <div className="space-y-3 pt-4 border-t border-[#EDE6DF]">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-[#8C8294] block mb-1">
                    Step C · Decision Confidence
                  </span>
                  <label className="block text-sm font-medium text-[#2B2233]">
                    How confident do you feel about this current direction?
                  </label>
                </div>

                <Slider
                  value={confidence}
                  min={1}
                  max={5}
                  step={1}
                  labels={{
                    min: '1 - Low confidence / still exploring',
                    mid: '3 - Moderate / ready to ask questions',
                    max: '5 - High confidence / clear preference',
                  }}
                  onChange={(val) => setConfidence(val)}
                />
              </div>

              {/* Choose 2-4 Observation Metrics */}
              <div className="space-y-4 pt-4 border-t border-[#EDE6DF]">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-[#8C8294] block mb-1">
                    Step D · Longitudinal Metrics
                  </span>
                  <label className="block text-sm font-medium text-[#2B2233]">
                    Choose 2 to 4 observation metrics you want to track over time:
                  </label>
                  <p className="text-xs text-[#6E6475] mt-0.5">
                    You will rate baseline levels today and check back at your 6-week follow-up.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {topic.observationMetrics.map((m) => {
                    const isSelected = selectedMetricIds.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedMetricIds(selectedMetricIds.filter((id) => id !== m.id));
                          } else {
                            if (selectedMetricIds.length >= 4) {
                              showToast('Please select at most 4 metrics to keep tracking focused', 'warning');
                              return;
                            }
                            setSelectedMetricIds([...selectedMetricIds, m.id]);
                          }
                        }}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#FDF8F5] border-[#E07A6B] ring-1 ring-[#E07A6B] shadow-xs'
                            : 'bg-white border-[#EDE6DF] hover:bg-[#FDFBF9]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <span className="text-xs font-semibold text-[#2B2233]">
                            {m.name}
                          </span>
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-[#E07A6B] border-[#E07A6B] text-white'
                                : 'border-[#D8CCC3]'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                        <p className="text-[11px] text-[#6E6475] mt-1 leading-normal">
                          {m.description}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Baseline rating inputs for selected metrics */}
                {selectedMetricIds.length > 0 && (
                  <div className="mt-4 p-5 rounded-2xl bg-[#FBF8F4] border border-[#EFEAE4] space-y-4">
                    <span className="text-xs uppercase tracking-wider font-semibold text-[#8C8294] block">
                      Rate Current Day 0 Baseline for Chosen Metrics
                    </span>

                    <div className="space-y-4">
                      {selectedMetricIds.map((mId) => {
                        const mDef = topic.observationMetrics.find((m) => m.id === mId);
                        if (!mDef) return null;
                        const curVal = baselineMetricValues[mId] ?? 3;

                        return (
                          <div
                            key={mId}
                            className="p-4 rounded-xl bg-white border border-[#EDE6DF] space-y-2"
                          >
                            <span className="text-xs font-medium text-[#2B2233]">
                              {mDef.name}
                            </span>
                            <Slider
                              value={curVal}
                              min={mDef.scaleMin}
                              max={mDef.scaleMax}
                              step={1}
                              unit={mDef.unit}
                              labels={{ min: mDef.minLabel, max: mDef.maxLabel }}
                              onChange={(val) =>
                                setBaselineMetricValues({
                                  ...baselineMetricValues,
                                  [mId]: val,
                                })
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#EDE6DF]">
                <Button
                  variant="subtle"
                  onClick={() => setStage('understand')}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Understand</span>
                </Button>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleRecordDecision}
                  disabled={isSaving || !selectedChoice}
                  className="gap-2 w-full sm:w-auto"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>{isSaving ? 'Freezing Snapshot...' : 'Save Decision & Freeze Baseline'}</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 4: OBSERVE */}
        {/* ========================================================================= */}
        {currentStageId === 'observe' && (
          <div className="space-y-10 animate-fadeIn">
            {/* Stage Header */}
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#8C8294]">
                Stage 4 of 5 · Observe
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#2B2233] font-medium tracking-tight">
                Simulated Follow-up & Metric Tracking
              </h1>
              <p className="text-sm sm:text-base text-[#6E6475] leading-relaxed max-w-2xl">
                {topic.copy.observeIntro}
              </p>
            </div>

            {decision && (
              <ObservationTracker
                metrics={metricDefs}
                observations={observations}
                followUp={followUp}
                isSaving={isSaving}
                onSaveObservations={async (items, phase) => {
                  if (phase === 'followup') {
                    await saveFollowUpObservations(items);
                    showToast('Follow-up observations saved', 'success');
                    setStage('learn');
                  }
                }}
                onSimulateFollowUp={async (days) => {
                  await simulateFollowUpTime(days);
                  showToast('Mock timeline advanced +6 weeks', 'success');
                }}
                onEditContextModal={() => {
                  setModalAnswers(userContext.answers);
                  setEditContextModalOpen(true);
                }}
              />
            )}

            {/* Bottom Progression Bar */}
            <div className="flex items-center justify-between pt-6 border-t border-[#EDE6DF]">
              <Button
                variant="subtle"
                onClick={() => setStage('decision')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Review Decision Brief</span>
              </Button>

              <Button
                variant="primary"
                size="lg"
                onClick={() => setStage('learn')}
                className="gap-2"
              >
                <span>Proceed to Learn & Comparison</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 5: LEARN */}
        {/* ========================================================================= */}
        {currentStageId === 'learn' && snapshot && decision && (
          <div className="space-y-10 animate-fadeIn">
            {/* Stage Header */}
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#8C8294]">
                Stage 5 of 5 · Learn
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#2B2233] font-medium tracking-tight">
                Retrospective Comparison & Learning Record
              </h1>
              <p className="text-sm sm:text-base text-[#6E6475] leading-relaxed max-w-2xl">
                {topic.copy.learnIntro}
              </p>
            </div>

            <ComparisonView
              snapshot={snapshot}
              currentContext={userContext}
              decision={decision}
              observations={observations}
              metricDefs={metricDefs}
              learningRecord={learningRecord}
              deltas={deltas}
              isSaving={isSaving}
              onSaveLearning={async (payload) => {
                await saveLearningRecord(payload);
                showToast('Learning Record saved to history', 'success');
              }}
            />

            {/* Bottom Navigation */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#EDE6DF]">
              <Button
                variant="subtle"
                onClick={() => setStage('observe')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Observe Stage</span>
              </Button>

              <Button
                variant="secondary"
                onClick={() => navigate('/history')}
                className="gap-2"
              >
                <span>View All Past Decisions</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: PRINTABLE DECISION BRIEF MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        title="Printable Decision Brief"
        maxWidth="4xl"
      >
        <div className="space-y-4">
          <DecisionBriefCard
            brief={snapshot?.frozenBrief || liveBrief}
            isSnapshot={Boolean(snapshot)}
            contextVersion={snapshot?.contextVersion || userContext.version}
            onPrint={() => window.print()}
          />
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT CONTEXT MODAL (Proves Snapshots Stay Intact) */}
      {/* ========================================================================= */}
      <Modal
        isOpen={editContextModalOpen}
        onClose={() => setEditContextModalOpen(false)}
        title="Edit Live Context (Verify Snapshot Immutability)"
        maxWidth="2xl"
      >
        <div className="space-y-5 text-sm">
          <p className="text-xs text-[#6E6475] leading-relaxed">
            Editing your answers creates a new live Context version (e.g. v{userContext.version + 1}). Your original decision snapshot (v{snapshot?.contextVersion || 1}) remains 100% frozen. When you return to the Learn stage, you will notice a "Context has changed" banner.
          </p>

          <QuestionRenderer
            fields={topic.contextFields.slice(0, 4)}
            answers={modalAnswers}
            onAnswerChange={(fId, val) =>
              setModalAnswers((prev) => ({ ...prev, [fId]: val }))
            }
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-[#EDE6DF]">
            <Button
              variant="subtle"
              onClick={() => setEditContextModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={async () => {
                await updateMultipleAnswers(modalAnswers);
                setEditContextModalOpen(false);
                showToast(`Context updated to v${userContext.version + 1}. Snapshot remains frozen.`, 'info');
              }}
            >
              Save New Context Version
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

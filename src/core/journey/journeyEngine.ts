import { JOURNEY_STAGES } from './stages';
import type {
  StageId,
  UserContext,
  Decision,
  Observation,
  FollowUp,
  LearningRecord,
} from '../../domain/types';

export interface JourneyStatus {
  currentStageId: StageId;
  completedStageIds: StageId[];
  isStageAccessible: (stageId: StageId) => boolean;
  canProceedToNext: boolean;
  nextStageId: StageId | null;
  prevStageId: StageId | null;
  overallProgressPercent: number;
}

export function evaluateJourneyStatus(
  currentStageId: StageId,
  context?: UserContext | null,
  decision?: Decision | null,
  observations?: Observation[] | null,
  followUp?: FollowUp | null,
  learningRecord?: LearningRecord | null
): JourneyStatus {
  const completedStageIds: StageId[] = [];

  // Stage 1: Context is considered completed if user has moved forward or has any answers
  const hasAnswers = context && Object.keys(context.answers || {}).length > 0;
  if (hasAnswers) {
    completedStageIds.push('context');
  }

  // Stage 2: Understand is accessible once context has been engaged
  // It's completed once the user has moved past it or has viewed it
  const isUnderstandCompleted = Boolean(decision || completedStageIds.includes('understand'));
  if (isUnderstandCompleted) {
    completedStageIds.push('understand');
  }

  // Stage 3: Decision is completed once a decision record exists
  if (decision && decision.choice) {
    completedStageIds.push('decision');
  }

  // Stage 4: Observe is completed once a follow-up has occurred and follow-up observations are recorded
  const hasFollowupObs =
    observations &&
    observations.some((o) => o.phase === 'followup');
  if (followUp?.completedAt || hasFollowupObs) {
    completedStageIds.push('observe');
  }

  // Stage 5: Learn is completed if learningRecord exists
  if (learningRecord) {
    completedStageIds.push('learn');
  }

  const isStageAccessible = (targetStageId: StageId): boolean => {
    if (targetStageId === 'context') return true;
    if (targetStageId === 'understand') return true; // user can always read evidence
    if (targetStageId === 'decision') return true; // user can proceed to decision
    if (targetStageId === 'observe') return Boolean(decision && decision.choice);
    if (targetStageId === 'learn') return Boolean(decision && decision.choice);
    return false;
  };

  const currentIndex = JOURNEY_STAGES.findIndex((s) => s.id === currentStageId);
  const nextStageId =
    currentIndex < JOURNEY_STAGES.length - 1 ? JOURNEY_STAGES[currentIndex + 1].id : null;
  const prevStageId = currentIndex > 0 ? JOURNEY_STAGES[currentIndex - 1].id : null;

  // Calculate overall progress
  const stageWeights = {
    context: 20,
    understand: 20,
    decision: 20,
    observe: 20,
    learn: 20,
  };

  let progress = 0;
  if (hasAnswers) progress += stageWeights.context;
  if (completedStageIds.includes('understand')) progress += stageWeights.understand;
  if (decision?.choice) progress += stageWeights.decision;
  if (hasFollowupObs || followUp?.completedAt) progress += stageWeights.observe;
  if (learningRecord) progress += stageWeights.learn;

  const canProceedToNext = Boolean(
    nextStageId && isStageAccessible(nextStageId)
  );

  return {
    currentStageId,
    completedStageIds,
    isStageAccessible,
    canProceedToNext,
    nextStageId,
    prevStageId,
    overallProgressPercent: Math.min(100, progress),
  };
}

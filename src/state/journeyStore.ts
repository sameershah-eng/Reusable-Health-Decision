import { create } from 'zustand';
import type {
  StageId,
  UserContext,
  Decision,
  DecisionSnapshot,
  Observation,
  FollowUp,
  LearningRecord,
  EvidenceItem,
  ExperienceStory,
  MetricDelta,
} from '../domain/types';
import { TopicRegistry } from '../topics/registry';
import { services, MockStorageManager } from '../services';
import { compareBeforeAfter } from '../core/logic';
import { SEED_PERSONAS } from '../data/seed/personas';

interface JourneyState {
  topicId: string;
  userId: string;
  currentStageId: StageId;
  userContext: UserContext | null;
  decision: Decision | null;
  snapshot: DecisionSnapshot | null;
  observations: Observation[];
  followUp: FollowUp | null;
  learningRecord: LearningRecord | null;
  evidence: EvidenceItem[];
  stories: ExperienceStory[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  initTopic: (topicId: string) => Promise<void>;
  setStage: (stageId: StageId) => void;
  updateAnswer: (fieldId: string, value: any) => Promise<void>;
  updateMultipleAnswers: (answers: Record<string, any>) => Promise<void>;
  resetContext: () => Promise<void>;
  saveDecision: (payload: {
    choice: string;
    reasons: string[];
    freeTextReason?: string;
    confidence: number;
    observationMetricIds: string[];
  }) => Promise<void>;
  saveBaselineObservations: (
    items: Array<{ metricId: string; value: number; note?: string }>
  ) => Promise<void>;
  saveFollowUpObservations: (
    items: Array<{ metricId: string; value: number; note?: string }>
  ) => Promise<void>;
  simulateFollowUpTime: (daysAhead?: number) => Promise<void>;
  saveLearningRecord: (payload: {
    reflections: {
      generalNote?: string;
      surpriseOrDifference?: string;
      nextConversationWithClinician?: string;
    };
    wouldDecideAgain: 'yes' | 'no' | 'different_timing' | 'unsure';
  }) => Promise<void>;
  loadPersonaSeed: (personaId: string) => Promise<void>;
  resetAllJourneyData: () => Promise<void>;
}

export const useJourneyStore = create<JourneyState>((set, get) => ({
  topicId: 'hrt',
  userId: MockStorageManager.getInstance().getActiveUserId(),
  currentStageId: 'context',
  userContext: null,
  decision: null,
  snapshot: null,
  observations: [],
  followUp: null,
  learningRecord: null,
  evidence: [],
  stories: [],
  isLoading: true,
  isSaving: false,
  error: null,

  initTopic: async (topicId: string) => {
    set({ isLoading: true, error: null, topicId });
    try {
      const storage = MockStorageManager.getInstance();
      const userId = storage.getActiveUserId();

      // Load content
      const [evidence, stories] = await Promise.all([
        services.content.getEvidence(topicId),
        services.content.getStories(topicId),
      ]);

      // Load context
      const userContext = await services.context.getContext(topicId, userId);

      // Load decision & snapshot if exists
      const decision = await services.decision.getDecision(topicId, userId);
      let snapshot: DecisionSnapshot | null = null;
      let observations: Observation[] = [];
      let followUp: FollowUp | null = null;
      let learningRecord: LearningRecord | null = null;

      if (decision) {
        if (decision.snapshotId) {
          snapshot = await services.decision.getSnapshot(decision.snapshotId);
        }
        observations = await services.observation.getObservations(decision.id);
        followUp = await services.observation.getFollowUp(decision.id);
        learningRecord = await services.learning.getLearningRecord(decision.id);
      }

      set({
        topicId,
        userId,
        evidence,
        stories,
        userContext,
        decision,
        snapshot,
        observations,
        followUp,
        learningRecord,
        isLoading: false,
      });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Failed to load topic state' });
    }
  },

  setStage: (stageId: StageId) => {
    set({ currentStageId: stageId });
  },

  updateAnswer: async (fieldId: string, value: any) => {
    const { topicId, userId, userContext } = get();
    if (!userContext) return;

    set({ isSaving: true });
    try {
      const updatedAnswers = { ...userContext.answers, [fieldId]: value };
      const newContext = await services.context.saveAnswers(topicId, userId, updatedAnswers);
      set({ userContext: newContext, isSaving: false });
    } catch (err: any) {
      set({ isSaving: false, error: err.message });
    }
  },

  updateMultipleAnswers: async (answers: Record<string, any>) => {
    const { topicId, userId, userContext } = get();
    if (!userContext) return;

    set({ isSaving: true });
    try {
      const updatedAnswers = { ...userContext.answers, ...answers };
      const newContext = await services.context.saveAnswers(topicId, userId, updatedAnswers);
      set({ userContext: newContext, isSaving: false });
    } catch (err: any) {
      set({ isSaving: false, error: err.message });
    }
  },

  resetContext: async () => {
    const { topicId, userId } = get();
    set({ isSaving: true });
    try {
      const emptyContext = await services.context.resetContext(topicId, userId);
      set({ userContext: emptyContext, isSaving: false });
    } catch (err: any) {
      set({ isSaving: false, error: err.message });
    }
  },

  saveDecision: async (payload) => {
    const { topicId, userId, userContext } = get();
    const topic = TopicRegistry.getTopic(topicId);
    if (!userContext || !topic) return;

    set({ isSaving: true });
    try {
      const result = await services.decision.saveDecision(
        {
          userId,
          topicId,
          choice: payload.choice,
          reasons: payload.reasons,
          freeTextReason: payload.freeTextReason,
          confidence: payload.confidence,
          observationMetricIds: payload.observationMetricIds,
        },
        userContext,
        topic
      );

      set({
        decision: result.decision,
        snapshot: result.snapshot,
        isSaving: false,
      });
    } catch (err: any) {
      set({ isSaving: false, error: err.message });
    }
  },

  saveBaselineObservations: async (items) => {
    const { decision } = get();
    if (!decision) return;

    set({ isSaving: true });
    try {
      const obsPayload = items.map((i) => ({
        decisionId: decision.id,
        metricId: i.metricId,
        phase: 'baseline' as const,
        value: i.value,
        note: i.note,
      }));

      await services.observation.recordObservations(decision.id, obsPayload);
      const updated = await services.observation.getObservations(decision.id);
      set({ observations: updated, isSaving: false });
    } catch (err: any) {
      set({ isSaving: false, error: err.message });
    }
  },

  saveFollowUpObservations: async (items) => {
    const { decision } = get();
    if (!decision) return;

    set({ isSaving: true });
    try {
      const obsPayload = items.map((i) => ({
        decisionId: decision.id,
        metricId: i.metricId,
        phase: 'followup' as const,
        value: i.value,
        note: i.note,
      }));

      await services.observation.recordObservations(decision.id, obsPayload);
      const updated = await services.observation.getObservations(decision.id);
      set({ observations: updated, isSaving: false });
    } catch (err: any) {
      set({ isSaving: false, error: err.message });
    }
  },

  simulateFollowUpTime: async (daysAhead = 42) => {
    const { decision } = get();
    if (!decision) return;

    set({ isSaving: true });
    try {
      const followUp = await services.observation.simulateFollowUp(decision.id, daysAhead);
      set({ followUp, isSaving: false });
    } catch (err: any) {
      set({ isSaving: false, error: err.message });
    }
  },

  saveLearningRecord: async (payload) => {
    const { decision, topicId, observations } = get();
    const topic = TopicRegistry.getTopic(topicId);
    if (!decision || !topic) return;

    set({ isSaving: true });
    try {
      const baselines = observations.filter((o) => o.phase === 'baseline');
      const followups = observations.filter((o) => o.phase === 'followup');
      const deltas: MetricDelta[] = compareBeforeAfter(
        baselines,
        followups,
        topic.observationMetrics
      );

      const record = await services.learning.saveLearningRecord({
        decisionId: decision.id,
        topicId,
        reflections: payload.reflections,
        wouldDecideAgain: payload.wouldDecideAgain,
        deltas,
      });

      set({ learningRecord: record, isSaving: false });
    } catch (err: any) {
      set({ isSaving: false, error: err.message });
    }
  },

  loadPersonaSeed: async (personaId: string) => {
    const seed = SEED_PERSONAS.find((p) => p.id === personaId);
    if (!seed) return;

    set({ isLoading: true });
    const storage = MockStorageManager.getInstance();
    storage.loadPersona(seed);

    // Re-init with this persona's topic
    await get().initTopic(seed.topicId);
  },

  resetAllJourneyData: async () => {
    set({ isLoading: true });
    const storage = MockStorageManager.getInstance();
    storage.resetToDefaultSeed();
    await get().initTopic(get().topicId);
  },
}));

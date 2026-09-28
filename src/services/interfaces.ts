import type {
  UserContext,
  Decision,
  DecisionSnapshot,
  EvidenceItem,
  ExperienceStory,
  Observation,
  FollowUp,
  LearningRecord,
  TopicConfig,
} from '../domain/types';

export interface IContextService {
  getContext(topicId: string, userId: string): Promise<UserContext>;
  saveAnswers(topicId: string, userId: string, answers: Record<string, any>): Promise<UserContext>;
  resetContext(topicId: string, userId: string): Promise<UserContext>;
}

export interface IDecisionService {
  getDecision(topicId: string, userId: string): Promise<Decision | null>;
  saveDecision(
    payload: {
      userId: string;
      topicId: string;
      choice: string;
      reasons: string[];
      freeTextReason?: string;
      confidence: number;
      observationMetricIds: string[];
    },
    context: UserContext,
    topic: TopicConfig
  ): Promise<{ decision: Decision; snapshot: DecisionSnapshot }>;
  getSnapshot(snapshotId: string): Promise<DecisionSnapshot | null>;
  listDecisionHistory(userId: string): Promise<Array<{ decision: Decision; snapshot: DecisionSnapshot }>>;
  deleteDecision(decisionId: string): Promise<void>;
}

export interface IContentService {
  getEvidence(topicId: string): Promise<EvidenceItem[]>;
  getStories(topicId: string): Promise<ExperienceStory[]>;
}

export interface IObservationService {
  getObservations(decisionId: string): Promise<Observation[]>;
  recordObservations(
    decisionId: string,
    observations: Array<Omit<Observation, 'id' | 'recordedAt'>>
  ): Promise<Observation[]>;
  simulateFollowUp(decisionId: string, daysAhead?: number): Promise<FollowUp>;
  getFollowUp(decisionId: string): Promise<FollowUp | null>;
}

export interface ILearningService {
  getLearningRecord(decisionId: string): Promise<LearningRecord | null>;
  saveLearningRecord(
    record: Omit<LearningRecord, 'id' | 'createdAt'>
  ): Promise<LearningRecord>;
}

export interface Services {
  context: IContextService;
  decision: IDecisionService;
  content: IContentService;
  observation: IObservationService;
  learning: ILearningService;
}

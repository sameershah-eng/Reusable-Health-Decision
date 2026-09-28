/**
 * Clara Health Decision Support Framework
 * Domain Type Definitions
 */

export type StageId = 'context' | 'understand' | 'decision' | 'observe' | 'learn';

export interface StageDefinition {
  id: StageId;
  label: string;
  order: number;
  shortDescription: string;
}

export type FieldType = 'single-select' | 'multi-select' | 'slider' | 'boolean-flag' | 'text';

export interface FieldOption {
  value: string;
  label: string;
  description?: string;
}

export interface ContextFieldDefinition {
  id: string;
  groupId: string;
  groupTitle: string;
  groupDescription?: string;
  question: string;
  helperText?: string;
  type: FieldType;
  options?: FieldOption[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  sliderLabels?: {
    min: string;
    max: string;
    mid?: string;
  };
  allowSkip: boolean;
  skipValue?: any;
  placeholder?: string;
}

export interface UserContext {
  id: string;
  userId: string;
  topicId: string;
  version: number;
  answers: Record<string, any>;
  updatedAt: string;
}

export type EvidenceStrength = 'Strong' | 'Moderate' | 'Limited' | 'Uncertain';
export type EvidenceCategory = 'benefit' | 'risk' | 'uncertainty';

export interface EvidenceItem {
  id: string;
  topicId: string;
  category: EvidenceCategory;
  title: string;
  summary: string;
  detailedBody: string;
  strength: EvidenceStrength;
  sourceReference: string;
  tags?: string[];
  relevanceTags?: string[]; // Used to highlight when relevant to user context
}

export interface ExperienceStory {
  id: string;
  topicId: string;
  personaName: string;
  ageRange: string;
  headline: string;
  situation: string;
  choiceMade: string;
  outcome: string;
  quote: string;
  reflection: string;
  isIllustrative: true;
}

export interface UnknownItem {
  fieldId: string;
  fieldName: string;
  reasonWhyItMatters: string;
  suggestedAction: string;
}

export interface ContextSummary {
  knownItems: {
    label: string;
    valueDisplay: string;
    category: string;
  }[];
  unknownItems: UnknownItem[];
  priorities: string[];
  concerns: string[];
}

export interface ClinicalConsideration {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'advisory' | 'priority';
  matchedRule: string;
}

export interface DecisionBriefData {
  topicName: string;
  generatedAt: string;
  contextSummary: ContextSummary;
  clinicalConsiderations: ClinicalConsideration[];
  suggestedClinicianQuestions: string[];
  unknownsToClarify: UnknownItem[];
}

export interface DecisionOption {
  id: string;
  label: string;
  description: string;
}

export interface ReasonOption {
  id: string;
  label: string;
  category?: string;
}

export interface ObservationMetricDefinition {
  id: string;
  name: string;
  description: string;
  unit: string;
  scaleMin: number;
  scaleMax: number;
  minLabel: string;
  maxLabel: string;
  higherIsBetter?: boolean;
}

export interface Decision {
  id: string;
  userId: string;
  topicId: string;
  choice: string;
  reasons: string[];
  freeTextReason?: string;
  confidence: number; // 1 to 5
  observationMetricIds: string[];
  snapshotId: string;
  createdAt: string;
  status: 'draft' | 'decided' | 'reviewed';
}

export interface DecisionSnapshot {
  id: string;
  decisionId: string;
  topicId: string;
  contextVersion: number;
  frozenContext: UserContext;
  frozenSummary: ContextSummary;
  frozenUnknowns: UnknownItem[];
  frozenBrief: DecisionBriefData;
  contentVersion: string;
  createdAt: string;
}

export interface Observation {
  id: string;
  decisionId: string;
  metricId: string;
  phase: 'baseline' | 'followup';
  value: number;
  note?: string;
  recordedAt: string;
}

export interface FollowUp {
  id: string;
  decisionId: string;
  scheduledFor: string;
  completedAt?: string;
  simulatedOffsetDays: number;
}

export interface MetricDelta {
  metricId: string;
  metricName: string;
  unit: string;
  baselineValue: number;
  followupValue: number;
  delta: number;
  interpretation: string;
  favorable: boolean;
}

export interface LearningRecord {
  id: string;
  decisionId: string;
  topicId: string;
  reflections: {
    generalNote?: string;
    surpriseOrDifference?: string;
    nextConversationWithClinician?: string;
  };
  wouldDecideAgain: 'yes' | 'no' | 'different_timing' | 'unsure';
  deltas: MetricDelta[];
  createdAt: string;
}

export interface TopicRules {
  unknownDetectors: Array<(answers: Record<string, any>) => UnknownItem | null>;
  evaluateConsiderations: (answers: Record<string, any>) => ClinicalConsideration[];
  suggestQuestions: (answers: Record<string, any>) => string[];
  suggestMetrics?: (answers: Record<string, any>, reasons: string[]) => string[];
}

export interface TopicConfig {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  iconName: string;
  contentVersion: string;
  disclaimerOverride?: string;
  contextFields: ContextFieldDefinition[];
  fieldGroups: {
    id: string;
    title: string;
    description: string;
  }[];
  perspectives: {
    yourselfPrompts: string[];
    valuesClarifications: {
      id: string;
      prompt: string;
      options: string[];
    }[];
  };
  decisionOptions: DecisionOption[];
  reasonOptions: ReasonOption[];
  observationMetrics: ObservationMetricDefinition[];
  rules: TopicRules;
  copy: {
    contextIntro: string;
    understandIntro: string;
    decisionIntro: string;
    observeIntro: string;
    learnIntro: string;
    briefSummaryKicker: string;
  };
}

export interface PersonaSeed {
  id: string;
  name: string;
  topicId: string;
  label: string;
  description: string;
  context: Partial<UserContext>;
  decision?: Partial<Decision>;
  observations?: Partial<Observation>[];
  followUpSimulated?: boolean;
}

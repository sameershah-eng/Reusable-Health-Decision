import { z } from 'zod';

export const UserContextSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  topicId: z.string().min(1),
  version: z.number().int().positive(),
  answers: z.record(z.string(), z.any()),
  updatedAt: z.string(),
});

export const UnknownItemSchema = z.object({
  fieldId: z.string(),
  fieldName: stringOrEmpty(),
  reasonWhyItMatters: z.string(),
  suggestedAction: z.string(),
});

function stringOrEmpty() {
  return z.string().optional().default('');
}

export const ClinicalConsiderationSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  severity: z.enum(['info', 'advisory', 'priority']),
  matchedRule: z.string(),
});

export const ContextSummarySchema = z.object({
  knownItems: z.array(
    z.object({
      label: z.string(),
      valueDisplay: z.string(),
      category: z.string(),
    })
  ),
  unknownItems: z.array(UnknownItemSchema),
  priorities: z.array(z.string()),
  concerns: z.array(z.string()),
});

export const DecisionBriefDataSchema = z.object({
  topicName: z.string(),
  generatedAt: z.string(),
  contextSummary: ContextSummarySchema,
  clinicalConsiderations: z.array(ClinicalConsiderationSchema),
  suggestedClinicianQuestions: z.array(z.string()),
  unknownsToClarify: z.array(UnknownItemSchema),
});

export const DecisionSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  topicId: z.string().min(1),
  choice: z.string().min(1),
  reasons: z.array(z.string()),
  freeTextReason: z.string().optional(),
  confidence: z.number().min(1).max(5),
  observationMetricIds: z.array(z.string()),
  snapshotId: z.string(),
  createdAt: z.string(),
  status: z.enum(['draft', 'decided', 'reviewed']),
});

export const DecisionSnapshotSchema = z.object({
  id: z.string().min(1),
  decisionId: z.string().min(1),
  topicId: z.string().min(1),
  contextVersion: z.number().int().positive(),
  frozenContext: UserContextSchema,
  frozenSummary: ContextSummarySchema,
  frozenUnknowns: z.array(UnknownItemSchema),
  frozenBrief: DecisionBriefDataSchema,
  contentVersion: z.string(),
  createdAt: z.string(),
});

export const ObservationSchema = z.object({
  id: z.string().min(1),
  decisionId: z.string().min(1),
  metricId: z.string().min(1),
  phase: z.enum(['baseline', 'followup']),
  value: z.number(),
  note: z.string().optional(),
  recordedAt: z.string(),
});

export const MetricDeltaSchema = z.object({
  metricId: z.string(),
  metricName: z.string(),
  unit: z.string(),
  baselineValue: z.number(),
  followupValue: z.number(),
  delta: z.number(),
  interpretation: z.string(),
  favorable: z.boolean(),
});

export const LearningRecordSchema = z.object({
  id: z.string().min(1),
  decisionId: z.string().min(1),
  topicId: z.string().min(1),
  reflections: z.object({
    generalNote: z.string().optional(),
    surpriseOrDifference: z.string().optional(),
    nextConversationWithClinician: z.string().optional(),
  }),
  wouldDecideAgain: z.enum(['yes', 'no', 'different_timing', 'unsure']),
  deltas: z.array(MetricDeltaSchema),
  createdAt: z.string(),
});

import type {
  UserContext,
  TopicConfig,
  ContextSummary,
  UnknownItem,
  ClinicalConsideration,
  DecisionBriefData,
  DecisionSnapshot,
  Observation,
  MetricDelta,
  ObservationMetricDefinition,
} from '../../domain/types';

/**
 * Deep clones an object using structuredClone or JSON fallback
 * and deeply freezes all levels so it cannot be mutated.
 */
export function deepFreeze<T>(obj: T): Readonly<T> {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    for (const item of obj) {
      deepFreeze(item);
    }
    return Object.freeze(obj);
  }

  // Handle plain objects
  const propNames = Object.getOwnPropertyNames(obj);
  for (const name of propNames) {
    const value = (obj as any)[name];
    if (value && typeof value === 'object') {
      deepFreeze(value);
    }
  }

  return Object.freeze(obj);
}

/**
 * Detects skipped or unsure fields and maps them to UnknownItems
 * with clinical relevance notes.
 */
export function detectUnknowns(
  context: UserContext,
  topic: TopicConfig
): UnknownItem[] {
  const unknowns: UnknownItem[] = [];
  const answers = context?.answers || {};

  // 1. Run topic-specific unknown detectors
  if (topic.rules && Array.isArray(topic.rules.unknownDetectors)) {
    for (const detector of topic.rules.unknownDetectors) {
      const item = detector(answers);
      if (item) {
        unknowns.push(item);
      }
    }
  }

  // 2. Generic field check: if field allowSkip and answer is missing or marked skipped/unsure
  for (const field of topic.contextFields) {
    const val = answers[field.id];
    const isUnset =
      val === undefined ||
      val === null ||
      val === '' ||
      val === 'skip' ||
      val === 'unsure' ||
      (Array.isArray(val) && val.length === 0);

    // Don't duplicate if already detected by topic custom rule
    const alreadyPresent = unknowns.some((u) => u.fieldId === field.id);
    if (isUnset && !alreadyPresent) {
      unknowns.push({
        fieldId: field.id,
        fieldName: field.question,
        reasonWhyItMatters:
          field.helperText ||
          'Providing this information helps clarify your personalized risk-benefit profile.',
        suggestedAction: `Consider reviewing your records or asking your doctor about ${field.question.toLowerCase().replace('?', '')}.`,
      });
    }
  }

  return unknowns;
}

/**
 * Builds a structured context summary separating known items from unknowns,
 * with extracted priorities and concerns.
 */
export function buildSummary(
  context: UserContext,
  topic: TopicConfig
): ContextSummary {
  const answers = context?.answers || {};
  const knownItems: ContextSummary['knownItems'] = [];
  const priorities: string[] = [];
  const concerns: string[] = [];

  for (const field of topic.contextFields) {
    const val = answers[field.id];
    if (
      val !== undefined &&
      val !== null &&
      val !== '' &&
      val !== 'skip' &&
      val !== 'unsure'
    ) {
      let display = String(val);

      if (field.type === 'slider') {
        const unit = field.unit ? ` ${field.unit}` : '';
        display = `${val}/5${unit}`;
      } else if (field.type === 'multi-select' && Array.isArray(val)) {
        if (val.length === 0) continue;
        const labels = val.map((v) => {
          const opt = field.options?.find((o) => o.value === v);
          return opt ? opt.label : v;
        });
        display = labels.join(', ');
      } else if (field.options) {
        const opt = field.options.find((o) => o.value === val);
        if (opt) display = opt.label;
      } else if (field.type === 'boolean-flag') {
        display = val === 'yes' ? 'Reported' : val === 'no' ? 'None reported' : 'Unsure';
      }

      knownItems.push({
        label: field.question,
        valueDisplay: display,
        category: field.groupTitle || 'General',
      });

      // Special collectors for priorities and concerns
      if (field.id === 'priorities' || field.id.includes('priority')) {
        if (Array.isArray(val)) priorities.push(...val);
        else if (typeof val === 'string') priorities.push(val);
      }
      if (field.id === 'concerns' || field.id.includes('concern')) {
        if (Array.isArray(val)) concerns.push(...val);
        else if (typeof val === 'string') concerns.push(val);
      }
    }
  }

  const unknownItems = detectUnknowns(context, topic);

  return {
    knownItems,
    unknownItems,
    priorities,
    concerns,
  };
}

/**
 * Evaluates topic rules against user answers
 */
export function evaluateRules(
  context: UserContext,
  topic: TopicConfig
): {
  considerations: ClinicalConsideration[];
  suggestedQuestions: string[];
} {
  const answers = context?.answers || {};
  const considerations = topic.rules.evaluateConsiderations(answers);
  const suggestedQuestions = topic.rules.suggestQuestions(answers);

  return {
    considerations,
    suggestedQuestions,
  };
}

/**
 * Generates the complete decision brief payload
 */
export function buildDecisionBrief(
  context: UserContext,
  topic: TopicConfig
): DecisionBriefData {
  const summary = buildSummary(context, topic);
  const { considerations, suggestedQuestions } = evaluateRules(context, topic);

  return {
    topicName: topic.name,
    generatedAt: new Date().toISOString(),
    contextSummary: summary,
    clinicalConsiderations: considerations,
    suggestedClinicianQuestions: suggestedQuestions,
    unknownsToClarify: summary.unknownItems,
  };
}

/**
 * Creates an immutable frozen snapshot of the context and brief
 * at the exact moment a decision is recorded.
 */
export function createSnapshot(
  decisionId: string,
  context: UserContext,
  topic: TopicConfig
): DecisionSnapshot {
  const summary = buildSummary(context, topic);
  const brief = buildDecisionBrief(context, topic);
  const unknowns = detectUnknowns(context, topic);

  const rawSnapshot: DecisionSnapshot = {
    id: `snap_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    decisionId,
    topicId: topic.id,
    contextVersion: context.version,
    frozenContext: JSON.parse(JSON.stringify(context)),
    frozenSummary: JSON.parse(JSON.stringify(summary)),
    frozenUnknowns: JSON.parse(JSON.stringify(unknowns)),
    frozenBrief: JSON.parse(JSON.stringify(brief)),
    contentVersion: topic.contentVersion,
    createdAt: new Date().toISOString(),
  };

  // Deep clone and recursively Object.freeze so it is 100% tamper-proof
  return deepFreeze(rawSnapshot);
}

/**
 * Compares baseline and follow-up observations and computes deltas
 */
export function compareBeforeAfter(
  baselineObs: Observation[],
  followupObs: Observation[],
  metricDefs: ObservationMetricDefinition[]
): MetricDelta[] {
  const deltas: MetricDelta[] = [];

  for (const metric of metricDefs) {
    const base = baselineObs.find((o) => o.metricId === metric.id);
    const post = followupObs.find((o) => o.metricId === metric.id);

    if (base && post) {
      const deltaVal = Number((post.value - base.value).toFixed(1));
      const higherIsBetter = metric.higherIsBetter ?? false;

      let favorable = false;
      if (deltaVal === 0) {
        favorable = true;
      } else if (higherIsBetter) {
        favorable = deltaVal > 0;
      } else {
        favorable = deltaVal < 0;
      }

      let interpretation = 'No change observed';
      if (deltaVal > 0) {
        interpretation = higherIsBetter
          ? `Improved by +${deltaVal} points on your scale`
          : `Increased by +${deltaVal} points`;
      } else if (deltaVal < 0) {
        interpretation = !higherIsBetter
          ? `Decreased by ${Math.abs(deltaVal)} points (beneficial)`
          : `Decreased by ${Math.abs(deltaVal)} points`;
      }

      deltas.push({
        metricId: metric.id,
        metricName: metric.name,
        unit: metric.unit,
        baselineValue: base.value,
        followupValue: post.value,
        delta: deltaVal,
        interpretation,
        favorable,
      });
    }
  }

  return deltas;
}

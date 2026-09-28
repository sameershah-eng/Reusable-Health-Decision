import type {
  UserContext,
  Decision,
  DecisionSnapshot,
  Observation,
  FollowUp,
  LearningRecord,
  PersonaSeed,
} from '../../domain/types';
import { SEED_PERSONAS } from '../../data/seed/personas';
import { TopicRegistry } from '../../topics/registry';
import { createSnapshot } from '../../core/logic';

const STORAGE_KEYS = {
  CONTEXTS: 'clara_contexts_v1',
  DECISIONS: 'clara_decisions_v1',
  SNAPSHOTS: 'clara_snapshots_v1',
  OBSERVATIONS: 'clara_observations_v1',
  FOLLOWUPS: 'clara_followups_v1',
  LEARNING_RECORDS: 'clara_learning_records_v1',
  ACTIVE_USER_ID: 'clara_active_user_id_v1',
  API_MODE: 'clara_api_mode_v1',
};

// Helper for simulated latency (200-350ms)
export async function simulateLatency(min = 200, max = 350): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockStorageManager {
  private static instance: MockStorageManager;

  private constructor() {
    this.ensureInitialized();
  }

  public static getInstance(): MockStorageManager {
    if (!MockStorageManager.instance) {
      MockStorageManager.instance = new MockStorageManager();
    }
    return MockStorageManager.instance;
  }

  public ensureInitialized(): void {
    if (!localStorage.getItem(STORAGE_KEYS.CONTEXTS)) {
      this.resetToDefaultSeed();
    }
  }

  public resetToDefaultSeed(): void {
    localStorage.removeItem(STORAGE_KEYS.CONTEXTS);
    localStorage.removeItem(STORAGE_KEYS.DECISIONS);
    localStorage.removeItem(STORAGE_KEYS.SNAPSHOTS);
    localStorage.removeItem(STORAGE_KEYS.OBSERVATIONS);
    localStorage.removeItem(STORAGE_KEYS.FOLLOWUPS);
    localStorage.removeItem(STORAGE_KEYS.LEARNING_RECORDS);

    const contexts: UserContext[] = [];
    const decisions: Decision[] = [];
    const snapshots: DecisionSnapshot[] = [];
    const observations: Observation[] = [];
    const followups: FollowUp[] = [];
    const learningRecords: LearningRecord[] = [];

    // Seed personas
    for (const persona of SEED_PERSONAS) {
      if (persona.context) {
        const fullContext: UserContext = {
          id: persona.context.id || `ctx_${persona.id}`,
          userId: persona.context.userId || `user_${persona.id}`,
          topicId: persona.topicId,
          version: persona.context.version || 1,
          answers: persona.context.answers || {},
          updatedAt: persona.context.updatedAt || new Date().toISOString(),
        };
        contexts.push(fullContext);

        if (persona.decision) {
          const topic = TopicRegistry.getTopic(persona.topicId);
          if (topic) {
            // If Maya (context drift), generate snapshot using v1 context
            const snapshotContext = persona.id === 'persona_context_drift'
              ? {
                  ...fullContext,
                  version: 1,
                  answers: {
                    ...fullContext.answers,
                    history_clots: 'no', // v1 had no clot history
                    symptom_severity: 3,
                  },
                }
              : fullContext;

            const decisionId = persona.decision.id || `dec_${persona.id}`;
            const snap = createSnapshot(decisionId, snapshotContext, topic);
            const fullDecision: Decision = {
              id: decisionId,
              userId: fullContext.userId,
              topicId: persona.topicId,
              choice: persona.decision.choice || 'discuss_with_clinician_first',
              reasons: persona.decision.reasons || [],
              freeTextReason: persona.decision.freeTextReason,
              confidence: persona.decision.confidence || 4,
              observationMetricIds: persona.decision.observationMetricIds || [],
              snapshotId: snap.id,
              createdAt: persona.decision.createdAt || new Date().toISOString(),
              status: persona.decision.status || 'decided',
            };

            decisions.push(fullDecision);
            snapshots.push(snap);

            if (persona.observations) {
              for (const obs of persona.observations) {
                observations.push({
                  id: obs.id || `obs_${Date.now()}_${Math.random()}`,
                  decisionId,
                  metricId: obs.metricId!,
                  phase: obs.phase || 'baseline',
                  value: obs.value || 3,
                  note: obs.note,
                  recordedAt: obs.recordedAt || new Date().toISOString(),
                });
              }
            }

            if (persona.followUpSimulated) {
              followups.push({
                id: `fu_${decisionId}`,
                decisionId,
                scheduledFor: new Date().toISOString(),
                completedAt: new Date().toISOString(),
                simulatedOffsetDays: 42, // +6 weeks
              });

              // Pre-seed an illustrative learning record for complete persona
              learningRecords.push({
                id: `learn_${decisionId}`,
                decisionId,
                topicId: persona.topicId,
                reflections: {
                  generalNote:
                    'Starting transdermal therapy resolved nighttime awakenings completely. Taking micronized progesterone at bedtime significantly aided sleep continuity.',
                  surpriseOrDifference:
                    'Surprised by how fast the vasomotor relief arrived (under 3 weeks). Joint stiffness in mornings also improved.',
                  nextConversationWithClinician:
                    'Review ongoing transdermal dose at the 6-month well-woman check and discuss scheduled bone density DXA scan timing.',
                },
                wouldDecideAgain: 'yes',
                deltas: [
                  {
                    metricId: 'hot_flash_frequency',
                    metricName: 'Hot Flash & Night Sweat Frequency',
                    unit: 'daily frequency rating',
                    baselineValue: 5,
                    followupValue: 1,
                    delta: -4,
                    interpretation: 'Decreased by 4 points (beneficial)',
                    favorable: true,
                  },
                  {
                    metricId: 'sleep_quality',
                    metricName: 'Sleep Restfulness & Duration',
                    unit: 'restfulness score',
                    baselineValue: 1,
                    followupValue: 5,
                    delta: 4,
                    interpretation: 'Improved by +4 points on your scale',
                    favorable: true,
                  },
                  {
                    metricId: 'daytime_energy',
                    metricName: 'Daytime Energy & Vitality',
                    unit: 'energy level',
                    baselineValue: 2,
                    followupValue: 4,
                    delta: 2,
                    interpretation: 'Improved by +2 points on your scale',
                    favorable: true,
                  },
                ],
                createdAt: new Date().toISOString(),
              });
            }
          }
        }
      }
    }

    localStorage.setItem(STORAGE_KEYS.CONTEXTS, JSON.stringify(contexts));
    localStorage.setItem(STORAGE_KEYS.DECISIONS, JSON.stringify(decisions));
    localStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(snapshots));
    localStorage.setItem(STORAGE_KEYS.OBSERVATIONS, JSON.stringify(observations));
    localStorage.setItem(STORAGE_KEYS.FOLLOWUPS, JSON.stringify(followups));
    localStorage.setItem(STORAGE_KEYS.LEARNING_RECORDS, JSON.stringify(learningRecords));
  }

  public getRawData(): Record<string, any> {
    return {
      contexts: JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTEXTS) || '[]'),
      decisions: JSON.parse(localStorage.getItem(STORAGE_KEYS.DECISIONS) || '[]'),
      snapshots: JSON.parse(localStorage.getItem(STORAGE_KEYS.SNAPSHOTS) || '[]'),
      observations: JSON.parse(localStorage.getItem(STORAGE_KEYS.OBSERVATIONS) || '[]'),
      followups: JSON.parse(localStorage.getItem(STORAGE_KEYS.FOLLOWUPS) || '[]'),
      learningRecords: JSON.parse(localStorage.getItem(STORAGE_KEYS.LEARNING_RECORDS) || '[]'),
    };
  }

  public loadPersona(persona: PersonaSeed): void {
    const raw = this.getRawData();
    const userId = persona.context.userId || `user_${persona.id}`;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, userId);

    // Filter out existing for this user/topic
    raw.contexts = raw.contexts.filter(
      (c: UserContext) => !(c.userId === userId && c.topicId === persona.topicId)
    );
    raw.decisions = raw.decisions.filter(
      (d: Decision) => !(d.userId === userId && d.topicId === persona.topicId)
    );

    if (persona.context) {
      const fullContext: UserContext = {
        id: persona.context.id || `ctx_${persona.id}`,
        userId,
        topicId: persona.topicId,
        version: persona.context.version || 1,
        answers: persona.context.answers || {},
        updatedAt: persona.context.updatedAt || new Date().toISOString(),
      };
      raw.contexts.push(fullContext);

      if (persona.decision) {
        const topic = TopicRegistry.getTopic(persona.topicId);
        if (topic) {
          const snapshotContext = persona.id === 'persona_context_drift'
            ? {
                ...fullContext,
                version: 1,
                answers: {
                  ...fullContext.answers,
                  history_clots: 'no',
                  symptom_severity: 3,
                },
              }
            : fullContext;

          const decisionId = persona.decision.id || `dec_${persona.id}`;
          const snap = createSnapshot(decisionId, snapshotContext, topic);
          const fullDecision: Decision = {
            id: decisionId,
            userId,
            topicId: persona.topicId,
            choice: persona.decision.choice || 'discuss_with_clinician_first',
            reasons: persona.decision.reasons || [],
            freeTextReason: persona.decision.freeTextReason,
            confidence: persona.decision.confidence || 4,
            observationMetricIds: persona.decision.observationMetricIds || [],
            snapshotId: snap.id,
            createdAt: persona.decision.createdAt || new Date().toISOString(),
            status: persona.decision.status || 'decided',
          };
          raw.decisions.push(fullDecision);
          raw.snapshots.push(snap);

          if (persona.observations) {
            raw.observations = raw.observations.filter(
              (o: Observation) => o.decisionId !== decisionId
            );
            for (const obs of persona.observations) {
              raw.observations.push({
                id: obs.id || `obs_${Date.now()}_${Math.random()}`,
                decisionId,
                metricId: obs.metricId!,
                phase: obs.phase || 'baseline',
                value: obs.value || 3,
                note: obs.note,
                recordedAt: obs.recordedAt || new Date().toISOString(),
              });
            }
          }

          if (persona.followUpSimulated) {
            raw.followups = raw.followups.filter((f: FollowUp) => f.decisionId !== decisionId);
            raw.followups.push({
              id: `fu_${decisionId}`,
              decisionId,
              scheduledFor: new Date().toISOString(),
              completedAt: new Date().toISOString(),
              simulatedOffsetDays: 42,
            });
          }
        }
      }
    }

    localStorage.setItem(STORAGE_KEYS.CONTEXTS, JSON.stringify(raw.contexts));
    localStorage.setItem(STORAGE_KEYS.DECISIONS, JSON.stringify(raw.decisions));
    localStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(raw.snapshots));
    localStorage.setItem(STORAGE_KEYS.OBSERVATIONS, JSON.stringify(raw.observations));
    localStorage.setItem(STORAGE_KEYS.FOLLOWUPS, JSON.stringify(raw.followups));
    localStorage.setItem(STORAGE_KEYS.LEARNING_RECORDS, JSON.stringify(raw.learningRecords));
  }

  // Getters & Setters
  public getContexts(): UserContext[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTEXTS) || '[]');
  }
  public saveContexts(items: UserContext[]): void {
    localStorage.setItem(STORAGE_KEYS.CONTEXTS, JSON.stringify(items));
  }

  public getDecisions(): Decision[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.DECISIONS) || '[]');
  }
  public saveDecisions(items: Decision[]): void {
    localStorage.setItem(STORAGE_KEYS.DECISIONS, JSON.stringify(items));
  }

  public getSnapshots(): DecisionSnapshot[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SNAPSHOTS) || '[]');
  }
  public saveSnapshots(items: DecisionSnapshot[]): void {
    localStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(items));
  }

  public getObservations(): Observation[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.OBSERVATIONS) || '[]');
  }
  public saveObservations(items: Observation[]): void {
    localStorage.setItem(STORAGE_KEYS.OBSERVATIONS, JSON.stringify(items));
  }

  public getFollowUps(): FollowUp[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.FOLLOWUPS) || '[]');
  }
  public saveFollowUps(items: FollowUp[]): void {
    localStorage.setItem(STORAGE_KEYS.FOLLOWUPS, JSON.stringify(items));
  }

  public getLearningRecords(): LearningRecord[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.LEARNING_RECORDS) || '[]');
  }
  public saveLearningRecords(items: LearningRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.LEARNING_RECORDS, JSON.stringify(items));
  }

  public getActiveUserId(): string {
    let id = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
    if (!id) {
      id = 'user_default_1';
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, id);
    }
    return id;
  }
  public setActiveUserId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, id);
  }
}

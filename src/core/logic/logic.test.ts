import { describe, it, expect } from 'vitest';
import {
  createSnapshot,
  detectUnknowns,
  evaluateRules,
  compareBeforeAfter,
  buildSummary,
} from './index';
import { hrtConfig } from '../../topics/hrt/config';
import type { UserContext, Observation } from '../../domain/types';

describe('Core Logic Engine Tests', () => {
  const sampleContext: UserContext = {
    id: 'ctx_test_1',
    userId: 'user_test_1',
    topicId: 'hrt',
    version: 1,
    answers: {
      age_range: '50_54',
      menopause_stage: 'perimenopause',
      main_symptoms: ['hot_flashes', 'sleep_disruption'],
      symptom_severity: 4,
      intact_uterus: 'yes',
      history_clots: 'no',
      history_breast_cancer: 'no',
      unexplained_bleeding: 'no',
      priorities: ['symptom_relief'],
      concerns: ['cancer_risk'],
    },
    updatedAt: '2026-09-28T10:00:00.000Z',
  };

  describe('createSnapshot', () => {
    it('creates an immutable frozen snapshot that does not mutate when context changes', () => {
      const liveContext: UserContext = JSON.parse(JSON.stringify(sampleContext));
      const snapshot = createSnapshot('dec_test_123', liveContext, hrtConfig);

      expect(snapshot).toBeDefined();
      expect(snapshot.decisionId).toBe('dec_test_123');
      expect(snapshot.contextVersion).toBe(1);
      expect(snapshot.frozenContext.answers.symptom_severity).toBe(4);

      // Mutate liveContext
      liveContext.version = 2;
      liveContext.answers.symptom_severity = 1;

      // Verify snapshot remains intact and completely unmutated
      expect(snapshot.contextVersion).toBe(1);
      expect(snapshot.frozenContext.answers.symptom_severity).toBe(4);

      // Verify frozen object immutability
      expect(Object.isFrozen(snapshot)).toBe(true);
      expect(Object.isFrozen(snapshot.frozenContext)).toBe(true);
      expect(Object.isFrozen(snapshot.frozenSummary)).toBe(true);
    });
  });

  describe('detectUnknowns', () => {
    it('detects skipped medical history flags and provides clinical relevance notes', () => {
      const incompleteContext: UserContext = {
        id: 'ctx_incomplete',
        userId: 'user_incomplete',
        topicId: 'hrt',
        version: 1,
        answers: {
          age_range: '50_54',
          intact_uterus: 'unsure', // Unsure flag
          history_clots: 'skip',   // Skipped flag
        },
        updatedAt: '2026-09-28T10:00:00.000Z',
      };

      const unknowns = detectUnknowns(incompleteContext, hrtConfig);

      expect(unknowns.length).toBeGreaterThan(0);
      const uterusUnknown = unknowns.find((u) => u.fieldId === 'intact_uterus');
      expect(uterusUnknown).toBeDefined();
      expect(uterusUnknown?.reasonWhyItMatters).toContain('progesterone');

      const clotUnknown = unknowns.find((u) => u.fieldId === 'history_clots');
      expect(clotUnknown).toBeDefined();
      expect(clotUnknown?.reasonWhyItMatters).toContain('transdermal');
    });
  });

  describe('evaluateRules', () => {
    it('evaluates clinical considerations based on intact uterus and clot history', () => {
      const contextWithFlags: UserContext = {
        id: 'ctx_flags',
        userId: 'user_flags',
        topicId: 'hrt',
        version: 1,
        answers: {
          intact_uterus: 'yes',
          history_clots: 'yes',
          symptom_severity: 5,
        },
        updatedAt: '2026-09-28T10:00:00.000Z',
      };

      const { considerations, suggestedQuestions } = evaluateRules(
        contextWithFlags,
        hrtConfig
      );

      // Should recommend endometrial protection
      const uterusRule = considerations.find((c) => c.id === 'c_uterus_protection');
      expect(uterusRule).toBeDefined();
      expect(uterusRule?.severity).toBe('priority');

      // Should recommend transdermal route
      const clotRule = considerations.find((c) => c.id === 'c_transdermal_preference');
      expect(clotRule).toBeDefined();

      // Should provide questions to ask clinician
      expect(suggestedQuestions.length).toBeGreaterThan(0);
      expect(suggestedQuestions.some((q) => q.includes('transdermal'))).toBe(true);
    });
  });

  describe('compareBeforeAfter', () => {
    it('computes metric deltas and handles higherIsBetter polarity correctly', () => {
      const baselines: Observation[] = [
        {
          id: 'obs_1',
          decisionId: 'dec_1',
          metricId: 'hot_flash_frequency',
          phase: 'baseline',
          value: 5,
          recordedAt: '2026-08-01T00:00:00.000Z',
        },
        {
          id: 'obs_2',
          decisionId: 'dec_1',
          metricId: 'sleep_quality',
          phase: 'baseline',
          value: 1,
          recordedAt: '2026-08-01T00:00:00.000Z',
        },
      ];

      const followups: Observation[] = [
        {
          id: 'obs_3',
          decisionId: 'dec_1',
          metricId: 'hot_flash_frequency',
          phase: 'followup',
          value: 2, // decreased by 3 (beneficial for hot flashes where lower is better)
          recordedAt: '2026-09-12T00:00:00.000Z',
        },
        {
          id: 'obs_4',
          decisionId: 'dec_1',
          metricId: 'sleep_quality',
          phase: 'followup',
          value: 4, // increased by 3 (beneficial for sleep quality where higher is better)
          recordedAt: '2026-09-12T00:00:00.000Z',
        },
      ];

      const deltas = compareBeforeAfter(baselines, followups, hrtConfig.observationMetrics);

      expect(deltas.length).toBe(2);

      const hotFlashDelta = deltas.find((d) => d.metricId === 'hot_flash_frequency');
      expect(hotFlashDelta).toBeDefined();
      expect(hotFlashDelta?.delta).toBe(-3);
      expect(hotFlashDelta?.favorable).toBe(true); // lower hot flash is favorable!

      const sleepDelta = deltas.find((d) => d.metricId === 'sleep_quality');
      expect(sleepDelta).toBeDefined();
      expect(sleepDelta?.delta).toBe(3);
      expect(sleepDelta?.favorable).toBe(true); // higher sleep quality is favorable!
    });
  });
});

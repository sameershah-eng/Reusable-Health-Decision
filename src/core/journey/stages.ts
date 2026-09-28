import type { StageDefinition, StageId } from '../../domain/types';

export const JOURNEY_STAGES: StageDefinition[] = [
  {
    id: 'context',
    label: 'Context',
    order: 1,
    shortDescription: 'Share your background & current experience',
  },
  {
    id: 'understand',
    label: 'Understand',
    order: 2,
    shortDescription: 'Explore evidence, your priorities & real stories',
  },
  {
    id: 'decision',
    label: 'Decision',
    order: 3,
    shortDescription: 'Review your brief, record your choice & metrics',
  },
  {
    id: 'observe',
    label: 'Observe',
    order: 4,
    shortDescription: 'Track how you feel & simulate follow-up',
  },
  {
    id: 'learn',
    label: 'Learn',
    order: 5,
    shortDescription: 'Compare outcomes & reflect on your path',
  },
];

export function getStageByIndex(index: number): StageDefinition | undefined {
  return JOURNEY_STAGES[index];
}

export function getStageById(id: StageId): StageDefinition | undefined {
  return JOURNEY_STAGES.find((s) => s.id === id);
}

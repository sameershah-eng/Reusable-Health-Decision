import type { Services } from '../interfaces';
import { MockContextService } from './mockContextService';
import { MockDecisionService } from './mockDecisionService';
import { MockContentService } from './mockContentService';
import { MockObservationService } from './mockObservationService';
import { MockLearningService } from './mockLearningService';

export function createMockServices(): Services {
  return {
    context: new MockContextService(),
    decision: new MockDecisionService(),
    content: new MockContentService(),
    observation: new MockObservationService(),
    learning: new MockLearningService(),
  };
}

export * from './mockStorage';

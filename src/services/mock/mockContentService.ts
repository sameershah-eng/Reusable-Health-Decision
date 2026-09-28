import type { IContentService } from '../interfaces';
import type { EvidenceItem, ExperienceStory } from '../../domain/types';
import { TopicRegistry } from '../../topics/registry';
import { simulateLatency } from './mockStorage';

export class MockContentService implements IContentService {
  public async getEvidence(topicId: string): Promise<EvidenceItem[]> {
    await simulateLatency(100, 200);
    return TopicRegistry.getTopicEvidence(topicId);
  }

  public async getStories(topicId: string): Promise<ExperienceStory[]> {
    await simulateLatency(100, 200);
    return TopicRegistry.getTopicStories(topicId);
  }
}

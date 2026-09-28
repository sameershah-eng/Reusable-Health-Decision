import type { TopicConfig, EvidenceItem, ExperienceStory } from '../domain/types';
import { hrtConfig, hrtEvidence, hrtStories } from './hrt';
import { thermageConfig, thermageEvidence, thermageStories } from './thermage';

class Registry {
  private topics: Map<string, TopicConfig> = new Map();
  private evidence: Map<string, EvidenceItem[]> = new Map();
  private stories: Map<string, ExperienceStory[]> = new Map();

  constructor() {
    this.registerTopic(hrtConfig, hrtEvidence, hrtStories);
    this.registerTopic(thermageConfig, thermageEvidence, thermageStories);
  }

  public registerTopic(
    config: TopicConfig,
    evidenceItems: EvidenceItem[] = [],
    experienceStories: ExperienceStory[] = []
  ): void {
    this.topics.set(config.id, config);
    this.evidence.set(config.id, evidenceItems);
    this.stories.set(config.id, experienceStories);
  }

  public getTopic(id: string): TopicConfig | undefined {
    return this.topics.get(id);
  }

  public getTopicEvidence(id: string): EvidenceItem[] {
    return this.evidence.get(id) || [];
  }

  public getTopicStories(id: string): ExperienceStory[] {
    return this.stories.get(id) || [];
  }

  public listTopics(): TopicConfig[] {
    return Array.from(this.topics.values());
  }
}

export const TopicRegistry = new Registry();

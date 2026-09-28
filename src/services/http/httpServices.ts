import type {
  Services,
  IContextService,
  IDecisionService,
  IContentService,
  IObservationService,
  ILearningService,
} from '../interfaces';
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
} from '../../domain/types';

const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error ${res.status}: ${errorText || res.statusText}`);
  }

  return res.json();
}

export class HttpContextService implements IContextService {
  public async getContext(topicId: string, userId: string): Promise<UserContext> {
    return fetchJson<UserContext>(`/contexts/${topicId}?userId=${encodeURIComponent(userId)}`);
  }

  public async saveAnswers(
    topicId: string,
    userId: string,
    answers: Record<string, any>
  ): Promise<UserContext> {
    return fetchJson<UserContext>(`/contexts/${topicId}`, {
      method: 'POST',
      body: JSON.stringify({ userId, answers }),
    });
  }

  public async resetContext(topicId: string, userId: string): Promise<UserContext> {
    return fetchJson<UserContext>(`/contexts/${topicId}/reset`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }
}

export class HttpDecisionService implements IDecisionService {
  public async getDecision(topicId: string, userId: string): Promise<Decision | null> {
    try {
      return await fetchJson<Decision>(`/decisions/${topicId}?userId=${encodeURIComponent(userId)}`);
    } catch {
      return null;
    }
  }

  public async saveDecision(
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
  ): Promise<{ decision: Decision; snapshot: DecisionSnapshot }> {
    return fetchJson<{ decision: Decision; snapshot: DecisionSnapshot }>('/decisions', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        contextSnapshotInputs: {
          contextVersion: context.version,
          contentVersion: topic.contentVersion,
        },
      }),
    });
  }

  public async getSnapshot(snapshotId: string): Promise<DecisionSnapshot | null> {
    return fetchJson<DecisionSnapshot>(`/snapshots/${snapshotId}`);
  }

  public async listDecisionHistory(
    userId: string
  ): Promise<Array<{ decision: Decision; snapshot: DecisionSnapshot }>> {
    return fetchJson<Array<{ decision: Decision; snapshot: DecisionSnapshot }>>(
      `/decisions/history?userId=${encodeURIComponent(userId)}`
    );
  }

  public async deleteDecision(decisionId: string): Promise<void> {
    await fetchJson(`/decisions/${decisionId}`, { method: 'DELETE' });
  }
}

export class HttpContentService implements IContentService {
  public async getEvidence(topicId: string): Promise<EvidenceItem[]> {
    return fetchJson<EvidenceItem[]>(`/topics/${topicId}/evidence`);
  }

  public async getStories(topicId: string): Promise<ExperienceStory[]> {
    return fetchJson<ExperienceStory[]>(`/topics/${topicId}/stories`);
  }
}

export class HttpObservationService implements IObservationService {
  public async getObservations(decisionId: string): Promise<Observation[]> {
    return fetchJson<Observation[]>(`/decisions/${decisionId}/observations`);
  }

  public async recordObservations(
    decisionId: string,
    observations: Array<Omit<Observation, 'id' | 'recordedAt'>>
  ): Promise<Observation[]> {
    return fetchJson<Observation[]>(`/decisions/${decisionId}/observations`, {
      method: 'POST',
      body: JSON.stringify({ observations }),
    });
  }

  public async simulateFollowUp(decisionId: string, daysAhead = 42): Promise<FollowUp> {
    return fetchJson<FollowUp>(`/decisions/${decisionId}/simulate-followup`, {
      method: 'POST',
      body: JSON.stringify({ daysAhead }),
    });
  }

  public async getFollowUp(decisionId: string): Promise<FollowUp | null> {
    try {
      return await fetchJson<FollowUp>(`/decisions/${decisionId}/followup`);
    } catch {
      return null;
    }
  }
}

export class HttpLearningService implements ILearningService {
  public async getLearningRecord(decisionId: string): Promise<LearningRecord | null> {
    try {
      return await fetchJson<LearningRecord>(`/decisions/${decisionId}/learning`);
    } catch {
      return null;
    }
  }

  public async saveLearningRecord(
    record: Omit<LearningRecord, 'id' | 'createdAt'>
  ): Promise<LearningRecord> {
    return fetchJson<LearningRecord>(`/decisions/${record.decisionId}/learning`, {
      method: 'POST',
      body: JSON.stringify(record),
    });
  }
}

export function createHttpServices(): Services {
  return {
    context: new HttpContextService(),
    decision: new HttpDecisionService(),
    content: new HttpContentService(),
    observation: new HttpObservationService(),
    learning: new HttpLearningService(),
  };
}

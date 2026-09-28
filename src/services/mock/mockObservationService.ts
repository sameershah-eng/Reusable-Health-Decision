import type { IObservationService } from '../interfaces';
import type { Observation, FollowUp } from '../../domain/types';
import { MockStorageManager, simulateLatency } from './mockStorage';

export class MockObservationService implements IObservationService {
  private storage = MockStorageManager.getInstance();

  public async getObservations(decisionId: string): Promise<Observation[]> {
    await simulateLatency(150, 250);
    const observations = this.storage.getObservations();
    return observations.filter((o) => o.decisionId === decisionId);
  }

  public async recordObservations(
    decisionId: string,
    newObs: Array<Omit<Observation, 'id' | 'recordedAt'>>
  ): Promise<Observation[]> {
    await simulateLatency(200, 300);
    const observations = this.storage.getObservations();

    const createdList: Observation[] = [];
    for (const item of newObs) {
      // Replace existing observation for same metric and phase if present
      const existingIdx = observations.findIndex(
        (o) => o.decisionId === decisionId && o.metricId === item.metricId && o.phase === item.phase
      );

      const entry: Observation = {
        id: `obs_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        decisionId,
        metricId: item.metricId,
        phase: item.phase,
        value: item.value,
        note: item.note,
        recordedAt: new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        observations[existingIdx] = entry;
      } else {
        observations.push(entry);
      }
      createdList.push(entry);
    }

    this.storage.saveObservations(observations);
    return createdList;
  }

  public async simulateFollowUp(decisionId: string, daysAhead = 42): Promise<FollowUp> {
    await simulateLatency(250, 400);
    const followups = this.storage.getFollowUps();

    // Advance clock simulation
    const simulatedDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString();

    const existingIdx = followups.findIndex((f) => f.decisionId === decisionId);
    const followUp: FollowUp = {
      id: `fu_${decisionId}`,
      decisionId,
      scheduledFor: new Date().toISOString(),
      completedAt: simulatedDate,
      simulatedOffsetDays: daysAhead,
    };

    if (existingIdx >= 0) {
      followups[existingIdx] = followUp;
    } else {
      followups.push(followUp);
    }

    this.storage.saveFollowUps(followups);
    return followUp;
  }

  public async getFollowUp(decisionId: string): Promise<FollowUp | null> {
    await simulateLatency(100, 200);
    const followups = this.storage.getFollowUps();
    const fu = followups.find((f) => f.decisionId === decisionId);
    return fu ? JSON.parse(JSON.stringify(fu)) : null;
  }
}

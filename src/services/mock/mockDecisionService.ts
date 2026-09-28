import type { IDecisionService } from '../interfaces';
import type {
  Decision,
  DecisionSnapshot,
  UserContext,
  TopicConfig,
} from '../../domain/types';
import { MockStorageManager, simulateLatency } from './mockStorage';
import { createSnapshot } from '../../core/logic';

export class MockDecisionService implements IDecisionService {
  private storage = MockStorageManager.getInstance();

  public async getDecision(topicId: string, userId: string): Promise<Decision | null> {
    await simulateLatency(150, 250);
    const decisions = this.storage.getDecisions();
    const dec = decisions.find((d) => d.topicId === topicId && d.userId === userId);
    return dec ? JSON.parse(JSON.stringify(dec)) : null;
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
    await simulateLatency(250, 400);

    const decisions = this.storage.getDecisions();
    const snapshots = this.storage.getSnapshots();

    const decisionId = `dec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    // Generate immutable frozen snapshot
    const snapshot = createSnapshot(decisionId, context, topic);

    const decision: Decision = {
      id: decisionId,
      userId: payload.userId,
      topicId: payload.topicId,
      choice: payload.choice,
      reasons: payload.reasons,
      freeTextReason: payload.freeTextReason,
      confidence: payload.confidence,
      observationMetricIds: payload.observationMetricIds,
      snapshotId: snapshot.id,
      createdAt: new Date().toISOString(),
      status: 'decided',
    };

    // Remove any previous decision for this user & topic to maintain single active decision
    const filteredDecisions = decisions.filter(
      (d) => !(d.userId === payload.userId && d.topicId === payload.topicId)
    );
    filteredDecisions.push(decision);

    snapshots.push(snapshot);

    this.storage.saveDecisions(filteredDecisions);
    this.storage.saveSnapshots(snapshots);

    return {
      decision: JSON.parse(JSON.stringify(decision)),
      snapshot: JSON.parse(JSON.stringify(snapshot)),
    };
  }

  public async getSnapshot(snapshotId: string): Promise<DecisionSnapshot | null> {
    await simulateLatency(100, 200);
    const snapshots = this.storage.getSnapshots();
    const snap = snapshots.find((s) => s.id === snapshotId);
    return snap ? JSON.parse(JSON.stringify(snap)) : null;
  }

  public async listDecisionHistory(
    userId: string
  ): Promise<Array<{ decision: Decision; snapshot: DecisionSnapshot }>> {
    await simulateLatency(200, 300);
    const decisions = this.storage.getDecisions().filter((d) => d.userId === userId);
    const snapshots = this.storage.getSnapshots();

    const list: Array<{ decision: Decision; snapshot: DecisionSnapshot }> = [];
    for (const d of decisions) {
      const snap = snapshots.find((s) => s.id === d.snapshotId);
      if (snap) {
        list.push({
          decision: JSON.parse(JSON.stringify(d)),
          snapshot: JSON.parse(JSON.stringify(snap)),
        });
      }
    }

    return list.sort(
      (a, b) => new Date(b.decision.createdAt).getTime() - new Date(a.decision.createdAt).getTime()
    );
  }

  public async deleteDecision(decisionId: string): Promise<void> {
    await simulateLatency(150, 250);
    const decisions = this.storage.getDecisions().filter((d) => d.id !== decisionId);
    this.storage.saveDecisions(decisions);
  }
}

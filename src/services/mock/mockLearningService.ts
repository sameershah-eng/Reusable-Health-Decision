import type { ILearningService } from '../interfaces';
import type { LearningRecord } from '../../domain/types';
import { MockStorageManager, simulateLatency } from './mockStorage';

export class MockLearningService implements ILearningService {
  private storage = MockStorageManager.getInstance();

  public async getLearningRecord(decisionId: string): Promise<LearningRecord | null> {
    await simulateLatency(150, 250);
    const records = this.storage.getLearningRecords();
    const rec = records.find((r) => r.decisionId === decisionId);
    return rec ? JSON.parse(JSON.stringify(rec)) : null;
  }

  public async saveLearningRecord(
    recordData: Omit<LearningRecord, 'id' | 'createdAt'>
  ): Promise<LearningRecord> {
    await simulateLatency(200, 350);
    const records = this.storage.getLearningRecords();

    const existingIdx = records.findIndex((r) => r.decisionId === recordData.decisionId);
    const fullRecord: LearningRecord = {
      ...recordData,
      id: `learn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      records[existingIdx] = fullRecord;
    } else {
      records.push(fullRecord);
    }

    this.storage.saveLearningRecords(records);
    return fullRecord;
  }
}

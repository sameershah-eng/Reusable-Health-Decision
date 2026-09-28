import type { IContextService } from '../interfaces';
import type { UserContext } from '../../domain/types';
import { MockStorageManager, simulateLatency } from './mockStorage';

export class MockContextService implements IContextService {
  private storage = MockStorageManager.getInstance();

  public async getContext(topicId: string, userId: string): Promise<UserContext> {
    await simulateLatency(150, 250);
    const contexts = this.storage.getContexts();
    let ctx = contexts.find((c) => c.topicId === topicId && c.userId === userId);

    if (!ctx) {
      // Create empty initial context with version 1
      ctx = {
        id: `ctx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        userId,
        topicId,
        version: 1,
        answers: {},
        updatedAt: new Date().toISOString(),
      };
      contexts.push(ctx);
      this.storage.saveContexts(contexts);
    }

    return JSON.parse(JSON.stringify(ctx));
  }

  public async saveAnswers(
    topicId: string,
    userId: string,
    answers: Record<string, any>
  ): Promise<UserContext> {
    await simulateLatency(200, 350);
    const contexts = this.storage.getContexts();
    let existingIndex = contexts.findIndex(
      (c) => c.topicId === topicId && c.userId === userId
    );

    let updatedContext: UserContext;

    if (existingIndex >= 0) {
      const prev = contexts[existingIndex];
      // Increment version if answers changed!
      const answersChanged = JSON.stringify(prev.answers) !== JSON.stringify(answers);
      const newVersion = answersChanged ? prev.version + 1 : prev.version;

      updatedContext = {
        ...prev,
        answers: { ...prev.answers, ...answers },
        version: newVersion,
        updatedAt: new Date().toISOString(),
      };
      contexts[existingIndex] = updatedContext;
    } else {
      updatedContext = {
        id: `ctx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        userId,
        topicId,
        version: 1,
        answers,
        updatedAt: new Date().toISOString(),
      };
      contexts.push(updatedContext);
    }

    this.storage.saveContexts(contexts);
    return JSON.parse(JSON.stringify(updatedContext));
  }

  public async resetContext(topicId: string, userId: string): Promise<UserContext> {
    await simulateLatency(150, 250);
    const contexts = this.storage.getContexts();
    const existingIndex = contexts.findIndex(
      (c) => c.topicId === topicId && c.userId === userId
    );

    const emptyContext: UserContext = {
      id: `ctx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId,
      topicId,
      version: 1,
      answers: {},
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      contexts[existingIndex] = emptyContext;
    } else {
      contexts.push(emptyContext);
    }

    this.storage.saveContexts(contexts);
    return emptyContext;
  }
}

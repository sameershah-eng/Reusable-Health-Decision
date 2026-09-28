import type { Services } from './interfaces';
import { createMockServices, MockStorageManager } from './mock';
import { createHttpServices } from './http';

export type ApiMode = 'mock' | 'http';

let currentApiMode: ApiMode =
  ((import.meta as any).env?.VITE_API_MODE as ApiMode) ||
  (localStorage.getItem('clara_api_mode_v1') as ApiMode) ||
  'mock';

let currentServices: Services =
  currentApiMode === 'http' ? createHttpServices() : createMockServices();

export function getApiMode(): ApiMode {
  return currentApiMode;
}

export function setApiMode(mode: ApiMode): void {
  currentApiMode = mode;
  localStorage.setItem('clara_api_mode_v1', mode);
  currentServices = mode === 'http' ? createHttpServices() : createMockServices();
}

export const services: Services = new Proxy({} as Services, {
  get(_target, prop: keyof Services) {
    return currentServices[prop];
  },
});

export * from './interfaces';
export { MockStorageManager } from './mock';

import { create } from 'zustand';
import { getApiMode, setApiMode, type ApiMode } from '../services';

interface ToastNotice {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
}

interface UIState {
  demoDrawerOpen: boolean;
  setDemoDrawerOpen: (open: boolean) => void;
  printModalOpen: boolean;
  setPrintModalOpen: (open: boolean) => void;
  apiMode: ApiMode;
  toggleApiMode: () => void;
  toast: ToastNotice | null;
  showToast: (message: string, type?: 'info' | 'success' | 'warning') => void;
  clearToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  demoDrawerOpen: false,
  setDemoDrawerOpen: (open: boolean) => set({ demoDrawerOpen: open }),
  printModalOpen: false,
  setPrintModalOpen: (open: boolean) => set({ printModalOpen: open }),
  apiMode: getApiMode(),
  toggleApiMode: () => {
    const current = getApiMode();
    const next: ApiMode = current === 'mock' ? 'http' : 'mock';
    setApiMode(next);
    set({ apiMode: next });
  },
  toast: null,
  showToast: (message: string, type = 'info') => {
    const id = Math.random().toString(36).slice(2, 7);
    set({ toast: { id, message, type } });
    setTimeout(() => {
      set((state) => (state.toast?.id === id ? { toast: null } : state));
    }, 4000);
  },
  clearToast: () => set({ toast: null }),
}));

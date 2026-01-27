import { create } from 'zustand';
import type { ConfigEntry } from '../types';

interface AppState {
  pingResult: string;
  config: Record<string, ConfigEntry>;
  ping: () => Promise<void>;
  loadTemplateName: () => Promise<void>;
  saveConfig: (key: string, value: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  pingResult: '',
  config: {},
  ping: async () => {
    if (!window.appBridge) return;
    const result = await window.appBridge.ping();
    set({ pingResult: result });
  },
  loadTemplateName: async () => {
    if (!window.appBridge) return;
    const entry = await window.appBridge.getConfig('templateName');
    if (!entry) return;
    set((state) => ({ config: { ...state.config, [entry.key]: entry } }));
  },
  saveConfig: async (key: string, value: string) => {
    if (!window.appBridge) return;
    const entry = await window.appBridge.setConfig(key, value);
    set((state) => ({ config: { ...state.config, [entry.key]: entry } }));
  },
}));


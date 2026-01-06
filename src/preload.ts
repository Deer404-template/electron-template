import { contextBridge, ipcRenderer } from 'electron';
import type { AppBridge, ConfigEntry } from './types';

const appBridge: AppBridge = {
  async ping() {
    return ipcRenderer.invoke('app:ping');
  },
  async getConfig(key: string): Promise<ConfigEntry | null> {
    return ipcRenderer.invoke('config:get', key);
  },
  async setConfig(key: string, value: string): Promise<ConfigEntry> {
    return ipcRenderer.invoke('config:set', { key, value });
  },
};

contextBridge.exposeInMainWorld('appBridge', appBridge);

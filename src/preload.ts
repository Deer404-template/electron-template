import { contextBridge, ipcRenderer } from 'electron';
import type { AppBridge, ConfigEntry } from './types';

const appBridge: AppBridge = {
  platform: process.platform,
  async ping() {
    return ipcRenderer.invoke('app:ping');
  },
  async getConfig(key: string): Promise<ConfigEntry | null> {
    return ipcRenderer.invoke('config:get', key);
  },
  async setConfig(key: string, value: string): Promise<ConfigEntry> {
    return ipcRenderer.invoke('config:set', { key, value });
  },
  onWindowMaximizedChanged(listener) {
    ipcRenderer.on('window:maximized-changed', (_event, value) => {
      listener(Boolean(value));
    });
  },
  async windowMinimize(): Promise<void> {
    await ipcRenderer.invoke('window:minimize');
  },
  async windowToggleMaximize(): Promise<boolean> {
    return ipcRenderer.invoke('window:toggle-maximize');
  },
  async windowIsMaximized(): Promise<boolean> {
    return ipcRenderer.invoke('window:is-maximized');
  },
  async windowClose(): Promise<void> {
    await ipcRenderer.invoke('window:close');
  },
};

contextBridge.exposeInMainWorld('appBridge', appBridge);

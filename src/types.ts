export interface ConfigEntry {
  key: string;
  value: string;
  updatedAt: number;
}

export interface AppBridge {
  ping: () => Promise<string>;
  getConfig: (key: string) => Promise<ConfigEntry | null>;
  setConfig: (key: string, value: string) => Promise<ConfigEntry>;
}

export interface TemplateFeature {
  title: string;
  description: string;
  tone: 'core' | 'stack' | 'ops';
}

declare global {
  interface Window {
    appBridge?: AppBridge;
  }
}

export interface ConfigEntry {
  key: string;
  value: string;
  updatedAt: number;
}

export interface AppBridge {
  platform: NodeJS.Platform;
  ping: () => Promise<string>;
  getConfig: (key: string) => Promise<ConfigEntry | null>;
  setConfig: (key: string, value: string) => Promise<ConfigEntry>;
  onWindowMaximizedChanged: (listener: (isMaximized: boolean) => void) => () => void;
  windowMinimize: () => Promise<void>;
  windowToggleMaximize: () => Promise<boolean>;
  windowIsMaximized: () => Promise<boolean>;
  windowClose: () => Promise<void>;
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

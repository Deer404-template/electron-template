import { useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { create } from 'zustand';
import type { ConfigEntry, TemplateFeature } from '../types';

interface ConfigState {
  config: Record<string, ConfigEntry>;
  load: () => Promise<void>;
  save: (key: string, value: string) => Promise<void>;
}

export const Route = createFileRoute('/')({
  component: WelcomePage,
});

const FEATURES: TemplateFeature[] = [
  {
    title: 'Electron + Vite + TS',
    description: '已配置主进程/预加载/渲染进程的Vite构建，开箱即用。',
    tone: 'core',
  },
  {
    title: 'SQLite 数据层',
    description: '内置 better-sqlite3 示例，演示配置存储和 IPC 调用。',
    tone: 'stack',
  },
  {
    title: 'Zustand 状态管理',
    description: '轻量全局状态示例，方便拓展业务数据流。',
    tone: 'stack',
  },
  {
    title: '模板化起步',
    description: '作为新项目脚手架，复制即可开始编码。',
    tone: 'core',
  },
  {
    title: '可扩展 IPC 桥接',
    description: '通过 preload 暴露 API，保障安全隔离。',
    tone: 'ops',
  },
];

const useConfigStore = create<ConfigState>((set) => ({
  config: {},
  load: async () => {
    if (!window.appBridge) return;
    const entry = await window.appBridge.getConfig('templateName');
    if (entry) {
      set((state) => ({ config: { ...state.config, [entry.key]: entry } }));
    }
  },
  save: async (key: string, value: string) => {
    if (!window.appBridge) return;
    const entry = await window.appBridge.setConfig(key, value);
    set((state) => ({ config: { ...state.config, [entry.key]: entry } }));
  },
}));

function WelcomePage() {
  const [projectName, setProjectName] = useState('My Electron App');
  const [pingResult, setPingResult] = useState('');
  const { config, load, save } = useConfigStore();

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const init = async () => {
      if (!window.appBridge) return;
      const result = await window.appBridge.ping();
      setPingResult(result);
    };
    void init();
  }, []);

  const handleSave = async () => {
    await save('templateName', projectName);
  };

  const savedName = config.templateName?.value || '未设置';
  const savedTime = config.templateName?.updatedAt
    ? new Date(config.templateName.updatedAt).toLocaleString()
    : '未写入';

  return (
    <div className="welcome-page">
      <header className="hero">
        <p className="eyebrow">Electron Forge 模板</p>
        <h1>欢迎使用 Electron + Vite + TS 模板</h1>
        <p className="lede">
          这里是你下一个桌面应用的起点，已预置常用架构、状态管理与数据层示例，直接复制即可开干。
        </p>
        <div className="cta-row">
          <button className="primary-btn" type="button" onClick={handleSave}>
            保存模板名称
          </button>
          <button
            className="secondary-btn"
            type="button"
            onClick={() => setProjectName('My Electron App')}
          >
            重置示例
          </button>
        </div>
      </header>

      <section className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">快速检查</p>
            <h2>运行状态与配置</h2>
          </div>
          <div className="badge">dev helper</div>
        </div>
        <div className="grid">
          <div className="card">
            <p className="card-title">Ping 主进程</p>
            <p className="card-body">{pingResult || '等待返回...'}</p>
          </div>
          <div className="card">
            <p className="card-title">模板名称</p>
            <p className="card-body">{savedName}</p>
            <p className="card-foot">写入时间：{savedTime}</p>
          </div>
          <div className="card">
            <p className="card-title">当前输入</p>
            <input
              className="input"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="输入项目名称"
            />
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">内置能力</p>
            <h2>模板亮点</h2>
          </div>
        </div>
        <div className="feature-grid">
          {FEATURES.map((item) => (
            <div key={item.title} className={`feature-card tone-${item.tone}`}>
              <p className="feature-title">{item.title}</p>
              <p className="feature-desc">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

import { createFileRoute } from '@tanstack/react-router';
import type { TemplateFeature } from '../types';

export const Route = createFileRoute('/features')({
  component: FeaturesPage,
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

function FeaturesPage() {
  return (
    <section className="section">
      <div className="section-head">
        <h1 className="section-title">模板能力</h1>
        <p className="section-desc">把这些能力当作你新应用的“默认骨架”。</p>
      </div>

      <div className="feature-grid">
        {FEATURES.map((item) => (
          <div key={item.title} className={`feature tone-${item.tone}`}>
            <p className="feature-title">{item.title}</p>
            <p className="feature-desc">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}


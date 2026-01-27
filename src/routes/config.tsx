import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useAppStore } from '../stores/appStore';

export const Route = createFileRoute('/config')({
  component: ConfigPage,
});

function ConfigPage() {
  const templateNameEntry = useAppStore((state) => state.config.templateName);
  const saveConfig = useAppStore((state) => state.saveConfig);

  const savedName = templateNameEntry?.value || '未设置';
  const savedTime = templateNameEntry?.updatedAt
    ? new Date(templateNameEntry.updatedAt).toLocaleString()
    : '未写入';

  const [projectName, setProjectName] = useState(templateNameEntry?.value || 'My Electron App');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (dirty) return;
    setProjectName(templateNameEntry?.value || 'My Electron App');
  }, [dirty, templateNameEntry?.value]);

  const handleSave = async () => {
    await saveConfig('templateName', projectName);
    setDirty(false);
  };

  const handleReset = () => {
    setProjectName('My Electron App');
    setDirty(true);
  };

  return (
    <section className="section">
      <div className="section-head">
        <h1 className="section-title">配置</h1>
        <p className="section-desc">
          演示：渲染进程 {'->'} preload {'->'} 主进程 SQLite。
        </p>
      </div>

      <div className="split">
        <div className="card">
          <div className="card-head">
            <p className="card-title">模板名称</p>
            <span className="chip chip-muted">config:key</span>
          </div>

          <label className="field">
            <span className="field-label">templateName</span>
            <input
              className="input"
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value);
                setDirty(true);
              }}
              placeholder="输入项目名称"
            />
          </label>

          <div className="field-actions">
            <button className="btn btn-primary" type="button" onClick={handleSave}>
              保存到 SQLite
            </button>
            <button className="btn btn-ghost" type="button" onClick={handleReset}>
              重置示例
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <p className="card-title">当前存储</p>
            <span className="chip chip-muted">readonly</span>
          </div>
          <div className="kv">
            <div className="kv-row">
              <p className="kv-k">value</p>
              <p className="kv-v">{savedName}</p>
            </div>
            <div className="kv-row">
              <p className="kv-k">updatedAt</p>
              <p className="kv-v">{savedTime}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


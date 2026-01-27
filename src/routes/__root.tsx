import { Link, Outlet, createRootRoute, useRouterState } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '../stores/appStore';
import '../index.css';

export const Route = createRootRoute({
  component: Root,
});

type NavKey = 'overview' | 'config' | 'features';

function AppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10 1.8c4.53 0 8.2 3.67 8.2 8.2 0 4.53-3.67 8.2-8.2 8.2-4.53 0-8.2-3.67-8.2-8.2 0-4.53 3.67-8.2 8.2-8.2Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M6.3 11.35c1.05 1.4 2.32 2.2 3.7 2.2s2.65-.8 3.7-2.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M6.2 8.2h.02M13.78 8.2h.02"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NavIcon({ view, className }: { view: NavKey; className?: string }) {
  if (view === 'overview') {
    return (
      <svg
        className={className}
        width="18"
        height="18"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M3.4 10a6.6 6.6 0 1 0 13.2 0 6.6 6.6 0 0 0-13.2 0Z"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path
          d="M10 10.2 13.9 8.1"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M10 4.4v1.3M4.4 10h1.3M10 14.3v1.3M14.3 10h1.3"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (view === 'config') {
    return (
      <svg
        className={className}
        width="18"
        height="18"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M4 5.4h12M4 14.6h12"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M7.2 5.4v0c0 1.05-.85 1.9-1.9 1.9v0c-1.05 0-1.9-.85-1.9-1.9v0c0-1.05.85-1.9 1.9-1.9v0c1.05 0 1.9.85 1.9 1.9Z"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path
          d="M16.6 14.6v0c0 1.05-.85 1.9-1.9 1.9v0c-1.05 0-1.9-.85-1.9-1.9v0c0-1.05.85-1.9 1.9-1.9v0c1.05 0 1.9.85 1.9 1.9Z"
          stroke="currentColor"
          strokeWidth="1.4"
        />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6.1 9.2 10 1.9l3.9 7.3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M3.3 10.7h13.4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M6.3 10.7 4.2 18h11.6l-2.1-7.3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WinMinimizeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2.2 6.5h7.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function WinMaximizeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2.4 2.6h7.2v6.8H2.4V2.6Z" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function WinRestoreIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M3.2 4h6.4v5H3.2V4Z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2.4 3.2h6.4v.8" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2.4 3.2v5h.8" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function WinCloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M3 3l6 6M9 3 3 9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Root() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const hasBridge = Boolean(window.appBridge);
  const platform = window.appBridge?.platform ?? 'unknown';
  const isMac = platform === 'darwin';

  const pingResult = useAppStore((state) => state.pingResult);
  const config = useAppStore((state) => state.config);
  const ping = useAppStore((state) => state.ping);
  const loadTemplateName = useAppStore((state) => state.loadTemplateName);

  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    void ping();
    void loadTemplateName();
  }, [loadTemplateName, ping]);

  useEffect(() => {
    const init = async () => {
      if (!window.appBridge) return;
      setIsMaximized(await window.appBridge.windowIsMaximized());
    };
    void init();
  }, []);

  useEffect(() => {
    if (!window.appBridge?.onWindowMaximizedChanged) return;
    window.appBridge.onWindowMaximizedChanged((value) => {
      setIsMaximized(value);
    });
  }, []);

  const handleMinimize = async () => {
    await window.appBridge?.windowMinimize();
  };

  const handleToggleMaximize = async () => {
    if (!window.appBridge) return;
    const next = await window.appBridge.windowToggleMaximize();
    setIsMaximized(next);
  };

  const handleClose = async () => {
    await window.appBridge?.windowClose();
  };

  const navItems = useMemo(
    () =>
      [
        { key: 'overview' as const, to: '/', label: '概览', hint: '状态与下一步' },
        { key: 'config' as const, to: '/config', label: '配置', hint: 'SQLite + IPC 示例' },
        { key: 'features' as const, to: '/features', label: '能力', hint: '模板亮点一览' },
      ] satisfies Array<{ key: NavKey; to: string; label: string; hint: string }>,
    [],
  );

  const activeMeta = navItems.find((item) => item.to === pathname) ?? navItems[0];

  const savedName = config.templateName?.value || '未设置';
  const savedTime = config.templateName?.updatedAt
    ? new Date(config.templateName.updatedAt).toLocaleString()
    : '未写入';

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="sidebar-top">
          <div className="app-mark">
            <div className="app-mark-icon">
              <AppIcon />
            </div>
            <div className="app-mark-text">
              <p className="app-mark-title">Electron App</p>
              <p className="app-mark-sub">Forge + Vite + TS</p>
            </div>
          </div>
        </div>

        <nav className="nav">
          {navItems.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              className={`nav-item ${item.to === pathname ? 'is-active' : ''}`}
            >
              <NavIcon view={item.key} className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="sidebar-metrics">
            <div className="metric">
              <p className="metric-k">IPC</p>
              <p className="metric-v">{pingResult || '...'}</p>
            </div>
            <div className="metric">
              <p className="metric-k">模板名称</p>
              <p className="metric-v">{savedName}</p>
            </div>
          </div>
        </div>
      </aside>

      <header className="app-header">
        <div className="header-left">
          {hasBridge && isMac ? (
            <div className="window-controls window-controls-mac no-drag" aria-label="窗口控制">
              <button
                className="wc-btn wc-close"
                type="button"
                onClick={handleClose}
                aria-label="关闭窗口"
                title="关闭"
              />
              <button
                className="wc-btn wc-minimize"
                type="button"
                onClick={handleMinimize}
                aria-label="最小化窗口"
                title="最小化"
              />
              <button
                className="wc-btn wc-maximize"
                type="button"
                onClick={handleToggleMaximize}
                aria-label={isMaximized ? '退出全屏' : '进入全屏'}
                title={isMaximized ? '退出全屏' : '进入全屏'}
              />
            </div>
          ) : null}

          <div className="header-meta">
            <p className="header-title">{activeMeta.label}</p>
            <p className="header-sub">{activeMeta.hint}</p>
          </div>
        </div>

        <div className="header-right no-drag">
          <input className="search" placeholder="搜索（示例，不会真正过滤）" />

          {hasBridge && !isMac ? (
            <div className="window-controls window-controls-win" aria-label="窗口控制">
              <button
                className="wc-btn wc-win"
                type="button"
                onClick={handleMinimize}
                aria-label="最小化窗口"
                title="最小化"
              >
                <WinMinimizeIcon />
              </button>
              <button
                className="wc-btn wc-win"
                type="button"
                onClick={handleToggleMaximize}
                aria-label={isMaximized ? '还原窗口' : '最大化窗口'}
                title={isMaximized ? '还原' : '最大化'}
              >
                {isMaximized ? <WinRestoreIcon /> : <WinMaximizeIcon />}
              </button>
              <button
                className="wc-btn wc-win wc-win-close"
                type="button"
                onClick={handleClose}
                aria-label="关闭窗口"
                title="关闭"
              >
                <WinCloseIcon />
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="app-statusbar">
        <p className="status-left">SQLite: app-template.db</p>
        <p className="status-right">
          IPC: {pingResult || '...'} · 最后写入：{savedTime}
        </p>
      </footer>

      {import.meta.env.DEV ? <TanStackRouterDevtools position="bottom-right" /> : null}
    </div>
  );
}

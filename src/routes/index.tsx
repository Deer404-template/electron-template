import { Link, createFileRoute } from '@tanstack/react-router';
import { useAppStore } from '../stores/appStore';

export const Route = createFileRoute('/')({
  component: OverviewPage,
});

function OverviewPage() {
  const pingResult = useAppStore((state) => state.pingResult);
  const config = useAppStore((state) => state.config);

  const savedName = config.templateName?.value || '未设置';
  const savedTime = config.templateName?.updatedAt
    ? new Date(config.templateName.updatedAt).toLocaleString()
    : '未写入';

  return (
    <section className="section">
      <div className="section-head">
        <h1 className="section-title">运行状态</h1>
        <p className="section-desc">
          这里是“应用壳”里的第一个页面：你可以把自己的业务页面替换进 `src/routes/*`，侧边栏与标题栏保持不动。
        </p>
      </div>

      <div className="card-grid">
        <div className="card">
          <div className="card-head">
            <p className="card-title">主进程连通</p>
            <span className="chip">{pingResult ? 'ok' : 'waiting'}</span>
          </div>
          <p className="card-value">{pingResult || '等待返回...'}</p>
          <p className="card-note">通过 preload 暴露的 `appBridge.ping()` 调用 IPC。</p>
        </div>

        <div className="card">
          <div className="card-head">
            <p className="card-title">配置写入</p>
            <span className="chip chip-muted">sqlite</span>
          </div>
          <p className="card-value">{savedName}</p>
          <p className="card-note">写入时间：{savedTime}</p>
        </div>

        <div className="card">
          <div className="card-head">
            <p className="card-title">下一步</p>
            <span className="chip chip-muted">todo</span>
          </div>
          <p className="card-note">
            先从 <Link className="inline-link" to="/config">配置页</Link> 开始，把示例表单替换成你的业务设置项；
            然后新增更多 routes（例如：列表、详情、设置）。
          </p>
        </div>
      </div>
    </section>
  );
}


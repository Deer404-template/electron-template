# Electron Forge 桌面应用模板

基于 Electron + Vite + TypeScript 的桌面应用起步模板，预置主进程/预加载/渲染进程的打包与开发配置，并提供 SQLite 数据层示例与 Zustand 轻量状态管理示例，复制即可开启新项目。

## 模板特性

- 🧩 一体化脚手架：Electron Forge + Vite，主进程、预加载、渲染进程均已配置
- 💾 数据层示例：使用 `better-sqlite3` 在主进程写入/读取配置数据
- 🪢 状态管理：Zustand 全局 store 示例，演示与 preload 暴露的 IPC API 协作
- 🔒 安全默认：开启 `contextIsolation`、关闭 `nodeIntegration`，通过 preload 暴露白名单 API
- 🎨 欢迎页：展示模板亮点与配置状态，适合作为新项目初始界面

## 技术栈

- Electron 39 + Electron Forge 7
- Vite 5 + React 18 + TypeScript 5
- better-sqlite3（主进程内嵌数据库示例）
- Zustand（渲染进程状态管理示例）

## 目录结构

```
electron-forge-template/
├── src/
│   ├── main.ts          # 主进程入口，示例：SQLite 配置表与 IPC 处理
│   ├── preload.ts       # 预加载脚本，安全暴露 appBridge API
│   ├── renderer.tsx     # 渲染进程入口，挂载路由
│   ├── routes/index.tsx # 欢迎页与 Zustand 示例
│   ├── routes/__root.tsx# TanStack Router 根路由
│   ├── index.css        # 欢迎页样式
│   └── types.ts         # 共享类型定义
├── forge.config.ts      # Electron Forge 配置
├── vite.*.config.ts     # Vite 主进程/预加载/渲染配置
├── package.json         # 项目元数据与依赖
└── README.md            # 当前说明文档
```

## 快速开始

```bash
npm install
npm start        # 开发模式，自动打开 DevTools
```

> 首次启动会在用户数据目录创建 `app-template.db`，用于存储示例配置。

## 生产构建

```bash
npm run package  # 生成 out/ 目录的可执行包
npm run make     # 生成平台发行包（zip/exe/deb/rpm）
```

## 打包注意事项

### better-sqlite3（原生模块）

`better-sqlite3` 属于原生模块，打包时需要与 Electron 自带的 Node ABI 匹配，否则会出现 `NODE_MODULE_VERSION` 不一致等报错。

本模板已在 `forge.config.ts` 中集成 `@electron/rebuild`，并在打包阶段自动处理：

- 打包前自动对 `better-sqlite3` 执行重编译（对齐当前 Electron 版本/架构）
- 将 `better-sqlite3` 复制到 `process.resourcesPath` 下，并补齐其运行时依赖（如 `bindings`）

如果你升级了 Electron 版本或切换了架构（例如 x64/arm64），重新执行 `npm run package` 即可。

### 路由（file:// 环境）

打包后的渲染进程默认通过 `file://` 加载页面。为避免浏览器 history 在 `file://.../index.html` 下出现路径不匹配导致的 “Not Found”，模板会在打包环境自动使用 hash history（URL 形如 `index.html#/`）。

## 数据层与缓存示例

- **主进程 SQLite**：`src/main.ts` 中使用 `better-sqlite3` 建表 `config(key, value, updated_at)`，并通过 `ipcMain.handle` 提供 `config:get`、`config:set`。
- **预加载桥**：`src/preload.ts` 将 `appBridge` 暴露到 `window`，仅包含 ping 与配置读写的白名单 API。
- **渲染层状态**：`src/routes/index.tsx` 使用 Zustand store 调用 `window.appBridge` 持久化 “模板名称”，并实时展示写入时间。

你可以在此基础上扩展更多表或 IPC API，保持数据写入在主进程完成，渲染层仅调用桥接接口。

## 自定义指引

1. **替换品牌与文案**：修改 `src/routes/index.tsx` 欢迎页文本、按钮逻辑与样式。
2. **扩展数据模型**：在 `src/main.ts` 中新增表和 IPC 方法，并在 `src/types.ts` 同步类型；在 `src/preload.ts` 暴露受控 API。
3. **状态管理**：在 `src/routes/index.tsx` 或独立 store 文件中新增 Zustand slice，统一管理前端状态。
4. **安全设置**：保持 `contextIsolation: true`、`nodeIntegration: false`，新增 API 通过 preload 白名单导出。

## 常用脚本

- `npm start`：开发模式启动
- `npm run package`：生成可执行包
- `npm run make`：生成发行包
- `npm run lint`：代码规范检查

## 许可证

MIT

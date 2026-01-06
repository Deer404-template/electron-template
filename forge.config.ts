import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import path from 'node:path';
import * as fs from 'node:fs/promises';
import { rebuild } from '@electron/rebuild';

const getElectronVersion = async () => {
  const pkgPath = path.join(process.cwd(), 'package.json');
  const pkgJson = JSON.parse(await fs.readFile(pkgPath, 'utf-8')) as {
    devDependencies?: Record<string, string>;
    dependencies?: Record<string, string>;
  };

  const version =
    pkgJson.devDependencies?.electron ??
    pkgJson.dependencies?.electron;

  if (!version) {
    throw new Error('未在 package.json 中找到 electron 版本');
  }

  return version;
};

const config: ForgeConfig = {
  hooks: {
    prePackage: async (_forgeConfig, _platform, arch) => {
      const electronVersion = await getElectronVersion();
      await rebuild({
        buildPath: process.cwd(),
        electronVersion,
        arch,
        force: true,
        onlyModules: ['better-sqlite3'],
      });
    },
  },
  packagerConfig: {
    // 原生模块需要解压到 asar 外
    asar: {
      unpack: '{**/node_modules/better-sqlite3/**,**/*.node}',
    },
    extraResource: ['node_modules/better-sqlite3'],
    afterCopyExtraResources: [
      (buildPath, _electronVersion, platform, _arch, callback) => {
        (async () => {
          if (platform !== 'darwin') return;

          const appNames = await fs.readdir(buildPath);
          const appName = appNames.find((name) => name.endsWith('.app'));
          if (!appName) return;

          const resourcesPath = path.join(buildPath, appName, 'Contents', 'Resources');
          const nodeModulesPath = path.join(resourcesPath, 'node_modules');
          await fs.mkdir(nodeModulesPath, { recursive: true });

          const runtimeDeps = ['bindings', 'file-uri-to-path'];
          for (const depName of runtimeDeps) {
            const srcPath = path.join(process.cwd(), 'node_modules', depName);
            const destPath = path.join(nodeModulesPath, depName);
            await fs.rm(destPath, { recursive: true, force: true });
            await fs.cp(srcPath, destPath, { recursive: true });
          }
        })()
          .then(() => callback())
          .catch((err) => callback(err as Error));
      },
    ],
    // 使用更快的镜像源，避免下载 Electron 二进制时超时
    electronDownload: {
      mirror: 'https://npmmirror.com/mirrors/electron/',
    },
  },
  rebuildConfig: {
    onlyModules: ['better-sqlite3'],
  },
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  plugins: [
    new VitePlugin({
      build: [
        {
          entry: 'src/main.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/preload.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;

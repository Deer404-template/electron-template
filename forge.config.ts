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
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
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

const prepareExtraResources = async () => {
  const extraResourcesRoot = path.join(
    process.cwd(),
    '.forge-extra-resources',
  );
  const extraNodeModules = path.join(extraResourcesRoot, 'node_modules');
  const modulesToCopy = ['better-sqlite3', 'bindings', 'file-uri-to-path'];

  await fs.rm(extraResourcesRoot, { recursive: true, force: true });
  await fs.mkdir(extraNodeModules, { recursive: true });

  await Promise.all(
    modulesToCopy.map(async (moduleName) => {
      const fromPath = path.join(
        process.cwd(),
        'node_modules',
        moduleName,
      );
      const toPath = path.join(extraNodeModules, moduleName);

      await fs.cp(fromPath, toPath, { recursive: true });
    }),
  );
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

      await prepareExtraResources();
    },
  },
  packagerConfig: {
    // 原生模块需要解压到 asar 外
    asar: {
      unpack: '{**/*.node}',
    },
    extraResource: [
      path.join(process.cwd(), '.forge-extra-resources', 'node_modules'),
    ],
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
    new AutoUnpackNativesPlugin({}),
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

import * as path from 'std/path';

import { PackageJson } from '/libs/Npm.ts';
import FileUtil from '/utils/FileUtil.ts';
import { Result } from '/utils/ProcessUtil.ts';

export interface InstallOptions {
  prod: boolean;
  dev: boolean;
  global: boolean;
}

abstract class Manager {
  async getProjectDependencies() {
    const root = await FileUtil.findRoot();
    const packagejson = await Deno.readFile(path.join(root, 'package.json'));
    const text = new TextDecoder().decode(packagejson);
    const parsed = JSON.parse(text) as PackageJson;

    const { dependencies, devDependencies } = parsed;

    return {
      devDependencies: devDependencies ? Object.keys(devDependencies) : [],
      dependencies: dependencies ? Object.keys(dependencies) : [],
    };
  }

  abstract install(packages: string[], options: Partial<InstallOptions>): Promise<void | Result>;

  abstract listGlobal(): Promise<{ dependencies: string[] }>;
}

export default Manager;

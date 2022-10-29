import * as path from 'std/path';

import Npm, { PackageJson } from '/libs/Npm.ts';
import Yarn from '/libs/Yarn.ts';
import { InstallOptions, Manager } from '/types/package.ts';
import FileUtil from '/utils/FileUtil.ts';

class PackageManager implements Manager {
  private manager: Manager;

  constructor(manager: 'npm' | 'yarn' = PackageManager.getManager()) {
    if (manager === 'npm') this.manager = new Npm();
    else if (manager === 'yarn') this.manager = new Yarn();
    else throw new Error('Invalid package manager');
  }

  static getManager() {
    const isYarn = FileUtil.existsSync('yarn.lock');
    const isNpm = FileUtil.existsSync('package-lock.json');

    if (isYarn) return 'yarn';
    else if (isNpm) return 'npm';
    else throw new Error('No valid package manager found');
  }

  async install(
    packages: string[],
    options: Partial<InstallOptions> = {},
  ) {
    return await this.manager.install(packages, options);
  }

  async listGlobal() {
    return await this.manager.listGlobal();
  }

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
}

export default PackageManager;

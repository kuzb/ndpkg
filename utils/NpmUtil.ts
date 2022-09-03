import * as path from 'std/path';

import FileUtil from '/utils/FileUtil.ts';

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

class NpmUtil {
  static async installPackages(dev: boolean, ...packages: string[]) {
    const process = Deno.run({
      cmd: ['npm', 'install', dev ? '--save-dev' : '--save', ...packages],
      stdout: 'piped',
      stderr: 'piped',
    });

    const { code } = await process.status();

    if (code !== 0) throw new Error('Failed when installing packages');
  }

  static async getDependencies() {
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

export default NpmUtil;

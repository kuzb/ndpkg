import * as path from 'std/path';

import FileUtil from '/utils/FileUtil.ts';

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

interface InstallOptions {
  prod: boolean;
  dev: boolean;
  global: boolean;
}

class NpmUtil {
  static async installPackages(
    packages: string[],
    options: Partial<InstallOptions> = {},
  ) {
    let cmd: string[];

    if (options.global) {
      cmd = ['npm', 'install', '--global', ...packages];
    } else if (options.dev) {
      cmd = ['npm', 'install', '--save-dev', ...packages];
    } else if (options.prod) {
      cmd = ['npm', 'install', '--save', ...packages];
    } else throw new Error('No install options provided');

    const process = Deno.run({
      cmd,
      stdout: 'piped',
      stderr: 'piped',
    });

    const { code } = await process.status();

    if (code !== 0) throw new Error('Failed when installing packages');
  }

  static async getProjectDependencies() {
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

  static async getGlobalDependencies() {
    const process = Deno.run({
      cmd: ['npm', 'list', '--global', '--depth', '0', '--json'],
      stdout: 'piped',
      stderr: 'piped',
    });

    const { code } = await process.status();

    if (code !== 0) throw new Error('Failed when getting global dependencies');

    const output = await process.output();
    const text = new TextDecoder().decode(output);
    const parsed = JSON.parse(text) as Pick<PackageJson, 'dependencies'>;

    const { dependencies } = parsed;

    return { dependencies: dependencies ? Object.keys(dependencies) : [] };
  }
}

export default NpmUtil;

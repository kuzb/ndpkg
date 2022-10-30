import Manager, { InstallOptions } from '/libs/Manager.ts';
import { Result } from '/utils/ProcessUtil.ts';

export interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

class Npm extends Manager {
  async install(packages: string[], options: Partial<InstallOptions> = {}) {
    let cmd: string[];

    if (!packages || packages.length === 0) return new Result('warning', 'No packages provided');

    if (options.global) cmd = ['npm', 'install', '-g', ...packages];
    else if (options.dev) cmd = ['npm', 'install', '--save-dev', ...packages];
    else if (options.prod) cmd = ['npm', 'install', '--save', ...packages];
    else throw new Error('No install options provided');

    const process = Deno.run({
      cmd,
      stdout: 'piped',
      stderr: 'piped',
    });

    const { code } = await process.status();

    if (code !== 0) throw new Error('Failed when installing packages');
  }

  async listGlobal() {
    const process = Deno.run({
      cmd: ['npm', 'list', '-g', '--depth', '0', '--json'],
      stdout: 'piped',
      stderr: 'piped',
    });

    const { code } = await process.status();

    if (code !== 0) throw new Error('Failed when getting global dependencies');

    const output = await process.output();
    const text = new TextDecoder().decode(output);

    const parsed = JSON.parse(text) as Pick<
      PackageJson,
      'dependencies'
    >;

    const { dependencies } = parsed;

    return { dependencies: dependencies ? Object.keys(dependencies) : [] };
  }
}

export default Npm;

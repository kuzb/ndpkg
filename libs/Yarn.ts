import Manager, { InstallOptions } from '/libs/Manager.ts';
import { Result } from '/utils/ProcessUtil.ts';

interface PackageListJson {
  type: string;
  data: {
    type: string;
    items: string[];
  };
}

class Yarn extends Manager {
  async install(packages: string[], options: Partial<InstallOptions> = {}) {
    let cmd: string[];

    if (!packages || packages.length === 0) return new Result('warning', 'No packages provided');

    if (options.global) cmd = ['yarn', 'global', 'add', ...packages];
    else if (options.dev) cmd = ['yarn', 'add', '--dev', ...packages];
    else if (options.prod) cmd = ['yarn', 'add', ...packages];
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
      cmd: ['yarn', 'global', 'list', '--json'],
      stdout: 'piped',
      stderr: 'piped',
    });

    const { code } = await process.status();

    if (code !== 0) throw new Error('Failed when getting global dependencies');

    const output = await process.output();
    const text = new TextDecoder().decode(output);

    const list = text.split('\n').filter((l) => l !== '').at(-1) as string;

    const parsed = JSON.parse(list) as PackageListJson;

    const { data: { items = [] } } = parsed;

    return { dependencies: items };
  }
}

export default Yarn;

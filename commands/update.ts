import * as path from 'std/path';
import { green, red } from 'std/fmt/colors';

import { wait } from 'wait';
import { Command } from 'cliffy';

import FileUtil from '/utils/FileUtil.ts';

interface Options {
  prod?: boolean;
  dev?: boolean;
}

interface Env {
  type: string;
  text: string;
}

const updatePackages = async (env: Env) => {
  const root = await FileUtil.findRoot();
  const packagejson = await Deno.readFile(path.join(root, 'package.json'));
  const text = new TextDecoder().decode(packagejson);
  const parsed = JSON.parse(text);

  const dependencies = Object.keys(parsed[env.type]).map((key) => key + '@latest');

  const spinner = wait(green(`Updating ${env.text} dependencies`)).start();

  const process = Deno.run({
    cmd: ['npm', 'install', '--save', ...dependencies],
    stdout: 'null',
    stderr: 'null',
  });

  const { code } = await process.status();

  if (code === 0) spinner.succeed();
  else spinner.fail(red(`Failed when updating ${env.text} dependencies`));
};

const update = async ({ prod, dev }: Options) => {
  if (prod) await updatePackages({ type: 'dependencies', text: 'production' });
  if (dev) await updatePackages({ type: 'devDependencies', text: 'development' });
};

export const updateCommand = new Command()
  .description('Updates package dependencies to latest release')
  .option('-p, --prod', 'Updates production dependencies')
  .option('-d, --dev', 'Updates development dependencies')
  .action(update);

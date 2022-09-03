import { Checkbox, Command } from 'cliffy';

import ProcessUtil from '/utils/ProcessUtil.ts';
import NpmUtil from '/utils/NpmUtil.ts';

interface Options {
  prod?: boolean;
  dev?: boolean;
  select?: boolean;
}

const update = async ({ prod, dev, select }: Options) => {
  let { devDependencies, dependencies } = await NpmUtil.getDependencies();

  if (select) {
    if (prod && dependencies.length > 0) {
      dependencies = await Checkbox.prompt({
        message: 'Select production packages to update',
        options: dependencies,
      });
    }

    if (dev && devDependencies.length > 0) {
      devDependencies = await Checkbox.prompt({
        message: 'Select development packages to update',
        options: devDependencies,
      });
    }
  }

  devDependencies = devDependencies.map((dependency) => `${dependency}@latest`);
  dependencies = dependencies.map((dependency) => `${dependency}@latest`);

  if (prod && dependencies.length > 0) {
    await ProcessUtil.run(async () => {
      await NpmUtil.installPackages(false, ...dependencies);
    }, {
      startText: 'Updating production dependencies',
      successText: 'Updated production dependencies',
      failText: 'Failed when updating production dependencies',
    });
  }

  if (dev && devDependencies.length > 0) {
    await ProcessUtil.run(async () => {
      await NpmUtil.installPackages(true, ...devDependencies);
    }, {
      startText: `Updating development dependencies`,
      successText: `Updated development dependencies`,
      failText: `Failed when updating development dependencies`,
    });
  }
};

export const updateCommand = new Command()
  .description('Update dependencies to latest version')
  .option('-p, --prod', 'Update production dependencies')
  .option('-d, --dev', 'Update development dependencies')
  .option('-s, --select', 'Select which dependencies to update')
  .action(update);

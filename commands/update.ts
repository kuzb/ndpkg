import { Checkbox, Command } from 'cliffy';

import ProcessUtil from '/utils/ProcessUtil.ts';
import NpmUtil from '/utils/NpmUtil.ts';

interface ProjectUpdateOptions {
  prod?: boolean;
  dev?: boolean;
  select?: boolean;
}

interface GlobalUpdateOptions {
  select?: boolean;
}

const update = async ({ prod, dev, select }: ProjectUpdateOptions) => {
  let { devDependencies, dependencies } = await NpmUtil.getProjectDependencies();

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
      await NpmUtil.installPackages(dependencies, { prod: true });
    }, {
      startText: 'Updating production dependencies',
      successText: 'Updated production dependencies',
      failText: 'Failed when updating production dependencies',
    });
  }

  if (dev && devDependencies.length > 0) {
    await ProcessUtil.run(async () => {
      await NpmUtil.installPackages(devDependencies, { dev: true });
    }, {
      startText: `Updating development dependencies`,
      successText: `Updated development dependencies`,
      failText: `Failed when updating development dependencies`,
    });
  }
};

const updateGlobal = async ({ select }: GlobalUpdateOptions) => {
  const { dependencies } = await NpmUtil.getGlobalDependencies();

  let packages = dependencies;

  if (select) {
    packages = await Checkbox.prompt({
      message: 'Select global packages to update',
      options: packages,
    });
  }

  packages = packages.map((dependency) => `${dependency}@latest`);

  await ProcessUtil.run(async () => {
    await NpmUtil.installPackages(packages, { global: true });
  }, {
    startText: 'Updating global dependencies',
    successText: 'Updated global dependencies',
    failText: 'Failed when updating global dependencies',
  });
};

export const updateCommand = new Command()
  .description('Update dependencies to latest version')
  .option('-s, --select', 'Select which dependencies to update')
  .option('-p, --prod', 'Update production dependencies', { action: update })
  .option('-d, --dev', 'Update development dependencies', { action: update })
  .option('-g, --global', 'Update global dependencies', { conflicts: ['dev', 'prod'], action: updateGlobal });

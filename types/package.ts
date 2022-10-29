import { Result } from '/utils/ProcessUtil.ts';

export interface InstallOptions {
  prod: boolean;
  dev: boolean;
  global: boolean;
}

export interface Manager {
  install(packages: string[], options: Partial<InstallOptions>): Promise<void | Result>;
  listGlobal(): Promise<{ dependencies: string[] }>;
}

import { Command } from 'cliffy';

import { updateCommand } from '/commands/update.ts';
import { version } from '/version.ts';

new Command()
  .name('ndpkg')
  .description('Tiny NPM wrapper')
  .version(version)
  .command('update', updateCommand)
  .parse(Deno.args);

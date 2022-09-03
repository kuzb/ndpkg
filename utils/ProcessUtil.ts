import { green, red } from 'std/fmt/colors';

import { wait } from 'wait';

class ProcessUtil {
  static async run(
    callback: () => Promise<void>,
    { startText, successText, failText }: { startText: string; successText: string; failText: string },
  ) {
    const spinner = wait(green(startText)).start();

    try {
      await callback();

      spinner.succeed(successText);
    } catch {
      spinner.fail(red(failText));
    }
  }
}

export default ProcessUtil;

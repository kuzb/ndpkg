import { blue, green, red, yellow } from 'std/fmt/colors';

import { Spinner, wait } from 'wait';

type Status = 'success' | 'error' | 'warning' | 'info';

export class Result {
  constructor(public status: Status, public message: string) {}
}

class ProcessUtil {
  private static showStatus(result: Result, spinner: Spinner) {
    switch (result.status) {
      case 'success':
        return spinner.succeed(green(result.message));
      case 'error':
        return spinner.fail(red(result.message));
      case 'warning':
        return spinner.warn(yellow(result.message));
      case 'info':
        return spinner.info(blue(result.message));
    }
  }

  static async run(
    callback: () => Promise<void | Result>,
    { startText, successText, failText }: { startText: string; successText: string; failText: string },
  ) {
    const spinner = wait(green(startText)).start();

    try {
      const result = await callback();

      if (result) ProcessUtil.showStatus(result, spinner);
      else spinner.succeed(successText);
    } catch {
      spinner.fail(red(failText));
    }
  }
}

export default ProcessUtil;

import Npm from '/libs/Npm.ts';
import Yarn from '/libs/Yarn.ts';
import FileUtil from '/utils/FileUtil.ts';

class ManagerFactory {
  static build(manager: 'npm' | 'yarn' = ManagerFactory.guessManager()) {
    if (manager === 'npm') return new Npm();
    else if (manager === 'yarn') return new Yarn();
    else throw new Error('No valid package manager found');
  }

  static guessManager() {
    const isYarn = FileUtil.existsSync('yarn.lock');
    const isNpm = FileUtil.existsSync('package-lock.json');

    if (isYarn && isNpm) throw new Error('Both yarn.lock and package-lock.json found');
    else if (isYarn) return 'yarn';
    else if (isNpm) return 'npm';
    else throw new Error('No valid package manager found');
  }
}

export default ManagerFactory;

import * as path from 'std/path';
import { isAbsolute, join } from "std/path";

class FileUtil {
  static async findRoot(startPath = Deno.cwd()): Promise<string> {
    if (startPath === path.parse(startPath).root) {
      return startPath;
    }

    try {
      const stats = await Deno.stat(path.join(startPath, 'node_modules'));

      if (stats.isDirectory) {
        return startPath;
      }
    } catch (error) {
      if (error instanceof Deno.errors.NotFound === false) {
        throw error;
      }
    }

    return FileUtil.findRoot(path.dirname(startPath));
  }

  static existsSync(base: string): boolean {
    const path = isAbsolute(base) ? base : join(Deno.cwd(), base);

    try {
      Deno.statSync(path);

      return true;
    } catch {
      return false;
    }
  }
}

export default FileUtil;

import * as path from 'std/path';

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
}

export default FileUtil;

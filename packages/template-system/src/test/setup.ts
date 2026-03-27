import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

type FileMap = Record<string, string>;

export async function createTempWorkspace(prefix: string) {
  const rootDir = await mkdtemp(join(tmpdir(), prefix));

  return {
    rootDir,
    async writeFiles(files: FileMap) {
      for (const [relativePath, content] of Object.entries(files)) {
        const absolutePath = join(rootDir, relativePath);
        const directory = dirname(absolutePath);

        await mkdir(directory, { recursive: true });
        await writeFile(absolutePath, content, "utf8");
      }
    },
    async cleanup() {
      await rm(rootDir, { recursive: true, force: true });
    },
  };
}

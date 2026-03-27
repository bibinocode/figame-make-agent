import fg from "fast-glob";
import { basename, dirname, join } from "node:path";
import type { TemplateDirectoryRecord } from "../types/template";

export async function scanTemplateDirectories(
  templatesRoot: string,
): Promise<TemplateDirectoryRecord[]> {
  const manifestPaths = await fg("*/template.manifest.json", {
    cwd: templatesRoot,
    onlyFiles: true,
  });

  return manifestPaths.map((relativeManifestPath) => {
    const templateRoot = join(templatesRoot, dirname(relativeManifestPath));

    return {
      id: basename(dirname(relativeManifestPath)),
      templateRoot,
      manifestPath: join(templatesRoot, relativeManifestPath),
    };
  });
}

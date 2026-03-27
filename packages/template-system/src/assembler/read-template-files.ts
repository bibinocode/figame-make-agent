import { readFile } from "node:fs/promises";
import fg from "fast-glob";
import { join } from "node:path";
import type { TemplateFile } from "../types/template";
import { normalizeTemplatePath } from "../transforms/normalize-template-path";

export async function readTemplateFiles(
  templateRoot: string,
): Promise<Record<string, TemplateFile>> {
  const relativeFilePaths = await fg("**/*", {
    cwd: templateRoot,
    onlyFiles: true,
    dot: true,
    ignore: ["template.manifest.json"],
  });

  const entries = await Promise.all(
    relativeFilePaths.map(async (relativeFilePath) => {
      const code = await readFile(join(templateRoot, relativeFilePath), "utf8");
      const normalizedPath = normalizeTemplatePath(relativeFilePath);

      return [
        normalizedPath,
        {
          path: normalizedPath,
          code,
        },
      ] as const;
    }),
  );

  return Object.fromEntries(entries);
}

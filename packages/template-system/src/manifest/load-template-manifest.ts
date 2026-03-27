import { readFile } from "node:fs/promises";
import type { TemplateManifest } from "../types/manifest";
import {
  TemplateManifestParseError,
  TemplateManifestValidationError,
} from "../types/errors";
import { normalizeTemplatePath } from "../transforms/normalize-template-path";
import { templateManifestSchema } from "../validators/template-manifest.schema";

export async function loadTemplateManifest(
  manifestPath: string,
): Promise<TemplateManifest> {
  let rawContent: string;

  try {
    rawContent = await readFile(manifestPath, "utf8");
  } catch (error) {
    throw new TemplateManifestParseError(manifestPath, error);
  }

  let parsedManifest: unknown;

  try {
    parsedManifest = JSON.parse(rawContent);
  } catch (error) {
    throw new TemplateManifestParseError(manifestPath, error);
  }

  const result = templateManifestSchema.safeParse(parsedManifest);

  if (!result.success) {
    throw new TemplateManifestValidationError(
      manifestPath,
      result.error.issues.map((issue) => issue.path.join(".")).join(", "),
    );
  }

  const manifest = result.data;

  return {
    id: manifest.id,
    label: manifest.label,
    runtime: manifest.runtime,
    extends: manifest.extends,
    entry: manifest.entry
      ? {
          main: manifest.entry.main
            ? normalizeTemplatePath(manifest.entry.main)
            : undefined,
        }
      : undefined,
    preview: {
      template: manifest.preview.template,
      visibleFiles: manifest.preview.visibleFiles.map(normalizeTemplatePath),
      activeFile: normalizeTemplatePath(manifest.preview.activeFile),
      externalResources: manifest.preview.externalResources,
    },
  };
}

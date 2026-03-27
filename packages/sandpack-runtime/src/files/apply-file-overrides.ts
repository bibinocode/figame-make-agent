import type { AssembledTemplate, TemplateFile } from "@figame/template-system";

export function applyFileOverrides(
  files: AssembledTemplate["files"],
  overrides?: Record<string, string>,
): Record<string, TemplateFile> {
  if (!overrides || Object.keys(overrides).length === 0) {
    return { ...files };
  }

  const nextFiles: Record<string, TemplateFile> = { ...files };

  for (const [path, code] of Object.entries(overrides)) {
    nextFiles[path] = {
      path,
      code,
    };
  }

  return nextFiles;
}

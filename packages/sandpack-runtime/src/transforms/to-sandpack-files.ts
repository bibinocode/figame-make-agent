import type { TemplateFile } from "@figame/template-system";
import type { SandpackFileRecord } from "../types/sandpack";

export function toSandpackFiles(
  files: Record<string, TemplateFile>,
): SandpackFileRecord {
  return Object.fromEntries(
    Object.entries(files).map(([path, file]) => [
      path,
      {
        code: file.code,
      },
    ]),
  );
}

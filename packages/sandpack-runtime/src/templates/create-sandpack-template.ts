import type { AssembledTemplate } from "@figame/template-system";
import { applyFileOverrides } from "../files/apply-file-overrides";
import { createSandpackOptions } from "../preview/create-sandpack-options";
import { toSandpackFiles } from "../transforms/to-sandpack-files";
import type { SandpackTemplateResult } from "../types/sandpack";

export function createSandpackTemplate(
  assembledTemplate: AssembledTemplate,
  overrides?: Record<string, string>,
): SandpackTemplateResult {
  const files = applyFileOverrides(assembledTemplate.files, overrides);

  return {
    template: assembledTemplate.preview.template,
    files: toSandpackFiles(files),
    options: createSandpackOptions(assembledTemplate.preview),
  };
}

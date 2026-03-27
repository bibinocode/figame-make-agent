import type { AssembledTemplate } from "@figame/template-system";
import type { SandpackTemplateOptions } from "../types/sandpack";

export function createSandpackOptions(
  preview: AssembledTemplate["preview"],
): SandpackTemplateOptions {
  return {
    activeFile: preview.activeFile,
    visibleFiles: preview.visibleFiles,
    externalResources:
      preview.externalResources.length > 0 ? preview.externalResources : undefined,
  };
}

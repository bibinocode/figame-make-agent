import type { AssembledTemplate } from "@figame/template-system";

export type SandpackFileRecord = Record<string, { code: string }>;

export type SandpackTemplateOptions = {
  activeFile: string;
  visibleFiles: string[];
  externalResources?: string[];
};

export type SandpackTemplateResult = {
  template: string;
  files: SandpackFileRecord;
  options: SandpackTemplateOptions;
};

export type CreateSandpackTemplateInput = AssembledTemplate;

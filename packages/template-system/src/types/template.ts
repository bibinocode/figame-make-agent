import type { TemplateRuntime } from "./manifest";

export type TemplateFile = {
  path: string;
  code: string;
};

export type TemplatePreviewConfig = {
  template: string;
  visibleFiles: string[];
  activeFile: string;
  externalResources: string[];
};

export type AssembledTemplate = {
  id: string;
  label: string;
  runtime: TemplateRuntime;
  entry?: {
    main?: string;
  };
  files: Record<string, TemplateFile>;
  preview: TemplatePreviewConfig;
};

export type TemplateAssemblyOptions = {
  templateId: string;
  templatesRoot: string;
};

export type TemplateRegistryOptions = {
  templatesRoot: string;
};

export type TemplateDirectoryRecord = {
  id: string;
  templateRoot: string;
  manifestPath: string;
};

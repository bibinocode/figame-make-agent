export type TemplateRuntime = "sandpack" | "webcontainer";

export type TemplateManifestEntry = {
  main?: string;
};

export type TemplateManifestPreview = {
  template: string;
  visibleFiles: string[];
  activeFile: string;
  externalResources: string[];
};

export type TemplateManifest = {
  id: string;
  label: string;
  runtime: TemplateRuntime;
  extends: string[];
  entry?: TemplateManifestEntry;
  preview: TemplateManifestPreview;
};

import { assembleTemplate } from "../assembler/assemble-template";
import { loadTemplateManifest } from "../manifest/load-template-manifest";
import type { TemplateManifest } from "../types/manifest";
import type { AssembledTemplate, TemplateRegistryOptions } from "../types/template";
import { scanTemplateDirectories } from "../scanner/scan-template-directories";

export async function listTemplates({
  templatesRoot,
}: TemplateRegistryOptions): Promise<TemplateManifest[]> {
  const templateDirectories = await scanTemplateDirectories(templatesRoot);

  return Promise.all(
    templateDirectories.map(({ manifestPath }) => loadTemplateManifest(manifestPath)),
  );
}

export async function getTemplate(
  templateId: string,
  options: TemplateRegistryOptions,
): Promise<AssembledTemplate> {
  return assembleTemplate({
    templateId,
    templatesRoot: options.templatesRoot,
  });
}

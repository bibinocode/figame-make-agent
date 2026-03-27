import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";
import { loadTemplateManifest } from "../manifest/load-template-manifest";
import {
  TemplateAssembleError,
  TemplateNotFoundError,
  TemplatePreviewConfigError,
} from "../types/errors";
import type {
  AssembledTemplate,
  TemplateAssemblyOptions,
  TemplateFile,
} from "../types/template";
import { readTemplateFiles } from "./read-template-files";

export async function assembleTemplate({
  templateId,
  templatesRoot,
}: TemplateAssemblyOptions): Promise<AssembledTemplate> {
  const templateRoot = join(templatesRoot, templateId);
  const manifestPath = join(templateRoot, "template.manifest.json");

  try {
    await access(manifestPath, constants.F_OK);
  } catch {
    throw new TemplateNotFoundError(templateId, templatesRoot);
  }

  const manifest = await loadTemplateManifest(manifestPath);
  const assembledFiles: Record<string, TemplateFile> = {};

  for (const parentTemplateId of manifest.extends) {
    const parentTemplateRoot = join(templatesRoot, parentTemplateId);

    try {
      await access(parentTemplateRoot, constants.F_OK);
    } catch {
      throw new TemplateAssembleError(
        `Extended template "${parentTemplateId}" was not found for "${templateId}".`,
      );
    }

    Object.assign(assembledFiles, await readTemplateFiles(parentTemplateRoot));
  }

  // 当前模板永远是最终声明者，所以它的同名文件要覆盖 shared 层。
  Object.assign(assembledFiles, await readTemplateFiles(templateRoot));

  assertPreviewFilesExist(
    manifest.preview.activeFile,
    manifest.preview.visibleFiles,
    assembledFiles,
    templateId,
  );

  return {
    id: manifest.id,
    label: manifest.label,
    runtime: manifest.runtime,
    entry: manifest.entry,
    files: assembledFiles,
    preview: manifest.preview,
  };
}

function assertPreviewFilesExist(
  activeFile: string,
  visibleFiles: string[],
  files: Record<string, TemplateFile>,
  templateId: string,
) {
  if (!files[activeFile]) {
    throw new TemplatePreviewConfigError(
      `Template "${templateId}" preview.activeFile points to missing file "${activeFile}".`,
    );
  }

  for (const visibleFile of visibleFiles) {
    if (!files[visibleFile]) {
      throw new TemplatePreviewConfigError(
        `Template "${templateId}" preview.visibleFiles contains missing file "${visibleFile}".`,
      );
    }
  }
}

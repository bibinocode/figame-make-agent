import type { Monaco } from "@monaco-editor/react";

type MonacoModel = ReturnType<Monaco["editor"]["createModel"]>;

export function toMonacoModelUri(filePath: string) {
  return `file://${filePath}`;
}

export function toProjectFilePath(uri: string) {
  if (!uri.startsWith("file:///")) {
    return null;
  }

  return decodeURIComponent(uri.slice("file://".length));
}

export function syncMonacoModels(
  monaco: Pick<Monaco, "Uri" | "editor">,
  files: Record<string, string>,
) {
  const expectedUris = new Set<string>();

  for (const [filePath, code] of Object.entries(files)) {
    const uri = monaco.Uri.parse(toMonacoModelUri(filePath));
    const uriString = uri.toString();
    expectedUris.add(uriString);

    const existingModel = monaco.editor.getModel(uri) as MonacoModel | null;

    if (existingModel) {
      if (existingModel.getValue() !== code) {
        existingModel.setValue(code);
      }

      continue;
    }

    monaco.editor.createModel(code, getLanguage(filePath), uri);
  }

  for (const model of monaco.editor.getModels() as MonacoModel[]) {
    const uriString = model.uri.toString();

    if (uriString.startsWith("file:///") && !expectedUris.has(uriString)) {
      model.dispose();
    }
  }
}

function getLanguage(filePath: string): string {
  if (filePath.endsWith(".tsx") || filePath.endsWith(".ts")) {
    return "typescript";
  }

  if (filePath.endsWith(".jsx") || filePath.endsWith(".js")) {
    return "javascript";
  }

  if (filePath.endsWith(".css")) {
    return "css";
  }

  if (filePath.endsWith(".html")) {
    return "html";
  }

  if (filePath.endsWith(".json")) {
    return "json";
  }

  return "plaintext";
}

"use client";

import Editor, { type Monaco } from "@monaco-editor/react";
import { useEffect, useEffectEvent, useRef } from "react";
import {
  syncMonacoModels,
  toMonacoModelUri,
  toProjectFilePath,
} from "./monaco-model-sync";

type MonacoEditorPaneProps = {
  filePath: string;
  files: Record<string, string>;
  onActiveFileChange: (path: string) => void;
  value: string;
  onChange: (value: string) => void;
};

type Disposable = {
  dispose: () => void;
};

export function MonacoEditorPane({
  filePath,
  files,
  onActiveFileChange,
  value,
  onChange,
}: MonacoEditorPaneProps) {
  const modelSubscriptionRef = useRef<Disposable | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const handleActiveFileChange = useEffectEvent((path: string) => {
    onActiveFileChange(path);
  });

  useEffect(() => {
    if (!monacoRef.current) {
      return;
    }

    syncMonacoModels(monacoRef.current, files);
  }, [files]);

  useEffect(() => {
    return () => {
      modelSubscriptionRef.current?.dispose();
      modelSubscriptionRef.current = null;
      monacoRef.current = null;
    };
  }, []);

  return (
    <Editor
      beforeMount={(monaco) => {
        configureMonaco(monaco);
        syncMonacoModels(monaco, files);
      }}
      defaultLanguage={getLanguage(filePath)}
      height="100%"
      language={getLanguage(filePath)}
      onMount={(editorInstance, monaco) => {
        monacoRef.current = monaco;
        syncMonacoModels(monaco, files);
        modelSubscriptionRef.current?.dispose();
        modelSubscriptionRef.current = editorInstance.onDidChangeModel(() => {
          const nextUri = editorInstance.getModel()?.uri.toString();

          if (!nextUri) {
            return;
          }

          const nextFilePath = toProjectFilePath(nextUri);

          if (nextFilePath) {
            handleActiveFileChange(nextFilePath);
          }
        });
      }}
      options={{
        automaticLayout: true,
        fontFamily:
          "var(--font-geist-mono), ui-monospace, SFMono-Regular, monospace",
        fontLigatures: true,
        fontSize: 14,
        minimap: { enabled: false },
        padding: { top: 16 },
        quickSuggestions: {
          comments: false,
          other: true,
          strings: true,
        },
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        snippetSuggestions: "inline",
        suggestOnTriggerCharacters: true,
        tabCompletion: "on",
        wordBasedSuggestions: "allDocuments",
      }}
      path={toMonacoModelUri(filePath)}
      theme="vs"
      value={value}
      onChange={(nextValue) => onChange(nextValue ?? "")}
    />
  );
}

function configureMonaco(monaco: Monaco) {
  const compilerOptions = {
    allowJs: true,
    allowNonTsExtensions: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    target: monaco.languages.typescript.ScriptTarget.ES2022,
  };

  monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
  monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSuggestionDiagnostics: false,
    noSyntaxValidation: false,
  });
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSuggestionDiagnostics: false,
    noSyntaxValidation: false,
  });
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
    compilerOptions,
  );
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions(
    compilerOptions,
  );
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

"use client";

import Editor, { type Monaco } from "@monaco-editor/react";

type MonacoEditorPaneProps = {
  filePath: string;
  value: string;
  onChange: (value: string) => void;
};

export function MonacoEditorPane({
  filePath,
  value,
  onChange,
}: MonacoEditorPaneProps) {
  return (
    <Editor
      beforeMount={configureMonaco}
      defaultLanguage={getLanguage(filePath)}
      height="100%"
      language={getLanguage(filePath)}
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
        wordBasedSuggestions: "currentDocument",
      }}
      path={filePath}
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

  // 浏览器内没有真实 node_modules，这里先关闭语义错误噪音，
  // 保留 Monaco 自带的语言高亮、括号补全、基础建议和快捷编辑体验。
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

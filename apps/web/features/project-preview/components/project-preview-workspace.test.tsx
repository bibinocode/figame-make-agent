import { render, screen } from "@testing-library/react";
import type { AssembledTemplate } from "@figame/template-system";
import { describe, expect, it, vi } from "vitest";
import { ProjectPreviewWorkspace } from "./project-preview-workspace";

vi.mock("../editor/monaco-editor-pane", () => ({
  MonacoEditorPane: ({ filePath }: { filePath: string }) => (
    <div data-testid="monaco-editor">{filePath}</div>
  ),
}));

vi.mock("../terminal/terminal-pane", () => ({
  TerminalPane: () => <div data-testid="terminal-pane">terminal</div>,
}));

vi.mock("../preview/preview-pane", () => ({
  PreviewPane: () => <div data-testid="preview-pane">preview</div>,
}));

vi.mock("../runtime/use-webcontainer-session", () => ({
  useWebcontainerSession: () => ({
    errorMessage: null,
    isTerminalReady: false,
    output: "",
    previewUrl: null,
    reinstallDependencies: vi.fn(),
    resizeTerminal: vi.fn(),
    sendTerminalInput: vi.fn(),
    startDevServer: vi.fn(),
    status: "idle",
    stopDevServer: vi.fn(),
    writeFile: vi.fn(),
  }),
}));

const template: AssembledTemplate = {
  id: "react-ts",
  label: "React TypeScript",
  runtime: "webcontainer",
  files: {
    "/src/App.tsx": {
      path: "/src/App.tsx",
      code: "export default function App() { return null; }",
    },
    "/src/main.tsx": {
      path: "/src/main.tsx",
      code: "import React from 'react';",
    },
  },
  preview: {
    template: "vite-react-ts",
    activeFile: "/src/App.tsx",
    visibleFiles: ["/src/App.tsx"],
    externalResources: [],
  },
};

describe("ProjectPreviewWorkspace", () => {
  // 这条测试是为了锁住新的工作区骨架：
  // 左侧仍然是统一 IDE 壳，但内容区要显式区分“代码模式”和“预览模式”，不再把编辑和预览揉在一起。
  it("应该默认进入代码模式，并提供切换到纯预览模式的入口", () => {
    render(
      <ProjectPreviewWorkspace
        templateLabel="React TypeScript"
        template={template}
      />,
    );

    expect(screen.getByRole("button", { name: "代码" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "预览" })).toBeInTheDocument();
    expect(screen.getByText("src/App.tsx")).toBeInTheDocument();
    expect(screen.getByTestId("monaco-editor")).toHaveTextContent("/src/App.tsx");
    expect(screen.getByTestId("terminal-pane")).toBeInTheDocument();
  });
});

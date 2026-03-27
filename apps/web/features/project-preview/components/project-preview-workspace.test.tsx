import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { SandpackTemplateResult } from "@figame/sandpack-runtime";
import { ProjectPreviewWorkspace } from "./project-preview-workspace";

vi.mock("../sandpack/sandpack-preview-panel", () => ({
  SandpackPreviewPanel: ({
    mode,
  }: {
    mode: "code" | "preview";
    sandpackTemplate: SandpackTemplateResult;
  }) => <div data-testid="sandpack-panel">{mode}</div>,
}));

const sandpackTemplate: SandpackTemplateResult = {
  template: "react-ts",
  files: {
    "/src/App.tsx": {
      code: "export default function App() { return null; }",
    },
  },
  options: {
    activeFile: "/src/App.tsx",
    visibleFiles: ["/src/App.tsx"],
  },
};

describe("ProjectPreviewWorkspace", () => {
  // 这条测试是为了锁住首页最核心的交互：用户默认先看到代码区，也能切到预览区。
  // 这样后面我们再替换 Sandpack 内部布局时，不会不小心把最外层工作台交互弄丢。
  it("应该默认展示代码视图，并在点击后切换到预览视图", () => {
    render(
      <ProjectPreviewWorkspace
        templateLabel="React TypeScript"
        sandpackTemplate={sandpackTemplate}
      />,
    );

    expect(screen.getByTestId("sandpack-panel")).toHaveTextContent("code");

    fireEvent.click(screen.getByRole("tab", { name: "预览" }));

    expect(screen.getByTestId("sandpack-panel")).toHaveTextContent("preview");
  });
});

import { describe, expect, it } from "vitest";
import { createSandpackTemplate } from "./create-sandpack-template";

describe("createSandpackTemplate", () => {
  // 这条测试是为了验证“UI 层只消费转换结果，不自己再拼 Sandpack 结构”。
  // 只要这层输出稳定，后面页面、flow、AI 覆盖文件都可以围绕同一个结果对象工作。
  it("应该把装配后的模板转换成 Sandpack 需要的 files 和 options", () => {
    const result = createSandpackTemplate({
      id: "react-ts",
      label: "React TypeScript",
      runtime: "sandpack",
      files: {
        "/src/App.tsx": {
          path: "/src/App.tsx",
          code: "export default function App() { return null; }",
        },
      },
      preview: {
        template: "react-ts",
        activeFile: "/src/App.tsx",
        visibleFiles: ["/src/App.tsx"],
        externalResources: ["https://cdn.tailwindcss.com"],
      },
    });

    expect(result).toEqual({
      template: "react-ts",
      files: {
        "/src/App.tsx": {
          code: "export default function App() { return null; }",
        },
      },
      options: {
        activeFile: "/src/App.tsx",
        visibleFiles: ["/src/App.tsx"],
        externalResources: ["https://cdn.tailwindcss.com"],
      },
    });
  });
});

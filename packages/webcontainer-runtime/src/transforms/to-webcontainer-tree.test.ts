import { describe, expect, it } from "vitest";
import { toWebContainerTree } from "./to-webcontainer-tree";

describe("toWebContainerTree", () => {
  // 这条测试是为了锁住“模板文件要先转换成 WebContainer mount 树”这个核心契约。
  // 如果这层结构不稳定，后面浏览器内 mount、安装依赖和启动 dev server 都会直接失效。
  it("应该把装配后的模板文件转换成嵌套目录树", () => {
    const result = toWebContainerTree({
      id: "react-ts",
      label: "React TypeScript",
      runtime: "webcontainer",
      files: {
        "/package.json": {
          path: "/package.json",
          code: '{"name":"demo"}',
        },
        "/src/App.tsx": {
          path: "/src/App.tsx",
          code: "export default function App() { return null; }",
        },
      },
      preview: {
        template: "react-ts",
        activeFile: "/src/App.tsx",
        visibleFiles: ["/src/App.tsx"],
        externalResources: [],
      },
    });

    expect(result["package.json"]).toEqual({
      file: {
        contents: '{"name":"demo"}',
      },
    });
    expect(result["src"]).toBeDefined();
    expect(
      "directory" in result["src"]! && result["src"].directory["App.tsx"],
    ).toEqual({
      file: {
        contents: "export default function App() { return null; }",
      },
    });
  });
});

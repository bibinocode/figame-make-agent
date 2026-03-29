import { describe, expect, it } from "vitest";
import { getDemoTemplate } from "./get-demo-template";

describe("getDemoTemplate", () => {
  // 这条测试是为了确认首页演示数据已经直接走 template-system 主链，
  // 后续 WebContainer 挂载、编辑和预览都应该消费这份 AssembledTemplate，而不是旧的 Sandpack 中间结构。
  it("应该加载本地 react-ts 模板，并返回可直接挂载的组装结果", async () => {
    const template = await getDemoTemplate();

    expect(template.id).toBe("react-ts");
    expect(template.runtime).toBe("webcontainer");
    expect(template.files["/src/App.tsx"]).toEqual(
      expect.objectContaining({
        path: "/src/App.tsx",
        code: expect.stringContaining("export default function App"),
      }),
    );
    expect(template.files["/package.json"]).toEqual(
      expect.objectContaining({
        path: "/package.json",
      }),
    );
    expect(template.preview.activeFile).toBe("/src/App.tsx");
  });
});

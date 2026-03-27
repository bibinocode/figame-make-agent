import { describe, expect, it } from "vitest";
import { getDemoSandpackTemplate } from "./get-demo-sandpack-template";

describe("getDemoSandpackTemplate", () => {
  // 这条测试是为了验证首页演示数据走的是真实模板链路，而不是页面里手写了一份假数据。
  // 只要这层测试稳定，我们就能确认 web 已经真正接上 template-system 和 sandpack-runtime。
  it("应该把本地 react-ts 模板转换成首页可消费的 Sandpack 数据", async () => {
    const sandpackTemplate = await getDemoSandpackTemplate();

    expect(sandpackTemplate.template).toBe("react-ts");
    expect(sandpackTemplate.files["/src/App.tsx"]).toEqual(
      expect.objectContaining({
        code: expect.stringContaining("Sandpack template is ready"),
      }),
    );
    expect(sandpackTemplate.options.activeFile).toBe("/src/App.tsx");
    expect(sandpackTemplate.options.visibleFiles).toEqual(
      expect.arrayContaining(["/src/App.tsx", "/src/main.tsx", "/src/styles.css"]),
    );
  });
});

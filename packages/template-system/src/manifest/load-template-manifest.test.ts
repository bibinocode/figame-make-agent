import { afterEach, describe, expect, it } from "vitest";
import { createTempWorkspace } from "../test/setup";
import { loadTemplateManifest } from "./load-template-manifest";

const workspaces: Array<{ cleanup: () => Promise<void> }> = [];

describe("loadTemplateManifest", () => {
  afterEach(async () => {
    await Promise.all(workspaces.splice(0).map((workspace) => workspace.cleanup()));
  });

  // 这条测试是为了锁住“模板自己必须完整声明预览入口”这个约束。
  // 如果 activeFile / visibleFiles 能缺失，后面 Sandpack 层就会被迫偷偷兜底，manifest 驱动会失真。
  it("当 preview 缺少 activeFile 时应该校验失败", async () => {
    const workspace = await createTempWorkspace("figame-template-manifest-");
    workspaces.push(workspace);

    await workspace.writeFiles({
      "templates/react-ts/template.manifest.json": JSON.stringify({
        id: "react-ts",
        label: "React TypeScript",
        runtime: "sandpack",
        preview: {
          template: "react-ts",
          visibleFiles: ["/src/App.tsx"],
        },
      }),
    });

    await expect(
      loadTemplateManifest(
        `${workspace.rootDir}\\templates\\react-ts\\template.manifest.json`,
      ),
    ).rejects.toThrow(/activeFile/i);
  });
});

import { afterEach, describe, expect, it } from "vitest";
import { assembleTemplate } from "./assemble-template";
import { createTempWorkspace } from "../test/setup";

const workspaces: Array<{ cleanup: () => Promise<void> }> = [];

describe("assembleTemplate", () => {
  afterEach(async () => {
    await Promise.all(workspaces.splice(0).map((workspace) => workspace.cleanup()));
  });

  // 这条测试是为了验证“shared 负责提供基座文件，当前模板负责最终覆盖”。
  // 这个优先级一旦漂移，后面模板继承会非常难排查，所以要先用测试钉死。
  it("应该按 shared 在前、当前模板在后的顺序装配文件", async () => {
    const workspace = await createTempWorkspace("figame-template-assemble-");
    workspaces.push(workspace);

    await workspace.writeFiles({
      "templates/shared/src/main.tsx": "export const source = 'shared';\n",
      "templates/react-ts/template.manifest.json": JSON.stringify({
        id: "react-ts",
        label: "React TypeScript",
        runtime: "sandpack",
        extends: ["shared"],
        preview: {
          template: "react-ts",
          visibleFiles: ["/src/App.tsx", "/src/main.tsx"],
          activeFile: "/src/App.tsx",
          externalResources: ["https://cdn.tailwindcss.com"],
        },
      }),
      "templates/react-ts/src/App.tsx": "export default function App() { return null; }\n",
      "templates/react-ts/src/main.tsx": "export const source = 'template';\n",
    });

    const assembledTemplate = await assembleTemplate({
      templateId: "react-ts",
      templatesRoot: `${workspace.rootDir}\\templates`,
    });

    expect(Object.keys(assembledTemplate.files)).toEqual(
      expect.arrayContaining(["/src/App.tsx", "/src/main.tsx"]),
    );
    expect(assembledTemplate.files["/src/main.tsx"]?.code).toContain("template");
    expect(assembledTemplate.preview.activeFile).toBe("/src/App.tsx");
    expect(assembledTemplate.preview.visibleFiles).toEqual([
      "/src/App.tsx",
      "/src/main.tsx",
    ]);
  });
});

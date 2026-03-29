import { describe, expect, it } from "vitest";
import { buildFileTree } from "./build-file-tree";

describe("buildFileTree", () => {
  // 这条测试是为了锁住“平铺文件路径要先转成树结构”这个前提。
  // 只有树结构稳定了，左侧文件树的层级线和展开关系才不会乱掉。
  it("应该把扁平文件路径组装成带目录层级的树", () => {
    const tree = buildFileTree([
      "/src/App.tsx",
      "/src/components/panel.tsx",
      "/src/styles/app.css",
    ]);

    expect(tree).toHaveLength(1);
    expect(tree[0]?.name).toBe("src");
    expect(tree[0]?.children.map((item) => item.name)).toEqual([
      "App.tsx",
      "components",
      "styles",
    ]);
  });
});

import { describe, expect, it } from "vitest";
import { getEditorAutocompleteItems } from "./editor-autocomplete";

describe("getEditorAutocompleteItems", () => {
  // 这条测试是为了确保基础补全不是空壳，而是会按文件类型返回对应词条。
  // 这样就算还没接 LSP，写 React 和 CSS 时也至少有一层像样的编辑体验。
  it("应该为 tsx 文件提供 React 常用补全项", () => {
    const items = getEditorAutocompleteItems("/src/App.tsx");

    expect(items.some((item) => item.label === "className")).toBe(true);
    expect(items.some((item) => item.label === "useState")).toBe(true);
  });

  // 这条测试是为了锁住 CSS 基础体验，避免样式文件里完全没有属性建议。
  it("应该为 css 文件提供常用样式补全项", () => {
    const items = getEditorAutocompleteItems("/src/styles.css");

    expect(items.some((item) => item.label === "display")).toBe(true);
    expect(items.some((item) => item.label === "grid-template-columns")).toBe(
      true,
    );
  });
});

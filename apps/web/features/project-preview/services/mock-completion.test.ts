import { describe, expect, it } from "vitest";
import {
  applyMockCompletion,
  createMockCompletion,
} from "./mock-completion";

describe("mock completion", () => {
  // 这条测试是为了验证补全服务不是纯随机字符串，而是能根据当前文件给出稳定建议。
  // 后面即使从 mock 切到真实模型，也应该继续满足“先有结构化建议对象”的契约。
  it("应该为 React 页面文件生成可接受的补全建议", () => {
    const suggestion = createMockCompletion({
      filePath: "/src/App.tsx",
      code: "export default function App() {\n  return <main></main>;\n}\n",
      selection: {
        from: 58,
        to: 58,
      },
    });

    expect(suggestion).not.toBeNull();
    expect(suggestion?.label).toContain("Agent");
    expect(suggestion?.insertText).toContain("workspace-note");
  });

  // 这条测试是为了锁住“接受补全就是一次纯文本插入”这个核心行为。
  // 只要这个 helper 稳定，后面 Tab 接受、真实模型返回、甚至多段补全都可以复用它。
  it("应该把补全文本插入到指定选区", () => {
    const nextCode = applyMockCompletion({
      code: "const value = 1;\n",
      selection: {
        from: 16,
        to: 16,
      },
      insertText: "\nconst nextValue = value + 1;",
    });

    expect(nextCode).toContain("const value = 1;");
    expect(nextCode).toContain("const nextValue = value + 1;");
  });
});

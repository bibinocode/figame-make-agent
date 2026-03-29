export type MockCompletionSelection = {
  from: number;
  to: number;
};

export type MockCompletionRequest = {
  filePath: string;
  code: string;
  selection: MockCompletionSelection;
};

export type MockCompletionSuggestion = {
  label: string;
  detail: string;
  insertText: string;
};

type ApplyMockCompletionParams = {
  code: string;
  selection: MockCompletionSelection;
  insertText: string;
};

export function createMockCompletion(
  request: MockCompletionRequest,
): MockCompletionSuggestion | null {
  if (request.filePath.endsWith("/App.tsx")) {
    return {
      label: "Agent workspace note",
      detail: "补一个工作台说明区块，模拟 VS Code 风格的 AI 续写结果。",
      insertText: `
      <section className="workspace-note">
        <p className="workspace-note__eyebrow">Agent Suggestion</p>
        <p className="workspace-note__body">
          The workspace-note block was inserted from the mock completion flow.
        </p>
      </section>`,
    };
  }

  if (request.filePath.endsWith(".css")) {
    return {
      label: "Agent style token",
      detail: "补一个与工作台布局对应的样式片段。",
      insertText: `
.workspace-note {
  padding: 16px;
  border-radius: 18px;
  border: 1px solid rgba(15, 23, 42, 0.08);
}`,
    };
  }

  return {
    label: "Agent snippet",
    detail: "插入一个通用的 mock 代码片段。",
    insertText: "\n// Agent completion inserted by mock service.\n",
  };
}

export function applyMockCompletion({
  code,
  selection,
  insertText,
}: ApplyMockCompletionParams): string {
  return (
    code.slice(0, selection.from) +
    insertText +
    code.slice(selection.to)
  );
}

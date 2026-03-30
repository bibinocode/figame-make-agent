import {
  createSystemPromptBuilder,
  createUserPromptBuilder,
} from "../../shared/prompt-builders";

export const buildMocksSystemPrompt = createSystemPromptBuilder({
  role: "模拟数据助手",
  task: "规划 mock 数据文件，覆盖关键页面、列表状态和交互场景。",
  principles: [
    "优先覆盖主流程需要的空态、正常态和异常态。",
    "模拟数据结构必须严格遵循类型层定义。",
    "文件划分要便于页面和 Story 场景复用。",
  ],
  edgeCases: ["不要只给一份假数据，至少体现核心页面的不同状态。"],
  fewShot: `{
  "mockScenarios": [{"name": "emptyTodoState", "summary": "待办为空时的页面状态"}],
  "files": [{"path": "src/mocks/todo.ts", "purpose": "提供待办列表的模拟数据"}]
}`,
});

export const buildMocksUserPrompt = createUserPromptBuilder({
  objective: "产出模拟数据规划，支撑后续逻辑构建与页面搭建。",
});

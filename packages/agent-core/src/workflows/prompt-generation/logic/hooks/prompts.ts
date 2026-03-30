import {
  createSystemPromptBuilder,
  createUserPromptBuilder,
} from "../../shared/prompt-builders";

export const buildHooksSystemPrompt = createSystemPromptBuilder({
  role: "Hooks 设计助手",
  task: "规划页面和组件所需的 hooks，明确状态读取与事件编排方式。",
  principles: [
    "Hooks 只负责组合状态和交互，不重复承载领域服务本体。",
    "命名体现用途，例如 useTodoList、useTodoFilters。",
    "区分页面级 hooks 和可复用 hooks。",
  ],
  edgeCases: ["避免把纯工具函数误写成 hooks。"],
  fewShot: `{
  "hooks": [{"name": "useTodoBoard", "summary": "管理待办看板的状态与事件"}],
  "files": [{"path": "src/hooks/use-todo-board.ts", "purpose": "封装待办看板交互逻辑"}]
}`,
});

export const buildHooksUserPrompt = createUserPromptBuilder({
  objective: "产出 Hooks 层规划，连接业务逻辑与视图层。",
});

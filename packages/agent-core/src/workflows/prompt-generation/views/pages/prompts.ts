import {
  createSystemPromptBuilder,
  createUserPromptBuilder,
} from "../../shared/prompt-builders";

export const buildPagesSystemPrompt = createSystemPromptBuilder({
  role: "页面规划助手",
  task: "规划页面文件、页面职责和核心展示内容。",
  principles: [
    "页面结构必须与应用规划中的 routes 对齐。",
    "每个页面都要说明自身承担的核心业务内容。",
    "页面文件只承载页面装配职责，不吞没组件层细节。",
  ],
  edgeCases: ["多页面应用至少覆盖首页和主业务页。"],
  fewShot: `{
  "pages": [{"name": "TodoDashboardPage", "summary": "展示待办事项总览和分组列表"}],
  "files": [{"path": "src/pages/todo-dashboard.tsx", "purpose": "承载待办看板页面"}]
}`,
});

export const buildPagesUserPrompt = createUserPromptBuilder({
  objective: "产出页面层规划，明确页面职责与文件结构。",
});

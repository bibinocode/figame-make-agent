import {
  createSystemPromptBuilder,
  createUserPromptBuilder,
} from "../../shared/prompt-builders";

export const buildComponentsSystemPrompt = createSystemPromptBuilder({
  role: "组件规划助手",
  task: "拆出复用组件和局部组件，明确组件职责与文件边界。",
  principles: [
    "组件划分优先服务于复用性和职责清晰度。",
    "将容器型组件和展示型组件适度区分。",
    "组件文件要能与 hooks、样式和页面层顺畅组合。",
  ],
  edgeCases: ["不要只给一个大组件文件，要拆出核心复用组件。"],
  fewShot: `{
  "components": [{"name": "TodoCard", "summary": "展示单个待办事项的卡片组件"}],
  "files": [{"path": "src/components/todo-card.tsx", "purpose": "渲染待办事项卡片"}]
}`,
});

export const buildComponentsUserPrompt = createUserPromptBuilder({
  objective: "产出组件代码规划，明确复用组件与局部组件结构。",
});

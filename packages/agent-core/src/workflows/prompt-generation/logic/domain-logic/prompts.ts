import {
  createSystemPromptBuilder,
  createUserPromptBuilder,
} from "../../shared/prompt-builders";

export const buildDomainLogicSystemPrompt = createSystemPromptBuilder({
  role: "业务逻辑规划助手",
  task: "组织领域服务、状态流转和核心用例的文件结构。",
  principles: [
    "业务逻辑要围绕用户核心操作组织，不要和 UI 结构混杂。",
    "优先明确数据读取、计算、状态变更的职责边界。",
    "输出内容要能直接支撑 hooks 层和组件层。",
  ],
  edgeCases: ["如果应用简单，也要区分数据处理与界面展示逻辑。"],
  fewShot: `{
  "flows": [{"name": "createTodoFlow", "summary": "新增待办事项的业务流"}],
  "files": [{"path": "src/domain/todo-service.ts", "purpose": "封装待办事项业务逻辑"}]
}`,
});

export const buildDomainLogicUserPrompt = createUserPromptBuilder({
  objective: "产出业务逻辑层规划，明确服务模块和状态流转。",
});

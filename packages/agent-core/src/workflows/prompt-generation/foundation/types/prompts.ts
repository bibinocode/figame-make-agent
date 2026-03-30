import {
  createSystemPromptBuilder,
  createUserPromptBuilder,
} from "../../shared/prompt-builders";

export const buildTypesSystemPrompt = createSystemPromptBuilder({
  role: "类型设计助手",
  task: "为业务实体、页面视图模型和公共接口规划稳定的 TypeScript 类型文件。",
  principles: [
    "类型名称要语义清晰，并与应用规划中的实体保持一致。",
    "优先沉淀跨模块复用的类型，不要把实现细节混入类型层。",
    "输出文件路径要清晰，方便后续逻辑层直接引用。",
  ],
  edgeCases: ["如果业务实体较少，也要补齐列表项、表单项等必要视图模型。"],
  fewShot: `{
  "sharedTypes": [{"name": "TodoItem", "summary": "待办事项实体"}],
  "files": [{"path": "src/types/todo.ts", "purpose": "定义待办事项相关类型"}]
}`,
});

export const buildTypesUserPrompt = createUserPromptBuilder({
  objective: "产出类型层规划，为工具函数、业务逻辑和页面层提供数据契约。",
});

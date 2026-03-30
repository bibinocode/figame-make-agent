import {
  createSystemPromptBuilder,
  createUserPromptBuilder,
} from "../../shared/prompt-builders";

export const buildPlanSystemPrompt = createSystemPromptBuilder({
  role: "产品规划助手",
  task: "先把用户需求沉淀成产品规划、页面结构、领域实体和实现边界。",
  principles: [
    "优先输出产品目标、核心页面与业务对象，不要直接生成代码。",
    "命名保持稳定，保证后续类型、Hooks、页面层都能复用。",
    "当需求模糊时做保守假设，并把假设写入 implementationNotes。",
    "输出要能作为后续所有节点的统一上下文。",
  ],
  edgeCases: [
    "如果是简单应用，也至少给出首页和一个核心业务页面。",
    "不要臆造支付、权限、后台管理等用户未提及的能力。",
  ],
  fewShot: `{
  "appName": "任务协作面板",
  "summary": "一个用于查看和推进团队待办事项的轻量应用",
  "userGoals": ["快速创建和管理待办事项"],
  "targetUsers": ["小团队成员"],
  "routes": [{"id": "home", "title": "首页", "path": "/", "purpose": "查看待办总览"}]
}`,
});

export const buildPlanUserPrompt = createUserPromptBuilder({
  objective: "产出应用规划 JSON，作为后续节点的全局输入。",
  notes: ["聚焦产品层描述，不要提前写实现代码。"],
});

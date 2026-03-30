import {
  createSystemPromptBuilder,
  createUserPromptBuilder,
} from "../../shared/prompt-builders";

export const buildEntrySystemPrompt = createSystemPromptBuilder({
  role: "入口装配助手",
  task: "规划入口文件、路由挂载和应用初始化方式。",
  principles: [
    "入口文件要体现项目启动链路和根组件装配方式。",
    "路由或根布局初始化关系必须清晰。",
    "只规划入口与启动相关文件，不扩散回页面实现细节。",
  ],
  edgeCases: ["如果是单页面应用，也要明确 main.tsx 与 App.tsx 的装配关系。"],
  fewShot: `{
  "entryFiles": [{"path": "src/main.tsx", "purpose": "挂载应用根节点"}],
  "bootstrapNotes": ["在入口文件中加载全局样式和应用根组件"]
}`,
});

export const buildEntryUserPrompt = createUserPromptBuilder({
  objective: "产出入口文件规划，说明应用如何被组装和启动。",
});

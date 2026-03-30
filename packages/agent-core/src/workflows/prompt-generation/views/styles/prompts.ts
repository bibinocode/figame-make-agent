import {
  createSystemPromptBuilder,
  createUserPromptBuilder,
} from "../../shared/prompt-builders";

export const buildStylesSystemPrompt = createSystemPromptBuilder({
  role: "样式体系助手",
  task: "定义主题 token、全局样式和布局视觉约束。",
  principles: [
    "优先给出全局 token、颜色、间距和排版体系。",
    "样式规划要与组件和布局层紧密对应。",
    "保持界面克制、清爽，不增加无意义圆角和装饰。",
  ],
  edgeCases: ["不要只给一个 styles.css，要说明主题与全局样式职责。"],
  fewShot: `{
  "styleTokens": [{"name": "surfacePanel", "summary": "工作台面板背景色 token"}],
  "files": [{"path": "src/styles/tokens.css", "purpose": "定义全局设计 token"}]
}`,
});

export const buildStylesUserPrompt = createUserPromptBuilder({
  objective: "产出全局样式规划，明确 token、基础样式和视觉约束。",
});

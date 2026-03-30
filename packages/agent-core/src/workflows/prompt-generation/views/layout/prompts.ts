import {
  createSystemPromptBuilder,
  createUserPromptBuilder,
} from "../../shared/prompt-builders";

export const buildLayoutSystemPrompt = createSystemPromptBuilder({
  role: "布局规划助手",
  task: "规划全局壳层、导航、侧栏和页面容器布局。",
  principles: [
    "布局组件负责骨架和区域组织，不承载业务计算。",
    "页面共享结构尽量下沉到布局层，避免页面重复装配。",
    "保持 IDE 风格工作台的区域职责清晰。",
  ],
  edgeCases: ["如果页面只有一个主视图，也要明确全局壳层和内容容器关系。"],
  fewShot: `{
  "layouts": [{"name": "WorkbenchLayout", "summary": "提供左侧工作区和右侧对话区的双栏布局"}],
  "files": [{"path": "src/layouts/workbench-layout.tsx", "purpose": "定义应用主布局"}]
}`,
});

export const buildLayoutUserPrompt = createUserPromptBuilder({
  objective: "产出布局层规划，整理壳层、导航与内容容器。",
});

import {
  createSystemPromptBuilder,
  createUserPromptBuilder,
} from "../../shared/prompt-builders";

export const buildAssemblySystemPrompt = createSystemPromptBuilder({
  role: "项目组装助手",
  task: "汇总所有文件结构，给出最终项目组装结果。",
  principles: [
    "最终文件清单必须覆盖前面各节点产物。",
    "每个文件都要有清晰的 kind 与 summary，方便后续生成代码。",
    "总文件数、根文件和备注信息要完整。",
  ],
  edgeCases: ["不要遗漏入口、全局样式和布局文件。"],
  fewShot: `{
  "files": [{"path": "src/main.tsx", "kind": "entry", "summary": "应用启动入口"}],
  "totalFiles": 12,
  "rootFiles": ["src/main.tsx", "src/App.tsx"]
}`,
});

export const buildAssemblyUserPrompt = createUserPromptBuilder({
  objective: "产出项目组装清单，形成完整文件蓝图。",
});

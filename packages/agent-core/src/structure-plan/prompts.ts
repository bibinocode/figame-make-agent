import { appendJsonSafety } from "../workflows/prompt-generation/shared/json-safety";

export function buildWorkflowStructureSystemPrompt() {
  return appendJsonSafety(`
你是一个项目结构规划助手。

你的任务是把页面、组件和数据模型映射成可执行的文件清单。

输出要求：
1. 为每个文件定义 path、kind、description、sourceCorrelation、generatedBy。
2. 明确后续代码生成使用的 routingTable。
3. 固定关键基础文件策略。
4. 所有文本 value 使用中文。
`);
}

type BuildWorkflowStructureUserPromptOptions = {
  uiJson: string;
  componentContractsJson: string;
  capabilitiesJson: string;
};

export function buildWorkflowStructureUserPrompt(
  options: BuildWorkflowStructureUserPromptOptions,
) {
  return [
    "请根据以下规划产物输出结构规划：",
    `UI 架构：\n${options.uiJson}`,
    `组件契约：\n${options.componentContractsJson}`,
    `能力蓝图：\n${options.capabilitiesJson}`,
    "如果上游核心输入缺失，应返回 null；否则只返回严格 JSON。",
  ].join("\n\n");
}

import { appendJsonSafety } from "../workflows/prompt-generation/shared/json-safety";

export function buildWorkflowUiSystemPrompt() {
  return appendJsonSafety(`
你是一个 UI 框架规划助手。

你的任务是把产品意图与能力蓝图转换成可执行的 UI 框架蓝图。

输出要求：
1. 产出页面路由、页面布局、分区、组件清单、主题策略。
2. 强制建立组件与行为、数据模型之间的绑定关系。
3. 优先规划 MVP 所需界面，不要扩展用户未要求的复杂设计。
4. 所有文本 value 使用中文。
`);
}

type BuildWorkflowUiUserPromptOptions = {
  capabilitiesJson: string;
  intentJson?: string;
  designAnalysis?: string | null;
};

export function buildWorkflowUiUserPrompt(
  options: BuildWorkflowUiUserPromptOptions,
) {
  return [
    "以下是能力蓝图，请基于它规划 UI 架构：",
    options.capabilitiesJson,
    options.intentJson ? `产品意图补充：\n${options.intentJson}` : "",
    options.designAnalysis ? `视觉偏好补充：${options.designAnalysis}` : "",
    "如果上游 capabilities 缺失，应返回 null；否则只返回严格 JSON。",
  ]
    .filter(Boolean)
    .join("\n\n");
}

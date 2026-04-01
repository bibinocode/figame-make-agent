import { appendJsonSafety } from "../workflows/prompt-generation/shared/json-safety";

export function buildWorkflowComponentContractsSystemPrompt() {
  return appendJsonSafety(`
你是一个业务组件契约设计助手。

你的任务是把 UI 架构中的组件节点转换成可编码的组件契约。

输出要求：
1. 为每个业务组件定义 componentId、props、events、dataDependencies。
2. 组件命名必须业务具名化，避免 Table、Form、Button 这类泛名。
3. 组件必须绑定到具体行为和数据模型。
4. 所有文本 value 使用中文。
`);
}

type BuildWorkflowComponentContractsUserPromptOptions = {
  uiJson: string;
  capabilitiesJson: string;
  intentJson?: string;
};

export function buildWorkflowComponentContractsUserPrompt(
  options: BuildWorkflowComponentContractsUserPromptOptions,
) {
  return [
    "以下是 UI 架构，请将其中业务组件转成组件契约：",
    options.uiJson,
    `能力蓝图补充：\n${options.capabilitiesJson}`,
    options.intentJson ? `产品目标补充：\n${options.intentJson}` : "",
    "如果上游 ui 缺失，应返回 null；否则只返回严格 JSON。",
  ]
    .filter(Boolean)
    .join("\n\n");
}

import { appendJsonSafety } from "../workflows/prompt-generation/shared/json-safety";

export function buildWorkflowCapabilitiesSystemPrompt() {
  return appendJsonSafety(`
你是一个 MVP 能力蓝图规划助手。

你的任务是把产品层意图翻译成可落地的 MVP 技术蓝图，但不要写实现代码。

输出要求：
1. 产出 pages、behaviors、dataModels 三类结构化结果。
2. 明确页面、行为、数据模型之间的闭环关系。
3. 只保留实现 MVP 必需的能力，不要扩展到用户未明确要求的复杂系统。
4. 命名保持稳定，方便后续 UI、组件、类型与代码生成复用。
5. 所有文本 value 使用中文。

闭环约束：
1. 每个页面必须声明 coreBehaviors 和 relatedDataModels。
2. 每个行为必须声明发生在哪些 pages、操作哪些 dataModels。
3. 每个数据模型必须回指 usedByPages 和 usedByBehaviors。

字段要求：
1. pages 中使用 title 和 purpose，不要使用 name 和 description 替代。
2. behaviors 中使用 summary，不要只给 description。
3. dataModels.fields 中每个字段都必须包含 name、type、required、summary。
`);
}

type BuildWorkflowCapabilitiesUserPromptOptions = {
  intentJson: string;
};

export function buildWorkflowCapabilitiesUserPrompt(
  options: BuildWorkflowCapabilitiesUserPromptOptions,
) {
  return [
    "以下是上游产品意图，请把它翻译成 MVP 能力蓝图：",
    options.intentJson,
    "如果上游意图缺失，应返回 null；否则只返回严格 JSON。",
  ].join("\n\n");
}

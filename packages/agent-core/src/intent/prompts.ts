import { appendJsonSafety } from "../workflows/prompt-generation/shared/json-safety";

export function buildWorkflowIntentSystemPrompt() {
  return appendJsonSafety(`
你是一个产品意图分析助手。

你的任务是从用户需求中抽取产品层意图，而不是技术实现方案。

核心规则：
1. 只关注做什么产品、解决什么问题、给谁用。
2. 不要涉及技术选型、框架、语言、接口、数据库、后端、模型实现方式。
3. 不要臆造用户未明确表达的功能。
4. 如果描述模糊，给出保守且通用的产品理解。
5. 所有输出 value 使用中文。

输出结构：
- product
- goals
- nonGoals
- assumptions
- category

额外要求：
1. 顶层必须是 JSON 对象或 null，不要输出字符串化 JSON。
2. 不要把整个对象包在引号里。
3. product 必须是对象，包含 name、description、targetUsers、primaryScenario。
4. goals 必须是对象，包含 primary 和 secondary，不要直接输出数组。
`);
}

type BuildWorkflowIntentUserPromptOptions = {
  analysisSummary: string;
  analysisTags: string[];
  designAnalysis: string | null;
};

export function buildWorkflowIntentUserPrompt(
  options: BuildWorkflowIntentUserPromptOptions,
) {
  return [
    `需求分析摘要：${options.analysisSummary}`,
    `关键标签：${options.analysisTags.join("、") || "无"}`,
    options.designAnalysis
      ? `设计诉求补充：${options.designAnalysis}`
      : "设计诉求补充：无",
    "请将以上信息进一步抽象为产品层意图，只返回严格 JSON。",
  ].join("\n\n");
}

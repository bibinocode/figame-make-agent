import { appendJsonSafety } from "../workflows/prompt-generation/shared/json-safety";

export function buildWorkflowAnalysisSystemPrompt() {
  return appendJsonSafety(`
你是一个 AI 驱动的全栈应用构建专家和需求分析师。
你的任务是把用户最新输入中的非结构化需求，转换为结构化的需求分析结果。

核心目标：
1. 判断用户意图属于 CREATE、MODIFY、QA 还是 CHIT_CHAT。
2. 用中文总结需求，提炼 3-5 个标签。
3. 判断复杂度是 SIMPLE、MEDIUM 还是 COMPLEX。
4. 如果用户在文字里提到了界面风格、视觉方向、设计要求，提炼为 designAnalysis；否则返回 null。

约束：
1. 以用户最新文本输入为主，不要臆造未提及的信息。
2. 不要分析图片内容；即使存在设计稿，也只分析用户文字中的设计诉求。
3. summary 和 tags 使用中文，专有名词可保留英文。
4. JSON 中的字段名必须使用 type，不要使用 intent。
5. designAnalysis 必须是字符串或 null，不要输出对象。
6. 输出必须是严格 JSON。
`);
}

type BuildWorkflowAnalysisUserPromptOptions = {
  userInput: string;
  contextNotes?: string[];
};

export function buildWorkflowAnalysisUserPrompt(
  options: BuildWorkflowAnalysisUserPromptOptions,
) {
  return [
    `用户最新输入：${options.userInput}`,
    options.contextNotes && options.contextNotes.length > 0
      ? ["补充上下文：", ...options.contextNotes.map((note) => `- ${note}`)].join(
          "\n",
        )
      : "",
    "请只返回符合 WorkflowAnalysisSchema 的 JSON。",
  ]
    .filter(Boolean)
    .join("\n\n");
}

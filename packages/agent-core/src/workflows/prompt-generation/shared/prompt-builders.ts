import { appendJsonSafety } from "./json-safety";
import type { PromptGenerationNodePromptContext } from "./node-types";

function stringifyArtifactData(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function buildDependencySection(context: PromptGenerationNodePromptContext) {
  if (context.dependencyArtifacts.length === 0) {
    return "前置产物：无";
  }

  return [
    "前置产物：",
    ...context.dependencyArtifacts.map((artifact) =>
      [
        `- artifactKey: ${artifact.key}`,
        `- sourceStepId: ${artifact.sourceStepId}`,
        `- data: ${stringifyArtifactData(artifact.data)}`,
      ].join("\n"),
    ),
  ].join("\n\n");
}

function buildDesignContextSection(context: PromptGenerationNodePromptContext) {
  const designContext = context.workflow.designContext;

  if (!designContext) {
    return "";
  }

  return [
    "设计上下文：",
    `- source: ${designContext.source}`,
    `- query: ${designContext.query}`,
    `- styleName: ${designContext.styleName}`,
    `- styleKeywords: ${designContext.styleKeywords.join("、")}`,
    `- typography.body: ${designContext.typography.body}`,
    `- typography.mono: ${designContext.typography.mono}`,
    `- colors: ${JSON.stringify(designContext.colors)}`,
    `- motion: ${JSON.stringify(designContext.motion)}`,
    "设计规则：",
    ...designContext.rules.map((rule, index) => `${index + 1}. ${rule}`),
  ].join("\n");
}

type CreateSystemPromptBuilderOptions = {
  role: string;
  task: string;
  principles: string[];
  edgeCases?: string[];
  fewShot?: string;
};

export function createSystemPromptBuilder(
  options: CreateSystemPromptBuilderOptions,
) {
  return (context: PromptGenerationNodePromptContext) => {
    const sections = [
      `你是 Figame 的${options.role}。`,
      `当前阶段：${context.stepNode.phaseId}`,
      `当前节点：${context.stepNode.title}`,
      `节点目标：${context.stepNode.goal}`,
      `当前任务：${options.task}`,
      buildDesignContextSection(context),
      [
        "核心原则：",
        ...options.principles.map((item, index) => `${index + 1}. ${item}`),
      ].join("\n"),
      options.edgeCases && options.edgeCases.length > 0
        ? [
            "边界处理：",
            ...options.edgeCases.map((item, index) => `${index + 1}. ${item}`),
          ].join("\n")
        : "",
      options.fewShot ? `少样本示例：\n${options.fewShot}` : "",
      `输出要求：只输出 ${context.stepNode.outputArtifactKey} 对应的严格 JSON。`,
    ].filter(Boolean);

    return appendJsonSafety(sections.join("\n\n"));
  };
}

type CreateUserPromptBuilderOptions = {
  objective: string;
  notes?: string[];
};

export function createUserPromptBuilder(
  options: CreateUserPromptBuilderOptions,
) {
  return (context: PromptGenerationNodePromptContext) =>
    [
      `用户原始需求：${context.userPrompt}`,
      `当前工作流 ID：${context.workflow.workflowMeta.workflowId}`,
      `当前节点输出键：${context.stepNode.outputArtifactKey}`,
      `当前节点目标：${options.objective}`,
      buildDesignContextSection(context),
      buildDependencySection(context),
      context.retryInstruction ? `修正要求：${context.retryInstruction}` : "",
      options.notes && options.notes.length > 0
        ? ["补充要求：", ...options.notes.map((note) => `- ${note}`)].join("\n")
        : "",
      "请只返回当前节点需要的 JSON，不要输出解释文字。",
    ]
      .filter(Boolean)
      .join("\n\n");
}

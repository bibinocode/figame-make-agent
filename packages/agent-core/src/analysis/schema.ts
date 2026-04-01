import { z } from "zod";

const ANALYSIS_TYPE_ALIASES: Record<string, string> = {
  CREATE: "CREATE",
  CREATE_APP: "CREATE",
  CREATE_APPLICATION: "CREATE",
  CREATE_FROM_PROMPT: "CREATE",
  CREATE_FROM_SCRATCH: "CREATE",
  APP_CREATE: "CREATE",
  BUILD: "CREATE",
  GENERATE: "CREATE",
  NEW: "CREATE",
  创建: "CREATE",
  新建: "CREATE",
  生成应用: "CREATE",
  创建应用: "CREATE",
  MODIFY: "MODIFY",
  MODIFY_APP: "MODIFY",
  MODIFY_EXISTING_PROJECT: "MODIFY",
  MODIFY_PROJECT: "MODIFY",
  EDIT: "MODIFY",
  UPDATE: "MODIFY",
  FIX: "MODIFY",
  REFACTOR: "MODIFY",
  修改: "MODIFY",
  编辑: "MODIFY",
  更新: "MODIFY",
  优化: "MODIFY",
  修复: "MODIFY",
  重构: "MODIFY",
  QA: "QA",
  Q_A: "QA",
  QUESTION: "QA",
  QUESTIONS: "QA",
  ASK: "QA",
  QUESTION_ANSWER: "QA",
  问答: "QA",
  咨询: "QA",
  提问: "QA",
  问题: "QA",
  答疑: "QA",
  CHAT: "CHIT_CHAT",
  CHIT_CHAT: "CHIT_CHAT",
  CHITCHAT: "CHIT_CHAT",
  SMALL_TALK: "CHIT_CHAT",
  闲聊: "CHIT_CHAT",
  聊天: "CHIT_CHAT",
  寒暄: "CHIT_CHAT",
  打招呼: "CHIT_CHAT",
};

const ANALYSIS_COMPLEXITY_ALIASES: Record<string, string> = {
  SIMPLE: "SIMPLE",
  EASY: "SIMPLE",
  LOW: "SIMPLE",
  简单: "SIMPLE",
  低: "SIMPLE",
  MEDIUM: "MEDIUM",
  MODERATE: "MEDIUM",
  NORMAL: "MEDIUM",
  中等: "MEDIUM",
  普通: "MEDIUM",
  COMPLEX: "COMPLEX",
  HARD: "COMPLEX",
  HIGH: "COMPLEX",
  复杂: "COMPLEX",
  高: "COMPLEX",
};

function normalizeAnalysisEnumValue(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.trim().toUpperCase().replace(/[\s-]+/g, "_");

  if (normalized === "CHITCHAT") {
    return "CHIT_CHAT";
  }

  return normalized;
}

function normalizeAnalysisTypeValue(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  const raw = value.trim();
  const normalized = normalizeAnalysisEnumValue(value);

  if (typeof normalized !== "string") {
    return normalized;
  }

  if (ANALYSIS_TYPE_ALIASES[raw]) {
    return ANALYSIS_TYPE_ALIASES[raw];
  }

  if (ANALYSIS_TYPE_ALIASES[normalized]) {
    return ANALYSIS_TYPE_ALIASES[normalized];
  }

  if (
    normalized.includes("CREATE") ||
    /创建|新建|生成|搭建|开发/.test(raw)
  ) {
    return "CREATE";
  }

  if (
    normalized.includes("MODIFY") ||
    normalized.includes("UPDATE") ||
    normalized.includes("EDIT") ||
    /修改|更新|编辑|优化|修复|重构/.test(raw)
  ) {
    return "MODIFY";
  }

  if (
    normalized.includes("QA") ||
    normalized.includes("QUESTION") ||
    /问答|咨询|提问|问题|答疑/.test(raw)
  ) {
    return "QA";
  }

  if (
    normalized.includes("CHAT") ||
    /闲聊|聊天|寒暄|打招呼/.test(raw)
  ) {
    return "CHIT_CHAT";
  }

  return normalized;
}

function normalizeAnalysisComplexityValue(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  const raw = value.trim();
  const normalized = normalizeAnalysisEnumValue(value);

  if (typeof normalized !== "string") {
    return normalized;
  }

  if (ANALYSIS_COMPLEXITY_ALIASES[raw]) {
    return ANALYSIS_COMPLEXITY_ALIASES[raw];
  }

  if (ANALYSIS_COMPLEXITY_ALIASES[normalized]) {
    return ANALYSIS_COMPLEXITY_ALIASES[normalized];
  }

  if (normalized.includes("SIMPLE") || /简单|低/.test(raw)) {
    return "SIMPLE";
  }

  if (
    normalized.includes("MEDIUM") ||
    normalized.includes("MODERATE") ||
    /中等|普通|适中/.test(raw)
  ) {
    return "MEDIUM";
  }

  if (normalized.includes("COMPLEX") || /复杂|高/.test(raw)) {
    return "COMPLEX";
  }

  return normalized;
}

function normalizeDesignAnalysisValue(value: unknown) {
  if (value === null || typeof value === "string") {
    return value;
  }

  if (typeof value !== "object") {
    return null;
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .map(([key, entryValue]) => {
      if (entryValue === null || entryValue === undefined) {
        return null;
      }

      if (Array.isArray(entryValue)) {
        const items = entryValue
          .map((item) => (typeof item === "string" ? item.trim() : ""))
          .filter(Boolean);

        return items.length > 0 ? `${key}: ${items.join("、")}` : null;
      }

      if (typeof entryValue === "string") {
        const trimmed = entryValue.trim();
        return trimmed ? `${key}: ${trimmed}` : null;
      }

      return null;
    })
    .filter((item): item is string => Boolean(item));

  return entries.length > 0 ? entries.join("；") : null;
}

function normalizeAnalysisObject(value: unknown) {
  if (typeof value !== "object" || value === null) {
    return value;
  }

  const candidate = { ...(value as Record<string, unknown>) };

  if (candidate.type === undefined && candidate.intent !== undefined) {
    candidate.type = candidate.intent;
  }

  if (candidate.designAnalysis !== undefined) {
    candidate.designAnalysis = normalizeDesignAnalysisValue(
      candidate.designAnalysis,
    );
  }

  return candidate;
}

export const WorkflowAnalysisTypeSchema = z.enum([
  "CREATE",
  "MODIFY",
  "QA",
  "CHIT_CHAT",
]);

export const WorkflowAnalysisComplexitySchema = z.enum([
  "SIMPLE",
  "MEDIUM",
  "COMPLEX",
]);

export const WorkflowAnalysisSchema = z.preprocess(
  normalizeAnalysisObject,
  z.object({
    type: z.preprocess(
      normalizeAnalysisTypeValue,
      WorkflowAnalysisTypeSchema,
    ).describe("用户的意图类型：创建新应用、修改现有应用、提问或闲聊"),
    summary: z.string().describe("针对用户需求的简要总结"),
    tags: z.array(z.string()).describe("相关的技术标签或关键词"),
    complexity: z.preprocess(
      normalizeAnalysisComplexityValue,
      WorkflowAnalysisComplexitySchema,
    ).describe("评估任务的复杂度"),
    designAnalysis: z
      .string()
      .nullable()
      .describe(
        "如果用户提到了设计相关需求，请简要描述设计意图；否则为 null。只分析文字描述，不分析图片内容。",
      ),
  }),
);

export type WorkflowAnalysisType = z.infer<typeof WorkflowAnalysisTypeSchema>;
export type WorkflowAnalysisComplexity = z.infer<
  typeof WorkflowAnalysisComplexitySchema
>;
export type WorkflowAnalysisResult = z.infer<typeof WorkflowAnalysisSchema>;

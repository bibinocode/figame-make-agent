/** 模型支持商 */
export type ProviderId = "minimax" | "deepseek" | "openai";

/** 模型能力 */
export type ModelCapability = "chat" | "structured" | "embedding" | "vision";

export type ProfileId =
  | "main"
  | "planner"
  | "structured"
  | "fast"
  | "vision"
  | "embedding";

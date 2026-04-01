import type { WorkflowAnalysisResult } from "./schema";

export function shouldSkipGeneration(result: WorkflowAnalysisResult) {
  return result.type === "QA" || result.type === "CHIT_CHAT";
}

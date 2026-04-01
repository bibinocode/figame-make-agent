import {
  buildWorkflowAnalysisSystemPrompt,
  buildWorkflowAnalysisUserPrompt,
  WorkflowAnalysisSchema,
} from "../../../../analysis";
import { createPromptGenerationStepNode } from "../../shared/create-step-node";

export const promptGenerationAnalysisNode = createPromptGenerationStepNode({
  id: "analysis",
  phaseId: "planning",
  title: "需求分析",
  goal: "提炼用户需求、判断意图类型，并决定是否继续后续生成。",
  dependsOn: [],
  inputArtifactKeys: [],
  outputArtifactKey: "analysis",
  maxAttempts: 3,
  schema: WorkflowAnalysisSchema,
  buildSystemPrompt: () => buildWorkflowAnalysisSystemPrompt(),
  buildUserPrompt: (context) =>
    buildWorkflowAnalysisUserPrompt({
      userInput: context.userPrompt,
      contextNotes: context.workflow.designContext
        ? [
            `当前工作流意图是 ${context.workflow.workflowMeta.intent}，目标是继续完成应用生成。`,
            `当前工作流包含设计上下文，来源为 ${context.workflow.designContext.source}。`,
            `风格关键词：${context.workflow.designContext.styleKeywords.join("、")}`,
          ]
        : [`当前工作流意图是 ${context.workflow.workflowMeta.intent}，目标是继续完成应用生成。`],
    }),
});

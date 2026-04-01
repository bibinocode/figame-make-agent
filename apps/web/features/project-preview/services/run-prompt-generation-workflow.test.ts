import {
  createInitialPromptGenerationWorkflowState,
  PROMPT_GENERATION_STEP_NODES,
  WorkflowAnalysisSchema,
} from "@figame/agent-core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  WorkbenchChatMessage,
  WorkbenchRouteContext,
} from "../state/workbench-routing-types";

vi.mock("./generate-structured-workflow-step", () => ({
  generateStructuredWorkflowStep: vi.fn(),
}));

import { generateStructuredWorkflowStep } from "./generate-structured-workflow-step";
import { runPromptGenerationWorkflow } from "./run-prompt-generation-workflow";

const mockedGenerateStructuredWorkflowStep = vi.mocked(
  generateStructuredWorkflowStep,
);

function createRouteContext(): WorkbenchRouteContext {
  return {
    activeFilePath: undefined,
    activeFlowId: "create-from-prompt",
    intent: "create_from_prompt",
    profile: "local",
    provider: "ollama",
    sourceKinds: ["prompt"],
  };
}

describe("runPromptGenerationWorkflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts with the shared analysis step and wires plan to depend on it", () => {
    const workflow =
      createInitialPromptGenerationWorkflowState("做一个任务管理后台");
    const planStep = PROMPT_GENERATION_STEP_NODES.find(
      (node) => node.id === "plan",
    );
    const intentStep = PROMPT_GENERATION_STEP_NODES.find(
      (node) => node.id === "intent",
    );
    const capabilitiesStep = PROMPT_GENERATION_STEP_NODES.find(
      (node) => node.id === "capabilities",
    );

    expect(workflow.workflowMeta.currentStepId).toBe("analysis");
    expect(workflow.steps[0]?.id).toBe("analysis");
    expect(workflow.steps[1]?.id).toBe("intent");
    expect(workflow.steps[2]?.id).toBe("capabilities");
    expect(intentStep?.inputArtifactKeys).toContain("analysis");
    expect(planStep?.inputArtifactKeys).toContain("intent");
    expect(planStep?.inputArtifactKeys).toContain("capabilities");
    expect(capabilitiesStep?.inputArtifactKeys).toContain("intent");
  });

  it("returns null intent and null capabilities before blocking the rest when analysis classifies the request as QA", async () => {
    mockedGenerateStructuredWorkflowStep.mockResolvedValueOnce(
      JSON.stringify({
        type: "QA",
        summary: "用户在咨询如何实现需求分析模块。",
        tags: ["需求分析", "规划", "工作流"],
        complexity: "SIMPLE",
        designAnalysis: null,
      }),
    );

    const workflowStates: unknown[] = [];
    const messageUpdates: Array<
      Partial<Omit<WorkbenchChatMessage, "createdAt" | "id" | "role">>
    > = [];

    const result = await runPromptGenerationWorkflow({
      messageText: "需求分析模块应该怎么设计？",
      routeContext: createRouteContext(),
      setPromptGenerationWorkflow: (value) => {
        workflowStates.push(value);
      },
      updateMessage: (_id, value) => {
        messageUpdates.push(value);
      },
      workflowMessageId: "workflow-test",
    });

    expect(mockedGenerateStructuredWorkflowStep).toHaveBeenCalledTimes(1);
    expect(mockedGenerateStructuredWorkflowStep).toHaveBeenCalledWith(
      expect.objectContaining({
        stepId: "analysis",
      }),
    );
    expect(
      (result.workflow.workflowMeta as { skipGeneration?: boolean })
        .skipGeneration,
    ).toBe(true);
    expect(result.workflow.artifacts.intent?.data).toBeNull();
    expect(result.workflow.artifacts.capabilities?.data).toBeNull();
    expect(
      result.workflow.steps.find((step) => step.id === "intent")?.status,
    ).toBe("completed");
    expect(
      result.workflow.steps.find((step) => step.id === "capabilities")?.status,
    ).toBe("completed");
    expect(
      result.workflow.steps
        .filter(
          (step) => !["analysis", "intent", "capabilities"].includes(step.id),
        )
        .every((step) => step.status === "blocked"),
    ).toBe(true);
    expect(result.finalMessage).toContain("跳过");
    expect(workflowStates.length).toBeGreaterThan(0);
    expect(messageUpdates.at(-1)?.status).toBe("done");
  });

  it("accepts lowercase analysis enums from the model by normalizing them before validation", async () => {
    mockedGenerateStructuredWorkflowStep.mockResolvedValueOnce(
      JSON.stringify({
        type: "qa",
        summary: "用户在咨询需求分析类型字段的取值。",
        tags: ["需求分析", "类型", "工作流"],
        complexity: "simple",
        designAnalysis: null,
      }),
    );

    const result = await runPromptGenerationWorkflow({
      messageText: "analysis 的 type 为什么会报错？",
      routeContext: createRouteContext(),
      setPromptGenerationWorkflow: () => {},
      updateMessage: () => {},
      workflowMessageId: "workflow-normalized-analysis",
    });

    expect(result.workflow.artifacts.analysis?.data).toMatchObject({
      type: "QA",
      complexity: "SIMPLE",
    });
  });

  it("accepts common analysis intent variants from the model by mapping them to canonical enums", () => {
    const result = WorkflowAnalysisSchema.safeParse({
      type: "create_from_prompt",
      summary: "创建一个任务管理后台。",
      tags: ["任务管理", "后台", "列表"],
      complexity: "moderate",
      designAnalysis: null,
    });

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      type: "CREATE",
      complexity: "MEDIUM",
    });
  });
});

import {
  applyPromptGenerationWorkflowUpdate,
  buildPromptGenerationRetryInstruction,
  createInitialPromptGenerationWorkflowState,
  getPromptGenerationArtifactSchema,
  parseStructuredOutput,
  PROMPT_GENERATION_STEP_NODES,
  type PromptGenerationArtifactEnvelope,
  type PromptGenerationArtifactKey,
  type PromptGenerationPhaseState,
  type PromptGenerationStepNode,
  type PromptGenerationStepId,
  type PromptGenerationStepState,
  type PromptGenerationWorkflowPatch,
  type PromptGenerationWorkflowState,
} from "@figame/agent-core";
import { generateStructuredWorkflowStep } from "./generate-structured-workflow-step";
import type {
  WorkbenchChatMessage,
  WorkbenchRouteContext,
} from "../state/workbench-routing-types";

type RunPromptGenerationWorkflowOptions = {
  activeFilePath?: string;
  messageText: string;
  routeContext: WorkbenchRouteContext;
  setPromptGenerationWorkflow: (
    value: PromptGenerationWorkflowState | null,
  ) => void;
  workflowMessageId: string;
  updateMessage: (
    id: string,
    value: Partial<Omit<WorkbenchChatMessage, "createdAt" | "id" | "role">>,
  ) => void;
};

type WorkflowArtifact = PromptGenerationArtifactEnvelope;
type WorkflowArtifactMap = PromptGenerationWorkflowState["artifacts"];

function isArtifactEnvelope(
  value: WorkflowArtifactMap[PromptGenerationArtifactKey] | undefined,
): value is WorkflowArtifact {
  return Boolean(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getArtifactRecord(artifact?: WorkflowArtifact) {
  return isRecord(artifact?.data) ? artifact.data : null;
}

function getStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function getFilePaths(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) =>
      isRecord(item) && typeof item.path === "string" ? item.path : null,
    )
    .filter((item): item is string => Boolean(item));
}

function updateWorkflowStep(
  workflow: PromptGenerationWorkflowState,
  stepId: PromptGenerationStepId,
  updater: (
    current: PromptGenerationWorkflowState["steps"][number],
  ) => PromptGenerationWorkflowState["steps"][number],
) {
  return {
    ...workflow,
    steps: workflow.steps.map((step) => (step.id === stepId ? updater(step) : step)),
  };
}

function updatePhaseStatus(workflow: PromptGenerationWorkflowState) {
  const phases = workflow.phases.map((phase: PromptGenerationPhaseState) => {
    const relatedSteps = workflow.steps.filter((step) => step.phaseId === phase.id);

    if (relatedSteps.some((step) => step.status === "failed")) {
      return {
        ...phase,
        status: "failed" as const,
      };
    }

    if (relatedSteps.every((step) => step.status === "completed")) {
      return {
        ...phase,
        status: "completed" as const,
      };
    }

    if (relatedSteps.some((step) => step.status === "running")) {
      return {
        ...phase,
        status: "running" as const,
      };
    }

    return {
      ...phase,
      status: "pending" as const,
    };
  });

  return {
    ...workflow,
    phases,
  };
}

function buildSummaryPatch(
  workflow: PromptGenerationWorkflowState,
  artifact: WorkflowArtifact,
): PromptGenerationWorkflowPatch["summary"] {
  const artifactData = getArtifactRecord(artifact);
  const summary: PromptGenerationWorkflowPatch["summary"] = {
    completedStepCount: workflow.steps.filter((step) => step.status === "completed")
      .length,
  };

  if (artifact.key === "plan" && artifactData && typeof artifactData.appName === "string") {
    summary.appName = artifactData.appName;
  }

  if (artifact.key === "entrySpec" && artifactData) {
    summary.entryFiles = getFilePaths(artifactData.entryFiles);
  }

  if (artifact.key === "assemblySpec" && artifactData) {
    if (typeof artifactData.totalFiles === "number") {
      summary.totalFiles = artifactData.totalFiles;
    }

    if (!summary.entryFiles?.length) {
      summary.entryFiles = getStringArray(artifactData.rootFiles);
    }
  }

  return summary;
}

function markStepRunning(
  workflow: PromptGenerationWorkflowState,
  stepNode: PromptGenerationStepNode,
  attemptCount: number,
) {
  const now = new Date().toISOString();
  const nextWorkflow = updatePhaseStatus(
    updateWorkflowStep(workflow, stepNode.id, (current) => ({
      ...current,
      attemptCount,
      lastError: null,
      startedAt: current.startedAt ?? now,
      completedAt: null,
      status: "running",
    })),
  );

  const nextStatus =
    stepNode.id === "plan"
      ? "planning"
      : attemptCount > 1
        ? "retrying"
        : "running";

  return applyPromptGenerationWorkflowUpdate(workflow, {
    phases: nextWorkflow.phases,
    steps: nextWorkflow.steps,
    workflowMeta: {
      currentPhaseId: stepNode.phaseId,
      currentStepId: stepNode.id,
      status: nextStatus,
      updatedAt: now,
    },
  });
}

function buildStepPreview(stepNode: PromptGenerationStepNode, artifact?: WorkflowArtifact) {
  if (!artifact) {
    return `正在执行「${stepNode.title}」节点。`;
  }

  const artifactData = getArtifactRecord(artifact);

  if (artifact.key === "plan") {
    const appName =
      artifactData && typeof artifactData.appName === "string"
        ? artifactData.appName
        : "未命名应用";
    const routeCount =
      artifactData && Array.isArray(artifactData.routes) ? artifactData.routes.length : 0;

    return `规划完成，应用名为「${appName}」，共 ${routeCount} 个页面。`;
  }

  if (artifactData && Array.isArray(artifactData.files)) {
    return `${stepNode.title}已完成，当前规划了 ${artifactData.files.length} 个文件。`;
  }

  if (artifactData && Array.isArray(artifactData.entryFiles)) {
    return `${stepNode.title}已完成，入口文件数量 ${artifactData.entryFiles.length}。`;
  }

  return `${stepNode.title}已完成。`;
}

function markStepCompleted(
  workflow: PromptGenerationWorkflowState,
  stepNode: PromptGenerationStepNode,
  artifact: WorkflowArtifact,
) {
  const now = new Date().toISOString();
  const nextWorkflow = updatePhaseStatus(
    updateWorkflowStep(workflow, stepNode.id, (current) => ({
      ...current,
      completedAt: now,
      lastError: null,
      outputPreview: buildStepPreview(stepNode, artifact),
      status: "completed",
    })),
  );

  return applyPromptGenerationWorkflowUpdate(workflow, {
    artifacts: {
      [artifact.key]: artifact,
    },
    phases: nextWorkflow.phases,
    steps: nextWorkflow.steps,
    summary: buildSummaryPatch(nextWorkflow, artifact),
    workflowMeta: {
      currentPhaseId: stepNode.phaseId,
      currentStepId: stepNode.id,
      status: stepNode.id === "assembly" ? "completed" : "running",
      updatedAt: now,
    },
  });
}

function markStepFailed(
  workflow: PromptGenerationWorkflowState,
  stepNode: PromptGenerationStepNode,
  errorMessage: string,
) {
  const now = new Date().toISOString();
  const nextWorkflow = updatePhaseStatus(
    updateWorkflowStep(workflow, stepNode.id, (current) => ({
      ...current,
      completedAt: now,
      lastError: errorMessage,
      outputPreview: errorMessage,
      status: "failed",
    })),
  );

  return applyPromptGenerationWorkflowUpdate(workflow, {
    phases: nextWorkflow.phases,
    steps: nextWorkflow.steps,
    workflowMeta: {
      currentPhaseId: stepNode.phaseId,
      currentStepId: stepNode.id,
      status: "failed",
      updatedAt: now,
    },
  });
}

function buildFinalAssistantSummary(workflow: PromptGenerationWorkflowState) {
  const appName = workflow.summary.appName ?? "当前应用";
  const entryFiles =
    workflow.summary.entryFiles.length > 0
      ? workflow.summary.entryFiles.join("、")
      : "暂未生成入口文件";

  return [
    "应用规划流程已完成。",
    `应用名称：${appName}。`,
    `共完成 ${workflow.summary.completedStepCount}/${workflow.summary.totalStepCount} 个步骤。`,
    `项目组装结果包含 ${workflow.summary.totalFiles} 个文件。`,
    `入口文件：${entryFiles}。`,
  ].join("");
}

export async function runPromptGenerationWorkflow({
  activeFilePath,
  messageText,
  routeContext,
  setPromptGenerationWorkflow,
  workflowMessageId,
  updateMessage,
}: RunPromptGenerationWorkflowOptions) {
  let workflow = createInitialPromptGenerationWorkflowState(messageText);
  setPromptGenerationWorkflow(workflow);

  updateMessage(workflowMessageId, {
    status: "streaming",
    text: "Prompt 生成流程执行中。",
  });

  for (const stepNode of PROMPT_GENERATION_STEP_NODES) {
    let successArtifact: WorkflowArtifact | null = null;
    let lastError = "";

    for (let attempt = 1; attempt <= stepNode.maxAttempts; attempt += 1) {
      workflow = markStepRunning(workflow, stepNode, attempt);
      setPromptGenerationWorkflow(workflow);

      updateMessage(workflowMessageId, {
        text:
          attempt > 1
            ? `${stepNode.title} 第 ${attempt} 次重试中。`
            : `${stepNode.title} 执行中。`,
      });

      const dependencyArtifacts = stepNode.inputArtifactKeys
        .map((key) => workflow.artifacts[key])
        .filter(isArtifactEnvelope);
      const latestStep = workflow.steps.find((step) => step.id === stepNode.id);

      if (!latestStep) {
        lastError = `缺少步骤状态：${stepNode.id}`;
        continue;
      }

      const retryInstruction =
        attempt > 1 ? buildPromptGenerationRetryInstruction(attempt - 1, lastError) : null;
      const context = {
        dependencyArtifacts,
        retryInstruction,
        step: latestStep,
        stepDefinition: stepNode,
        stepNode,
        userPrompt: messageText,
        workflow,
      };

      try {
        const rawContent = await generateStructuredWorkflowStep({
          profile: routeContext.profile ?? "local",
          provider: routeContext.provider ?? "ollama",
          stepId: stepNode.id,
          systemPrompt: stepNode.buildSystemPrompt(context),
          userPrompt: [
            stepNode.buildUserPrompt(context),
            activeFilePath ? `当前文件：${activeFilePath}` : "",
          ]
            .filter(Boolean)
            .join("\n\n"),
        });
        const schema = getPromptGenerationArtifactSchema(stepNode.outputArtifactKey);

        if (!schema) {
          throw new Error(`未找到节点 schema：${stepNode.outputArtifactKey}`);
        }

        const parsedData = parseStructuredOutput(rawContent, schema);

        successArtifact = {
          key: stepNode.outputArtifactKey,
          sourceStepId: stepNode.id,
          updatedAt: new Date().toISOString(),
          data: parsedData,
        };
        break;
      } catch (error) {
        lastError =
          error instanceof Error ? error.message : "结构化输出解析失败。";
        workflow = applyPromptGenerationWorkflowUpdate(workflow, {
          workflowMeta: {
            status: attempt < stepNode.maxAttempts ? "retrying" : "failed",
            updatedAt: new Date().toISOString(),
          },
        });
        setPromptGenerationWorkflow(workflow);
      }
    }

    if (!successArtifact) {
      workflow = markStepFailed(workflow, stepNode, lastError);
      setPromptGenerationWorkflow(workflow);
      updateMessage(workflowMessageId, {
        status: "error",
        text: `${stepNode.title}失败：${lastError}`,
      });
      throw new Error(lastError);
    }

    workflow = markStepCompleted(workflow, stepNode, successArtifact);
    setPromptGenerationWorkflow(workflow);
    updateMessage(workflowMessageId, {
      text: buildStepPreview(stepNode, successArtifact),
    });
  }

  const finalMessage = buildFinalAssistantSummary(workflow);
  updateMessage(workflowMessageId, {
    status: "done",
    text: "Prompt 生成流程已完成。",
  });

  return {
    finalMessage,
    workflow,
  };
}

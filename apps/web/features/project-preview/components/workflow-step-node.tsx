"use client";

import { getPromptGenerationStepDefinition } from "@figame/agent-core";
import type { WorkbenchChatMessage } from "../state/workbench-routing-types";
import { useWorkbenchRoutingStore } from "../state/use-workbench-routing-store";

type WorkflowStepNodeProps = {
  message: WorkbenchChatMessage;
};

function ThinkingBar() {
  return (
    <div className="h-1 overflow-hidden bg-[var(--workbench-accent-soft)]">
      <div className="h-full w-1/3 animate-[workflow-slide_1.2s_ease-in-out_infinite] bg-[var(--workbench-accent)]" />
    </div>
  );
}

function getWorkflowBadge(status: string) {
  switch (status) {
    case "completed":
      return "已完成";
    case "failed":
      return "执行失败";
    case "retrying":
      return "重试中";
    case "running":
    case "planning":
      return "执行中";
    default:
      return "等待中";
  }
}

function getWorkflowBadgeTone(status: string) {
  switch (status) {
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "failed":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-[var(--workbench-accent-soft)] bg-[var(--workbench-accent-soft)] text-[var(--workbench-accent-strong)]";
  }
}

function getStepStatusText(status: string, isActive: boolean) {
  if (status === "completed") {
    return "完成";
  }

  if (status === "failed") {
    return "失败";
  }

  if (isActive || status === "running") {
    return "执行中";
  }

  return "等待";
}

function getStepTone(status: string, isActive: boolean) {
  if (status === "completed") {
    return "border-emerald-500 bg-emerald-500";
  }

  if (status === "failed") {
    return "border-rose-500 bg-rose-500";
  }

  if (isActive || status === "running") {
    return "border-[var(--workbench-accent)] bg-[var(--workbench-accent)]";
  }

  return "border-[var(--workbench-line)] bg-[var(--workbench-surface)]";
}

export function WorkflowStepNode({ message }: WorkflowStepNodeProps) {
  const workflow = useWorkbenchRoutingStore(
    (state) => state.promptGenerationWorkflow,
  );
  const updateMessage = useWorkbenchRoutingStore((state) => state.updateMessage);

  if (!workflow || !message.workflowNode) {
    return null;
  }

  const { workflowNode } = message;
  const collapsed = workflowNode.collapsed ?? false;
  const canCollapse = workflowNode.canCollapse ?? false;
  const activeStepId = workflow.workflowMeta.currentStepId;
  const activePhaseId = workflow.workflowMeta.currentPhaseId;
  const failedStep = workflow.steps.find((step) => step.status === "failed");
  const activePhase = workflow.phases.find((phase) => phase.id === activePhaseId);
  const visibleSteps = workflow.steps.filter(
    (step) => step.status !== "pending" || step.attemptCount > 0,
  );

  const toggleCollapsed = () => {
    if (!canCollapse) {
      return;
    }

    updateMessage(message.id, {
      workflowNode: {
        ...workflowNode,
        collapsed: !collapsed,
      },
    });
  };

  return (
    <section className="mr-auto max-w-[96%] border border-[var(--workbench-line)] bg-[var(--workbench-surface)]">
      <button
        className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left"
        disabled={!canCollapse}
        onClick={toggleCollapsed}
        type="button"
      >
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--workbench-muted)]">
            应用生成流程
          </p>
          <h3 className="mt-1 text-sm font-semibold text-[var(--workbench-text)]">
            {workflowNode.summaryTitle ?? workflow.summary.appName ?? "应用生成流程"}
          </h3>
          <p className="mt-2 text-sm text-[var(--workbench-muted)]">
            {workflowNode.summaryDetail ??
              `当前阶段：${activePhase?.title ?? "等待开始"}，已完成 ${workflow.summary.completedStepCount}/${workflow.summary.totalStepCount} 步`}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div
            className={[
              "border px-2 py-1 text-xs font-medium",
              getWorkflowBadgeTone(workflow.workflowMeta.status),
            ].join(" ")}
          >
            {getWorkflowBadge(workflow.workflowMeta.status)}
          </div>
          {canCollapse ? (
            <div className="text-xs text-[var(--workbench-muted)]">
              {collapsed ? "展开" : "收起"}
            </div>
          ) : null}
        </div>
      </button>

      {collapsed ? null : (
        <>
          {workflow.workflowMeta.status === "running" ||
          workflow.workflowMeta.status === "planning" ||
          workflow.workflowMeta.status === "retrying" ? (
            <ThinkingBar />
          ) : null}

          <div className="border-t border-[var(--workbench-line)] bg-[var(--workbench-surface-alt)] px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              {workflow.phases.map((phase) => {
                const isActive = phase.id === activePhaseId;

                return (
                  <span
                    className={[
                      "border px-2 py-1 text-xs font-medium",
                      isActive
                        ? "border-[var(--workbench-accent)] bg-[var(--workbench-accent-soft)] text-[var(--workbench-accent-strong)]"
                        : "border-[var(--workbench-line)] bg-[var(--workbench-surface)] text-[var(--workbench-muted)]",
                    ].join(" ")}
                    key={phase.id}
                  >
                    {phase.title}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 px-4 py-4">
            {visibleSteps.map((step) => {
              const isActive = step.id === activeStepId;
              const stepDefinition = getPromptGenerationStepDefinition(step.id);

              return (
                <div className="flex gap-3" key={step.id}>
                  <div className="flex flex-col items-center">
                    <span
                      className={[
                        "mt-1 block h-3 w-3 border-2",
                        getStepTone(step.status, isActive),
                      ].join(" ")}
                    />
                    <span className="mt-2 h-full w-px bg-[var(--workbench-line)]" />
                  </div>

                  <div className="min-w-0 flex-1 border-b border-[var(--workbench-line)] pb-4 last:border-b-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--workbench-muted)]">
                          {workflow.phases.find((phase) => phase.id === step.phaseId)?.title}
                        </p>
                        <p className="mt-1 text-sm font-medium text-[var(--workbench-text)]">
                          {step.title}
                        </p>
                        {step.outputPreview ? (
                          <p className="mt-2 text-sm leading-6 text-[var(--workbench-muted)]">
                            {step.outputPreview}
                          </p>
                        ) : null}
                      </div>
                      <div className="shrink-0 border border-[var(--workbench-line)] bg-[var(--workbench-surface)] px-2 py-1 text-xs text-[var(--workbench-muted)]">
                        {getStepStatusText(step.status, isActive)}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-[var(--workbench-muted)]">
                      <span>
                        尝试 {step.attemptCount}/{stepDefinition?.maxAttempts ?? 3}
                      </span>
                      <span className="font-mono">{step.id}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {failedStep?.lastError ? (
            <div className="border-t border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {failedStep.lastError}
            </div>
          ) : null}
        </>
      )}

      <style jsx>{`
        @keyframes workflow-slide {
          0% {
            transform: translateX(-110%);
          }
          100% {
            transform: translateX(320%);
          }
        }
      `}</style>
    </section>
  );
}

"use client";

import { useEffect, useMemo, useRef } from "react";
import { buildInputEnvelope } from "../services/build-input-envelope";
import { createStreamTextQueue } from "../services/create-stream-text-queue";
import {
  buildRoutingFailureReply,
  buildRoutingNode,
  createPendingRoutingNode,
  createRouteContext,
  runWorkbenchRouting,
} from "../services/run-workbench-routing";
import { runPromptGenerationWorkflow } from "../services/run-prompt-generation-workflow";
import { streamWorkbenchAgentReply } from "../services/stream-workbench-agent-reply";
import type {
  WorkbenchChatHistoryItem,
  WorkbenchChatMessage,
} from "../state/workbench-routing-types";
import { useWorkbenchRoutingStore } from "../state/use-workbench-routing-store";
import { ChatComposer } from "./chat-composer";
import { RoutingAnalysisNode } from "./routing-debug-panel";
import { WorkflowStepNode } from "./workflow-step-node";

type ChatSidebarPlaceholderProps = {
  activeFilePath?: string;
};

function createMessageId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatAssistantHtml(text: string) {
  if (!text.trim()) {
    return "<p></p>";
  }

  return text
    .split(/\n{2,}/)
    .map(
      (paragraph) =>
        `<p>${escapeHtml(paragraph).replaceAll("\n", "<br />")}</p>`,
    )
    .join("");
}

function isNearBottom(element: HTMLDivElement, threshold = 72) {
  const distanceToBottom =
    element.scrollHeight - element.scrollTop - element.clientHeight;

  return distanceToBottom <= threshold;
}

function getMessageChrome(message: WorkbenchChatMessage) {
  if (message.kind === "routing" || message.kind === "workflow") {
    return "";
  }

  switch (message.role) {
    case "user":
      return "ml-auto max-w-[88%] border border-[var(--workbench-chrome)] bg-[var(--workbench-chrome)] text-white";
    case "assistant":
      return "mr-auto max-w-[94%] border border-[var(--workbench-line)] bg-[var(--workbench-surface)] text-[var(--workbench-text)]";
    default:
      return "mx-auto max-w-[94%] border border-amber-200 bg-amber-50 text-amber-900";
  }
}

function getRoleLabel(message: WorkbenchChatMessage) {
  switch (message.role) {
    case "user":
      return "你";
    case "assistant":
      return message.status === "streaming" ? "助手回复中" : "Figame";
    default:
      return "系统";
  }
}

function buildModelHistory(messages: WorkbenchChatMessage[]) {
  return messages.reduce<WorkbenchChatHistoryItem[]>((result, message) => {
    if (
      message.kind !== "text" ||
      (message.role !== "assistant" && message.role !== "user") ||
      message.id === "assistant-welcome"
    ) {
      return result;
    }

    result.push({
      content: message.text,
      role: message.role,
    });

    return result;
  }, []);
}

export function ChatSidebarPlaceholder({
  activeFilePath,
}: ChatSidebarPlaceholderProps) {
  const composerHtml = useWorkbenchRoutingStore((state) => state.composerHtml);
  const messages = useWorkbenchRoutingStore((state) => state.messages);
  const executionStatus = useWorkbenchRoutingStore(
    (state) => state.executionStatus,
  );
  const setComposerHtml = useWorkbenchRoutingStore(
    (state) => state.setComposerHtml,
  );
  const clearComposer = useWorkbenchRoutingStore((state) => state.clearComposer);
  const appendMessage = useWorkbenchRoutingStore((state) => state.appendMessage);
  const updateMessage = useWorkbenchRoutingStore((state) => state.updateMessage);
  const removeMessage = useWorkbenchRoutingStore((state) => state.removeMessage);
  const setExecutionStatus = useWorkbenchRoutingStore(
    (state) => state.setExecutionStatus,
  );
  const applyRoutingSnapshot = useWorkbenchRoutingStore(
    (state) => state.applyRoutingSnapshot,
  );
  const setPromptGenerationWorkflow = useWorkbenchRoutingStore(
    (state) => state.setPromptGenerationWorkflow,
  );

  const messageViewportRef = useRef<HTMLDivElement | null>(null);
  const shouldAutoScrollRef = useRef(true);

  const canInteract = useMemo(
    () => executionStatus !== "analyzing" && executionStatus !== "running",
    [executionStatus],
  );

  useEffect(() => {
    const viewport = messageViewportRef.current;

    if (!viewport || !shouldAutoScrollRef.current) {
      return;
    }

    viewport.scrollTop = viewport.scrollHeight;
  }, [messages]);

  const handleSubmit = async ({
    html,
    text,
  }: {
    html: string;
    text: string;
  }) => {
    const trimmedText = text.trim();

    if (!trimmedText || !canInteract) {
      return;
    }

    const createdAt = new Date().toISOString();
    const userMessageId = createMessageId("user");
    const routingMessageId = createMessageId("routing");
    const assistantMessageId = createMessageId("assistant");
    const workflowMessageId = createMessageId("workflow");
    const history = buildModelHistory(messages);

    shouldAutoScrollRef.current = true;

    appendMessage({
      id: userMessageId,
      role: "user",
      kind: "text",
      html,
      text: trimmedText,
      createdAt,
      status: "done",
    });

    appendMessage({
      id: routingMessageId,
      role: "system",
      kind: "routing",
      html: "",
      text: "正在分析当前请求。",
      createdAt,
      status: "streaming",
      routingNode: createPendingRoutingNode(),
    });

    appendMessage({
      id: assistantMessageId,
      role: "assistant",
      kind: "text",
      html: "",
      text: "",
      createdAt,
      status: "streaming",
    });

    clearComposer();
    setExecutionStatus("analyzing");

    const envelope = buildInputEnvelope({
      messageText: trimmedText,
      hasOpenTemplate: true,
      activeFilePath,
    });

    const snapshot = runWorkbenchRouting(envelope);
    applyRoutingSnapshot(snapshot);

    updateMessage(routingMessageId, {
      routingNode: buildRoutingNode(snapshot),
    });

    const hasPromptSource = envelope.sources.some((source) => source.kind === "prompt");
    let routingNodeVisible = true;

    if (
      snapshot.routingDecision?.accepted?.intent === "create_from_prompt" &&
      snapshot.activeFlowId
    ) {
      try {
        removeMessage(assistantMessageId);

        if (routingNodeVisible) {
          removeMessage(routingMessageId);
          routingNodeVisible = false;
        }

        appendMessage({
          id: workflowMessageId,
          role: "system",
          kind: "workflow",
          html: "",
          text: "应用生成流程执行中。",
          createdAt,
          status: "streaming",
          workflowNode: {
            workflowId: workflowMessageId,
            collapsed: false,
            canCollapse: false,
            summaryTitle: null,
            summaryDetail: null,
          },
        });

        setExecutionStatus("running");

        const result = await runPromptGenerationWorkflow({
          activeFilePath,
          messageText: trimmedText,
          routeContext: createRouteContext(snapshot, activeFilePath),
          setPromptGenerationWorkflow,
          workflowMessageId,
          updateMessage,
        });

        appendMessage({
          id: createMessageId("assistant"),
          role: "assistant",
          kind: "text",
          html: `<p>${result.finalMessage}</p>`,
          text: result.finalMessage,
          createdAt: new Date().toISOString(),
          status: "done",
        });

        updateMessage(workflowMessageId, {
          status: "done",
          workflowNode: {
            workflowId: workflowMessageId,
            collapsed: true,
            canCollapse: true,
            summaryTitle: result.workflow.summary.appName ?? "应用生成流程",
            summaryDetail: `已完成 ${result.workflow.summary.completedStepCount}/${result.workflow.summary.totalStepCount} 步，生成 ${result.workflow.summary.totalFiles} 个文件`,
          },
        });

        setExecutionStatus("idle");
      } catch (error) {
        updateMessage(workflowMessageId, {
          status: "error",
          workflowNode: {
            workflowId: workflowMessageId,
            collapsed: false,
            canCollapse: false,
            summaryTitle: "应用生成流程失败",
            summaryDetail:
              error instanceof Error ? error.message : "流程执行失败，请稍后重试",
          },
        });
        setExecutionStatus("error");
      }

      return;
    }

    if (!snapshot.routingDecision?.accepted || !snapshot.activeFlowId) {
      if (!hasPromptSource) {
        const failureReply = buildRoutingFailureReply(snapshot);

        updateMessage(assistantMessageId, {
          html: failureReply.html,
          text: failureReply.text,
          status: "error",
        });
        removeMessage(routingMessageId);
        setExecutionStatus("error");
        return;
      }

      if (routingNodeVisible) {
        removeMessage(routingMessageId);
        routingNodeVisible = false;
      }
    }

    setExecutionStatus("running");

    let latestText = "";
    const streamTextQueue = createStreamTextQueue({
      onUpdate: (value) => {
        updateMessage(assistantMessageId, {
          html: formatAssistantHtml(value),
          text: value,
          status: "streaming",
        });
      },
    });

    try {
      const streamedText = await streamWorkbenchAgentReply(
        {
          activeFilePath,
          history,
          messageText: trimmedText,
          routeContext: createRouteContext(snapshot, activeFilePath),
        },
        {
          onChunk: (value) => {
            latestText += value;

            if (routingNodeVisible) {
              removeMessage(routingMessageId);
              routingNodeVisible = false;
            }

            streamTextQueue.push(value);
          },
        },
      );

      latestText = streamedText || "模型没有返回内容。";

      if (routingNodeVisible) {
        removeMessage(routingMessageId);
      }

      streamTextQueue.flush(latestText);
      updateMessage(assistantMessageId, {
        html: formatAssistantHtml(latestText),
        text: latestText,
        status: "done",
      });
      setExecutionStatus("idle");
    } catch (error) {
      streamTextQueue.stop();

      const message =
        error instanceof Error ? error.message : "模型桥接失败，请检查本地服务。";

      if (routingNodeVisible) {
        removeMessage(routingMessageId);
      }

      updateMessage(assistantMessageId, {
        html: `<p>${escapeHtml(message)}</p>`,
        text: message,
        status: "error",
      });
      setExecutionStatus("error");
    }
  };

  return (
    <aside className="hidden h-full min-h-0 w-[430px] shrink-0 overflow-hidden bg-[var(--workbench-panel-muted)] xl:flex xl:flex-col">
      <div
        className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4"
        onScroll={(event) => {
          shouldAutoScrollRef.current = isNearBottom(event.currentTarget);
        }}
        ref={messageViewportRef}
      >
        {messages.map((message) => {
          if (message.kind === "routing" && message.routingNode) {
            return (
              <RoutingAnalysisNode key={message.id} node={message.routingNode} />
            );
          }

          if (message.kind === "workflow" && message.workflowNode) {
            return <WorkflowStepNode key={message.id} message={message} />;
          }

          return (
            <article className={getMessageChrome(message)} key={message.id}>
              <div className="px-4 py-3">
                <div className="flex items-center justify-between gap-3 text-[11px]">
                  <span
                    className={
                      message.role === "user"
                        ? "font-medium text-slate-300"
                        : "font-medium text-[var(--workbench-muted)]"
                    }
                  >
                    {getRoleLabel(message)}
                  </span>
                  <span
                    className={
                      message.role === "user"
                        ? "text-slate-400"
                        : "text-[var(--workbench-muted)]"
                    }
                  >
                    {formatMessageTime(message.createdAt)}
                  </span>
                </div>
                {message.status === "streaming" && !message.html ? (
                  <div className="mt-3 flex items-center gap-2 text-[var(--workbench-muted)]">
                    <span className="h-1.5 w-1.5 animate-pulse bg-[var(--workbench-accent)] [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-pulse bg-[var(--workbench-accent)] [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-pulse bg-[var(--workbench-accent)]" />
                    <span className="ml-1 text-xs">正在思考</span>
                  </div>
                ) : (
                  <>
                    <div
                      className="mt-2 text-sm leading-7"
                      dangerouslySetInnerHTML={{ __html: message.html }}
                    />
                    {message.status === "streaming" ? (
                      <div className="mt-3 h-px overflow-hidden bg-[var(--workbench-accent-soft)]">
                        <div className="h-full w-1/3 animate-[stream-bar_1.1s_ease-in-out_infinite] bg-[var(--workbench-accent)]" />
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="shrink-0 border-t border-[var(--workbench-line)] bg-[var(--workbench-panel)] px-4 py-4">
        <ChatComposer
          disabled={!canInteract}
          onChange={setComposerHtml}
          onSubmit={handleSubmit}
          value={composerHtml}
        />
      </div>

      <style jsx>{`
        @keyframes stream-bar {
          0% {
            transform: translateX(-110%);
          }
          100% {
            transform: translateX(320%);
          }
        }
      `}</style>
    </aside>
  );
}

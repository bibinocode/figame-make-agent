"use client";

import { useEffect, useMemo, useRef } from "react";
import { buildInputEnvelope } from "../services/build-input-envelope";
import {
  buildRoutingFailureReply,
  buildRoutingNode,
  createPendingRoutingNode,
  createRouteContext,
  runWorkbenchRouting,
} from "../services/run-workbench-routing";
import { streamWorkbenchAgentReply } from "../services/stream-workbench-agent-reply";
import type {
  WorkbenchChatHistoryItem,
  WorkbenchChatMessage,
} from "../state/workbench-routing-types";
import { useWorkbenchRoutingStore } from "../state/use-workbench-routing-store";
import { ChatComposer } from "./chat-composer";
import { RoutingAnalysisNode } from "./routing-debug-panel";

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
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br />")}</p>`)
    .join("");
}

function getStatusLabel(status: string) {
  switch (status) {
    case "analyzing":
      return "分析中";
    case "routed":
      return "路由完成";
    case "running":
      return "回复中";
    case "error":
      return "需要补充信息";
    default:
      return "待命中";
  }
}

function getMessageChrome(message: WorkbenchChatMessage) {
  if (message.kind === "routing") {
    return "";
  }

  switch (message.role) {
    case "user":
      return "ml-auto max-w-[88%] rounded-[22px] rounded-br-md bg-slate-950 text-white";
    case "assistant":
      return "mr-auto max-w-[92%] rounded-[22px] rounded-bl-md border border-slate-200 bg-white text-slate-800";
    default:
      return "mx-auto max-w-[94%] rounded-2xl border border-amber-200 bg-amber-50 text-amber-900";
  }
}

function getRoleLabel(message: WorkbenchChatMessage) {
  switch (message.role) {
    case "user":
      return "你";
    case "assistant":
      return message.status === "streaming" ? "助手正在回复" : "助手";
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

  const messageViewportRef = useRef<HTMLDivElement | null>(null);

  const canInteract = useMemo(
    () => executionStatus !== "analyzing" && executionStatus !== "running",
    [executionStatus],
  );

  useEffect(() => {
    const viewport = messageViewportRef.current;

    if (!viewport) {
      return;
    }

    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: "smooth",
    });
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
    const history = buildModelHistory(messages);

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

    if (!snapshot.routingDecision?.accepted || !snapshot.activeFlowId) {
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

    setExecutionStatus("running");

    let routingNodeVisible = true;

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
            if (routingNodeVisible) {
              removeMessage(routingMessageId);
              routingNodeVisible = false;
            }

            updateMessage(assistantMessageId, {
              html: formatAssistantHtml(value),
              text: value,
              status: "streaming",
            });
          },
        },
      );

      if (routingNodeVisible) {
        removeMessage(routingMessageId);
      }

      updateMessage(assistantMessageId, {
        html: streamedText ? formatAssistantHtml(streamedText) : "<p>模型没有返回内容。</p>",
        text: streamedText || "模型没有返回内容。",
        status: "done",
      });
      setExecutionStatus("idle");
    } catch (error) {
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
    <aside className="hidden w-[420px] shrink-0 border-l border-slate-200 bg-[radial-gradient(circle_at_top,#fff8e7,transparent_36%),linear-gradient(180deg,#fcfaf3_0%,#f8f4ea_100%)] xl:flex xl:flex-col">
      <header className="border-b border-slate-200/80 px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">
              AI 工作台
            </p>
            <h2 className="mt-2 text-lg font-semibold text-slate-950">
              创作对话区
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              直接说需求、贴 Figma 链接，系统会先分析路由，再把请求桥接到本地模型。
            </p>
          </div>
          <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 shadow-sm">
            {getStatusLabel(executionStatus)}
          </div>
        </div>
      </header>

      <div
        className="flex-1 space-y-4 overflow-auto px-5 py-5"
        ref={messageViewportRef}
      >
        {messages.map((message) => {
          if (message.kind === "routing" && message.routingNode) {
            return (
              <RoutingAnalysisNode key={message.id} node={message.routingNode} />
            );
          }

          return (
            <article className={getMessageChrome(message)} key={message.id}>
              <div className="px-4 py-3">
                <div className="flex items-center justify-between gap-3 text-[11px]">
                  <span
                    className={
                      message.role === "user" ? "text-slate-300" : "text-slate-400"
                    }
                  >
                    {getRoleLabel(message)}
                  </span>
                  <span className="text-slate-400">
                    {formatMessageTime(message.createdAt)}
                  </span>
                </div>
                <div
                  className="mt-2 text-sm leading-7"
                  dangerouslySetInnerHTML={{ __html: message.html }}
                />
              </div>
            </article>
          );
        })}
      </div>

      <div className="border-t border-slate-200/80 px-5 py-4">
        <ChatComposer
          disabled={!canInteract}
          onChange={setComposerHtml}
          onSubmit={handleSubmit}
          value={composerHtml}
        />
      </div>
    </aside>
  );
}

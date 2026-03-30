"use client";

import { create } from "zustand";
import type {
  WorkbenchChatMessage,
  WorkbenchExecutionStatus,
  WorkbenchRoutingSnapshot,
  WorkbenchRoutingState,
} from "./workbench-routing-types";

const INITIAL_MESSAGES: WorkbenchChatMessage[] = [
  {
    id: "assistant-welcome",
    role: "assistant",
    kind: "text",
    html: "<p>我是 Figame AI 助手。你可以直接描述想法，或者把 Figma 链接粘贴进输入区开始创作。</p>",
    text: "我是 Figame AI 助手。你可以直接描述想法，或者把 Figma 链接粘贴进输入区开始创作。",
    createdAt: new Date("2026-03-30T10:00:00+08:00").toISOString(),
    status: "done",
  },
];

const EMPTY_SNAPSHOT: WorkbenchRoutingSnapshot = {
  normalizedEnvelope: null,
  adapterResults: [],
  intentCandidates: [],
  routingDecision: null,
  activeFlowId: null,
  executionStatus: "idle",
  debugTrace: [],
};

function applyExecutionStatus(
  current: WorkbenchRoutingSnapshot,
  status: WorkbenchExecutionStatus,
): WorkbenchRoutingSnapshot {
  return {
    ...current,
    executionStatus: status,
  };
}

export const useWorkbenchRoutingStore = create<WorkbenchRoutingState>((set) => ({
  composerHtml: "",
  messages: INITIAL_MESSAGES,
  attachments: [],
  promptGenerationWorkflow: null,
  ...EMPTY_SNAPSHOT,
  setComposerHtml(value) {
    set({ composerHtml: value });
  },
  clearComposer() {
    set({ composerHtml: "" });
  },
  appendMessage(value) {
    set((current) => ({
      messages: [...current.messages, value],
    }));
  },
  updateMessage(id, value) {
    set((current) => ({
      messages: current.messages.map((message) =>
        message.id === id ? { ...message, ...value } : message,
      ),
    }));
  },
  removeMessage(id) {
    set((current) => ({
      messages: current.messages.filter((message) => message.id !== id),
    }));
  },
  setAttachments(value) {
    set({ attachments: value });
  },
  applyRoutingSnapshot(value) {
    set(value);
  },
  setPromptGenerationWorkflow(value) {
    set({ promptGenerationWorkflow: value });
  },
  setExecutionStatus(value) {
    set((current) => applyExecutionStatus(current, value));
  },
  resetRouting() {
    set({
      ...EMPTY_SNAPSHOT,
      promptGenerationWorkflow: null,
    });
  },
}));

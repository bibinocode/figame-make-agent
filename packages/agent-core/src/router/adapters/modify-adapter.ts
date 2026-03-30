import type { AdapterResult, AgentInputEnvelope } from "../types";

const MODIFY_PATTERNS = [
  /修改/u,
  /改一下/u,
  /改成/u,
  /调整/u,
  /优化/u,
  /重构/u,
  /修复/u,
  /替换/u,
  /删除/u,
  /补充/u,
  /完善/u,
  /在.*基础上/u,
  /\brefactor\b/i,
  /\bfix\b/i,
  /\bupdate\b/i,
  /\bedit\b/i,
  /\bmodify\b/i,
];

function looksLikeModifyIntent(text: string) {
  return MODIFY_PATTERNS.some((pattern) => pattern.test(text));
}

export function runModifyAdapter(
  envelope: AgentInputEnvelope,
): AdapterResult {
  const promptSource = envelope.sources.find((source) => source.kind === "prompt");

  if (!promptSource || !promptSource.text.trim()) {
    return {
      adapterId: "modify-adapter",
      candidates: [],
      diagnostics: ["No prompt source was available for modify routing."],
    };
  }

  const promptText = promptSource.text.trim();
  const hasWorkspaceContext =
    Boolean(envelope.workspaceContext?.activeFilePath) ||
    Boolean(envelope.workspaceContext?.hasOpenTemplate);

  if (!hasWorkspaceContext || !looksLikeModifyIntent(promptText)) {
    return {
      adapterId: "modify-adapter",
      candidates: [],
      diagnostics: ["Prompt did not match modify intent heuristics."],
    };
  }

  return {
    adapterId: "modify-adapter",
    candidates: [
      {
        adapterId: "modify-adapter",
        intent: "modify_existing_project",
        score: 0.9,
        priority: 20,
        reason: "Detected a request to modify the current project or open file.",
        evidence: [promptText.slice(0, 120)],
        suggestedFlowId: "modify-project",
        suggestedProfile: "local",
        suggestedProvider: "ollama",
        requiredCapabilities: ["chat"],
      },
    ],
    diagnostics: [],
  };
}

import type { AdapterResult, AgentInputEnvelope } from "../types";

export function runPromptAdapter(
  envelope: AgentInputEnvelope,
): AdapterResult {
  const promptSource = envelope.sources.find((source) => source.kind === "prompt");

  if (!promptSource || !promptSource.text.trim()) {
    return {
      adapterId: "prompt-adapter",
      candidates: [],
      diagnostics: ["No prompt source was available for prompt routing."],
    };
  }

  const promptText = promptSource.text.trim();

  return {
    adapterId: "prompt-adapter",
    candidates: [
      {
        adapterId: "prompt-adapter",
        intent: "create_from_prompt",
        score: Math.min(0.92, 0.55 + promptText.length / 500),
        priority: 10,
        reason: "Detected a non-empty prompt input.",
        evidence: [promptText.slice(0, 120)],
        suggestedFlowId: "create-from-prompt",
        suggestedProfile: "local",
        suggestedProvider: "ollama",
        requiredCapabilities: ["chat"],
      },
    ],
    diagnostics: [],
  };
}

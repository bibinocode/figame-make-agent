import type { AdapterResult, AgentInputEnvelope } from "../types";

function isValidFigmaUrl(value: string) {
  try {
    const url = new URL(value);
    return url.hostname.includes("figma.com");
  } catch {
    return false;
  }
}

export function runFigmaLinkAdapter(
  envelope: AgentInputEnvelope,
): AdapterResult {
  const figmaSource = envelope.sources.find(
    (source) => source.kind === "figma_link",
  );

  if (!figmaSource || !figmaSource.url.trim()) {
    return {
      adapterId: "figma-link-adapter",
      candidates: [],
      diagnostics: ["No Figma link was available for Figma routing."],
    };
  }

  const figmaUrl = figmaSource.url.trim();

  if (!isValidFigmaUrl(figmaUrl)) {
    return {
      adapterId: "figma-link-adapter",
      candidates: [],
      diagnostics: [`Rejected non-Figma URL: ${figmaUrl}`],
    };
  }

  return {
    adapterId: "figma-link-adapter",
    candidates: [
      {
        adapterId: "figma-link-adapter",
        intent: "create_from_figma",
        score: 0.98,
        priority: 30,
        reason: "Detected a valid Figma design link.",
        evidence: [figmaUrl],
        suggestedFlowId: "create-from-figma",
        suggestedProfile: "local",
        suggestedProvider: "ollama",
        requiredCapabilities: ["chat"],
      },
    ],
    diagnostics: [],
  };
}

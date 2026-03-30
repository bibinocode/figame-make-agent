import type { AgentInputEnvelope, InputSource } from "@figame/agent-core";

const FIGMA_LINK_PATTERN = /https?:\/\/(?:www\.)?figma\.com\/[^\s<>"']+/gi;

type BuildInputEnvelopeOptions = {
  activeFilePath?: string;
  hasOpenTemplate: boolean;
  messageText: string;
};

function extractFigmaLinks(text: string) {
  return Array.from(new Set(text.match(FIGMA_LINK_PATTERN) ?? []));
}

function stripRecognizedLinks(text: string, links: string[]) {
  if (links.length === 0) {
    return text.trim();
  }

  let normalizedText = text;

  for (const link of links) {
    normalizedText = normalizedText.replace(link, " ");
  }

  return normalizedText.replace(/\s+/g, " ").trim();
}

export function buildInputEnvelope({
  activeFilePath,
  hasOpenTemplate,
  messageText,
}: BuildInputEnvelopeOptions): AgentInputEnvelope {
  const sources: InputSource[] = [];
  const figmaLinks = extractFigmaLinks(messageText);
  const promptText = stripRecognizedLinks(messageText, figmaLinks);

  if (promptText) {
    sources.push({
      kind: "prompt",
      text: promptText,
    });
  }

  for (const link of figmaLinks) {
    sources.push({
      kind: "figma_link",
      url: link,
    });
  }

  return {
    id: `envelope-${Date.now()}`,
    createdAt: new Date().toISOString(),
    sources,
    workspaceContext: {
      hasOpenTemplate,
      activeFilePath,
    },
  };
}

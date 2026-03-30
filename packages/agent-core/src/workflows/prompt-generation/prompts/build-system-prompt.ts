import type { PromptGenerationNodePromptContext } from "../shared/node-types";

export function buildPromptGenerationSystemPrompt(
  context: PromptGenerationNodePromptContext,
) {
  return context.stepNode.buildSystemPrompt(context);
}

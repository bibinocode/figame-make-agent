import type { PromptGenerationNodePromptContext } from "../shared/node-types";

export function buildPromptGenerationUserPrompt(
  context: PromptGenerationNodePromptContext,
) {
  return context.stepNode.buildUserPrompt(context);
}

import type { z } from "zod";
import {
  PromptGenerationStepDefinitionSchema,
  type PromptGenerationNodePromptContext,
  type PromptGenerationStepNode,
} from "./node-types";

type CreatePromptGenerationStepNodeOptions = z.input<
  typeof PromptGenerationStepDefinitionSchema
> & {
  schema: z.ZodTypeAny;
  buildSystemPrompt: (context: PromptGenerationNodePromptContext) => string;
  buildUserPrompt: (context: PromptGenerationNodePromptContext) => string;
};

export function createPromptGenerationStepNode(
  options: CreatePromptGenerationStepNodeOptions,
): PromptGenerationStepNode {
  const definition = PromptGenerationStepDefinitionSchema.parse(options);

  return {
    ...definition,
    schema: options.schema,
    buildSystemPrompt: options.buildSystemPrompt,
    buildUserPrompt: options.buildUserPrompt,
  };
}

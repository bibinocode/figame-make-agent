import { ChatOllama } from "@langchain/ollama";
import type { ResolvedChatModelOptions } from "../../types/runtime";

export function createOllamaChatModel(options: ResolvedChatModelOptions) {
  return new ChatOllama({
    model: options.model,
    temperature: options.temperature,
    baseUrl: options.baseURL,
    streaming: true,
  });
}

import type { ProviderDescriptor } from "../../types/model";
import { createOllamaChatModel } from "./chat";

export const ollamaProviderDescriptor: ProviderDescriptor = {
  id: "ollama",
  capabilities: {
    chat: createOllamaChatModel,
  },
  defaults: {
    baseURL: "http://127.0.0.1:11434",
    structuredMethod: "jsonSchema",
  },
};

import type { ModelConfig } from "../packages/model-provider/src/types/config";

export const modelConfig: ModelConfig = {
  defaultProfile: "main",
  profiles: {
    main: {
      provider: "minimax",
      model: "minimax-m2.7",
      temperature: 0,
      maxTokens: 4096,
    },
    structured: {
      provider: "deepseek",
      model: "deepseek-chat",
      temperature: 0,
      maxTokens: 4096,
      baseURL: "https://api.deepseek.com",
    },
    fast: {
      provider: "openai",
      model: "gpt-4o-mini",
      temperature: 0,
      maxTokens: 2048,
    },
    planner: {
      provider: "minimax",
      model: "minimax-m2.7",
      temperature: 0,
      maxTokens: 4096,
    },
    local: {
      provider: "ollama",
      model: "minimax-m2.7:cloud",
      temperature: 0,
      maxTokens: 4096,
      baseURL: process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434",
    },
  },
  providers: {
    minimax: {
      apiKey: process.env.MINIMAX_API_KEY,
    },
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com",
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
      organization: process.env.OPENAI_ORGANIZATION,
    },
    ollama: {
      apiKey: process.env.OLLAMA_API_KEY ?? "ollama-local",
      baseURL: process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434",
    },
  },
};
